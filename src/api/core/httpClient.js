import { store } from "@/store";
import router from "@/router";
import axios from "axios";

const apiURL =
  process.env.NODE_ENV === "production"
    ? "https://api.cause-foundation.org.uk/"
    : "https://causeapi.bouchelle.co.uk/";
// "https://ig3hly0ga3.execute-api.eu-west-2.amazonaws.com/"

const httpClient = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => store.getters.token;

const authInterceptor = (config) => {
  const auth = getAuthToken();
  if (auth) {
    config.headers["Authorization"] = `${auth}`;
  }
  return config;
};

const errorInterceptor = (error) => {
  if (!error.response) {
    if (error.toString().includes("Network Error")) {
      // store.dispatch("signOut");
      if (process.env.NODE_ENV === "production") {
        router.push({
          path: "/error/unexpected",
        });
      }
    }
    return Promise.reject(error);
  }
  const { response } = error;
  // console.log(error, response);
  switch (error.response.status) {
    case 502:
    case 504:
    case 400:
      if (response.data) {
        return response;
      }
      break;

    case 401:
      router.push({
        path: "/error/access",
      });
      break;

    case 403:
      if (response.config && response.config.url === "/auth/refresh") {
        store.dispatch("signOut");
      } else if (
        response.config &&
        response.config.url !== "/auth/reset-password/auth"
      ) {
        if (process.env.NODE_ENV === "production") {
          router.push({
            path: "/",
          });
        }
      }

    // eslint-disable-next-line no-fallthrough
    default: {
      let errorCode,
        message = "";
      if (response.data?.errorInfo) {
        const { details } = response.data?.errorInfo;
        const obj = details[0];
        errorCode = obj.errorCode;
        message = obj.message;
      } else if (response.data) {
        errorCode = error.response.status;
        message = response.data.messages;
      }

      const err = {
        statusCode: response.status,
        error: response.data?.errorString
          ? response.data?.errorString
          : message,
        code: errorCode,
        message,
      };
      return Promise.reject(err);
    }
  }
};

const requestInterceptor = (request) => {
  return request;
};

const responseInterceptor = (response) => {
  switch (response.status) {
    case 200:
      break;
    default:
  }

  return response;
};

httpClient.interceptors.request.use(requestInterceptor);
httpClient.interceptors.response.use(responseInterceptor, errorInterceptor);
httpClient.interceptors.request.use(authInterceptor);

export { httpClient };
