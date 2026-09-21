const checkIntervalMs = 5 * 60 * 1000;
const currentVersion = process.env.VUE_APP_BUILD_VERSION;

let intervalId;
let checkInProgress = false;
let promptedVersion = null;

const checkForUpdate = async () => {
  if (checkInProgress || !currentVersion) {
    return;
  }

  checkInProgress = true;

  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const { version } = await response.json();
    if (
      !version ||
      version === currentVersion ||
      version === promptedVersion
    ) {
      return;
    }

    promptedVersion = version;
    const shouldReload = window.confirm(
      "A new version of CAUSE Manager is available. Reload now to update?"
    );

    if (shouldReload) {
      window.location.reload();
    }
  } catch (error) {
    // Version checks must never disrupt the application when offline or while
    // a deployment is still propagating through the CDN.
  } finally {
    checkInProgress = false;
  }
};

const checkWhenVisible = () => {
  if (document.visibilityState === "visible") {
    checkForUpdate();
  }
};

export const startVersionCheck = () => {
  if (!currentVersion || intervalId) {
    return;
  }

  checkForUpdate();
  intervalId = window.setInterval(checkForUpdate, checkIntervalMs);
  window.addEventListener("focus", checkForUpdate);
  document.addEventListener("visibilitychange", checkWhenVisible);
};

