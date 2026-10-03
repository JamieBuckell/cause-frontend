// Build optimisation and the deployment environment are independent.
const environment =
  process.env.VUE_APP_ENVIRONMENT ||
  (process.env.NODE_ENV === "production" ? "live" : "dev");

if (!["dev", "live"].includes(environment)) {
  throw new Error(`Unknown deployment environment: ${environment}`);
}

const isLive = environment === "live";
const apiURL = isLive
  ? "https://api.cause-foundation.org.uk/"
  : "https://causeapi.bouchelle.co.uk/";
const portalURL = isLive
  ? "https://portal.cause-foundation.org.uk"
  : process.env.NODE_ENV === "production"
    ? "https://causef.bouchelle.co.uk"
    : "http://localhost:4000";

export { environment, isLive, apiURL, portalURL };
