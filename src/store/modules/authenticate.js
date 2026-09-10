import config from "../../config";
import router from "@/router";
import { getCookie, setCookie } from "@/router";
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
import { migrateUserPool, getMeData } from "@/api/users.api";

import VueJwtDecode from "vue-jwt-decode";

const poolData = {
  UserPoolId: config.poolData.UserPoolIdV2,
  ClientId: config.poolData.ClientIdV2,
};
// Storage: new AmazonCognitoIdentity.CookieStorage({domain: ".cause-foundation.org.uk"})

const getDefaultState = () => {
  return {
    userPool: [],
    authDetails: "",
    userData: "",
    currentUser: {
      username: "",
      fullname: "",
      authenticated: false,
    },
    cognitoUser: null,
    tokens: {
      accessToken: "",
      idToken: "",
      refreshToken: "",
    },
    timestamps: {
      lastAuthenticated: "",
      lastActivity: "",
    },
    errcode: "",
    attributes: ["name"],
  };
};
const state = getDefaultState();

const getters = {
  getStateAttributes: (state) => state.attributes,
  userLastActivity: (state) => state.timestamps.lastActivity,
  userAuthTimestamp: (state) => state.timestamps.lastAuthenticated,
  userIsLoggedIn: (state) => state.currentUser.authenticated,
  usersName: (state) =>
    state.currentUser.authenticated ? state.currentUser.fullname : "Unknown",
  usersEmail: (state) =>
    state.currentUser.username ? state.currentUser.username : "",
  usersGroups: (state) => state.currentUser.groups ?? [],
  token: (state) => state.tokens.idToken ?? "",
};

const mutations = {
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  setLastActivity(state) {
    state.timestamps.lastActivity = Date.now();
  },
  async signOut({ state, dispatch }) {
    if (state) {
      state.currentUser.authenticated = false;
      state.currentUser.fullname = "";
      state.currentUser.username = "";
      state.userPool = [];
      if (state.cognitoUser) {
        const cognitoUser = await dispatch("getCognitoUser");
        cognitoUser.signOut();
      } else {
        state.cognitoUser = null;
      }
    }
  },
  setAttributes(state, attributes) {
    state.attributes = attributes;
    state.currentUser.username = state.attributes.filter(function (Obj) {
      return Obj.Name === "email";
    })[0].Value;
    state.currentUser.fullname = state.attributes.filter(function (Obj) {
      return Obj.Name === "name";
    })[0].Value;
  },
  setNewPasswordAttributes(state, attributes) {
    state.currentUser.username = attributes.email;
    delete attributes.email;
    state.attributes = attributes;
  },
  setUsername(state, payload) {
    state.currentUser.username = payload;
  },
  signIn(state) {
    state.currentUser.authenticated = true;
    const decodedJwt = VueJwtDecode.decode(state.tokens.idToken);
    state.currentUser.groups = decodedJwt["cognito:groups"];
    state.timestamps.lastAuthenticated = Date.now();
  },
  setUserPool(state) {
    state.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  },
  setTokens(state, payload) {
    state.tokens.accessToken = payload.getAccessToken().getJwtToken();
    state.tokens.idToken = payload.getIdToken().getJwtToken();
    state.tokens.refreshToken = payload.getRefreshToken().getToken();
  },
  setAuthChecked(state, timestamp) {
    state.timestamps.lastAuthenticated = timestamp;
  },
  setCognitoUser(state, payload) {
    state.cognitoUser = payload;
  },
  setCognitoDetails(state, authData) {
    state.authDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authData
    );
    state.cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: authData.Username,
      Pool: state.userPool,
    });
  },
  setError(state, payload) {
    state.errcode = payload;
  },
  clearError(state) {
    state.errcode = "";
  },
};

