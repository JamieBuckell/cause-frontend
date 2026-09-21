import { store } from "@/store";
import router from "@/router";
import axios from "axios";
import { handledAuthRedirect } from "@/api/core/httpErrors";

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

const getResponseErrorDetails = (response) => {
  if (response.data?.errorInfo?.details?.length) {
    const { errorCode, message } = response.data.errorInfo.details[0];
    return { errorCode, message };
  }

  return {
    errorCode: response.status,
    message: response.data?.messages,
  };
};

const createHttpError = (axiosError, response, authRedirected = false) => {
  const { errorCode, message } = getResponseErrorDetails(response);
  const responseError = response.data?.errorString || message;

  // Keep Axios' Error instance and stack trace while preserving the fields
  // existing callers use to render API error messages.
  axiosError.statusCode = response.status;
  axiosError.error = responseError;
  axiosError.code = errorCode;
  if (typeof message === "string" && message) {
    axiosError.message = message;
  }
  if (authRedirected) {
    axiosError[handledAuthRedirect] = true;
  }

  return axiosError;
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
      return Promise.reject(createHttpError(error, response));
    /*
    case 401:
      router.push({
        path: "/error/access",
      });
      return Promise.reject({
        statusCode: response.status,
        error: response.data?.errorString
          ? response.data?.errorString
          : message,
        code: errorCode,
        message,
      });
      */

    case 401:
    case 403: {
      let authRedirected = false;
      if (response.config && response.config.url === "/auth/refresh") {
        store.dispatch("signOut");
        authRedirected = true;
      } else if (
        response.config &&
        response.config.url !== "/auth/reset-password/auth"
      ) {
        //if (process.env.NODE_ENV === "production") {
        router.push({
          path: "/login",
        });
        //}
        authRedirected = true;
      }

      return Promise.reject(createHttpError(error, response, authRedirected));
    }

    // eslint-disable-next-line no-fallthrough
    default: {
      return Promise.reject(createHttpError(error, response));
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
