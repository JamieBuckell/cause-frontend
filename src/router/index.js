import Vue from "vue";
import VueRouter from "vue-router";
import routes from "@/routes/routes";
import { store } from "@/store";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes,
  linkActiveClass: "active",
});

// Vue Router 3 rejects promise-based navigation when the destination is the
// current route. Duplicate redirects can legitimately race (for example,
// several 401 responses redirecting to login at once), so do not surface that
// expected outcome as an unhandled error. Other navigation failures must still
// reject so they remain visible and actionable.
const ignoreDuplicatedNavigation = (navigation) =>
  navigation.catch((error) => {
    if (
      VueRouter.isNavigationFailure(
        error,
        VueRouter.NavigationFailureType.duplicated
      )
    ) {
      return router.currentRoute;
    }

    return Promise.reject(error);
  });

const push = router.push.bind(router);
router.push = (location, onComplete, onAbort) => {
  if (onComplete || onAbort) {
    return push(location, onComplete, onAbort);
  }

  return ignoreDuplicatedNavigation(push(location));
};

const replace = router.replace.bind(router);
router.replace = (location, onComplete, onAbort) => {
  if (onComplete || onAbort) {
    return replace(location, onComplete, onAbort);
  }

  return ignoreDuplicatedNavigation(replace(location));
};

router.beforeEach((to, from, next) => {
  const { userIsLoggedIn } = store.getters;

  if (userIsLoggedIn) {
    // console.log('User is Logged in...');
  } else {
    if (to.matched.some((route) => route.meta.requiresAuth)) {
      if (
        !to.path.endsWith("/login") &&
        !to.path.endsWith("/login/password-reset")
      ) {
        const returnUrl = encodeURIComponent(to.fullPath);
        setCookie("ReturnUrl", returnUrl, 10);
      }
      return next({
        path: `/login`,
      });
    }
  }

  next();
});

export const setCookie = (key, value, expiresMins) => {
  const now = new Date();
  now.setTime(now.getTime() + expiresMins * 60 * 1000);
  const expires = now.toUTCString();
  document.cookie = `${key}=${value};expires=${expires};path=/`;
};

export const getCookie = (key) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${key}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
};

export default router;