const actions = {
  resetAuthState({ commit }) {
    commit("resetState");
  },
  completeNewPasswordChallenge({ state, commit, dispatch }, authData) {
    state.cognitoUser.completeNewPasswordChallenge(
      authData.Password,
      state.attributes,
      {
        onSuccess: (result) => {
          commit("setTokens", result);
          commit("signIn");
          dispatch("getUserAttributes");
          dispatch("setLogoutTimer", 3600);

          /*
            AWS.config.credentials.refresh(err => {
            if (err) {
                throw err
            } else {
                // do something
            }
            })
          */
          const returnUrl = getCookie("ReturnUrl");
          setCookie("ReturnUrl", "", -1);

          getMeData();

          if (returnUrl && !returnUrl.includes("signin")) {
            router.push(decodeURIComponent(returnUrl));
          } else {
            router.push("/admin");
          }
        },
        mfaSetup: (result) => {
          // console.log(result);
        },
        onFailure: (err) => {
          commit("setError", JSON.stringify(err.code));
        },
      }
    );
  },
  signIn({ state, commit, dispatch }, authData) {
    commit("clearError");
    commit("setUserPool");
    commit("setCognitoDetails", authData);
    state.cognitoUser.authenticateUser(state.authDetails, {
      onSuccess: (result) => {
        if (poolData.UserPoolId === config.poolData.UserPoolId) {
          dispatch("migrateUser", authData);
        }
        commit("setTokens", result);
        commit("signIn");
        const returnUrl = getCookie("ReturnUrl");
        setCookie("ReturnUrl", "", -1);

        dispatch("getUserAttributes");
        dispatch("setLogoutTimer", 3600);

        if (returnUrl && !returnUrl.includes("signin")) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          router.push("/admin");
        }
      },
      newPasswordRequired: function (userAttributes, requiredAttributes) {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        // delete userAttributes.email;
        delete userAttributes.email_verified;
        delete userAttributes.phone_number;

        // store userAttributes
        commit("setNewPasswordAttributes", userAttributes);
        router.push("/set-password");
      },
      mfaSetup: (result) => {
        // console.log(result);
      },
      onFailure: (err) => {
        // UserNotFoundException
        if (
          err.code === "UserNotFoundException" &&
          poolData.UserPoolId === config.poolData.UserPoolIdV2
        ) {
          poolData.UserPoolId = config.poolData.UserPoolId;
          poolData.ClientId = config.poolData.ClientId;
          commit("setUserPool");
          dispatch("signIn", authData);
        } else {
          commit("setError", JSON.stringify(err.code));
        }
      },
    });
  },
  tryAutoSignIn({ state, commit, dispatch }) {
    commit("setUserPool");
    let cognitoUser = state.userPool.getCurrentUser();
    if (cognitoUser != null) {
      commit("setCognitoUser", cognitoUser);
      state.cognitoUser.getSession(function (err, session) {
        if (err) {
          // console.error(JSON.stringify(err))
        } else {
          commit("setTokens", session);
          commit("signIn");
          dispatch("getUserAttributes");
          dispatch("setLogoutTimer", 3600);
        }
      });
    }
  },
  checkAuth({ state, commit }) {
    return state.cognitoUser;
  },
  getUserAttributes({ state, commit }) {
    return new Promise((resolve, reject) => {
      if (state.cognitoUser) {
        state.cognitoUser.getUserAttributes(function (err, attributes) {
          if (err) {
            // console.error(JSON.stringify(err))
            reject(err);
          } else {
            commit("setAttributes", attributes);
            resolve(attributes);
          }
        });
      } else {
        reject("No CognitoUser");
      }
    });
  },
  changePassword(_context, { currentPassword, newPassword }) {
    return new Promise((resolve, reject) => {
      const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error("No authenticated Cognito user"));
        return;
      }

      cognitoUser.getSession((sessionError, session) => {
        if (sessionError || !session || !session.isValid()) {
          reject(sessionError || new Error("Your session has expired"));
          return;
        }

        cognitoUser.changePassword(
          currentPassword,
          newPassword,
          (changeError, result) => {
            if (changeError) {
              reject(changeError);
            } else {
              resolve(result);
            }
          }
        );
      });
    });
  },
  async checkTokenExpiration({ state, commit, dispatch }) {
    const timestamp = Date.now();
    const minutes = 10;
    const waitTime = 60 * minutes * 1000; // Convert Minutes To Milliseconds
    if (timestamp - waitTime >= state.timestamps.lastAuthenticated) {
      const AccessToken = new AmazonCognitoIdentity.CognitoAccessToken({
        AccessToken: state.tokens.accessToken,
      });
      const IdToken = new AmazonCognitoIdentity.CognitoIdToken({
        IdToken: state.tokens.idToken,
      });
      const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
        RefreshToken: state.tokens.refreshToken,
      });
      const sessionData = {
        IdToken: IdToken,
        AccessToken: AccessToken,
        RefreshToken: RefreshToken,
      };
      const cachedSession = new AmazonCognitoIdentity.CognitoUserSession(
        sessionData
      );

      if (!cachedSession.isValid()) {
        return;
      } else {
        const cognitoUser = await dispatch("getCognitoUser");
        cognitoUser.refreshSession(RefreshToken, async (err, session) => {
          if (err) {
            // console.error(JSON.stringify(err))
          } else {
            commit("setTokens", session);
            commit("signIn");
            commit("setAuthChecked", timestamp);
            dispatch("setLogoutTimer", 3600);
          }
        });
      }
    }
  },
  async migrateUser({ state, commit, dispatch }, authData) {
    await migrateUserPool(authData);

    await commit("signOut");

    poolData.UserPoolId = config.poolData.UserPoolIdV2;
    poolData.ClientId = config.poolData.ClientIdV2;
    commit("setUserPool");
    dispatch("signIn", authData);
  },
  setLogoutTimer({ state, commit, dispatch }, expirationTime) {
    setTimeout(() => {
      dispatch("signOut");
    }, expirationTime * 1000);
  },
  signOut({ state, commit }) {
    commit("signOut");
    router.push("/login");
  },
  getCognitoUser: ({ state }) => {
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
      Username: state.currentUser.username ? state.currentUser.username : "",
      Pool: userPool,
    };
    return new AmazonCognitoIdentity.CognitoUser(userData);
  },
};

export const authenticate = {
  state,
  getters,
  mutations,
  actions,
};
