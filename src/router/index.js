import Vue from "vue";
import VueRouter from "vue-router";
import routes from '@/routes/routes';
import { store } from "@/store";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes, 
  linkActiveClass: 'active'
});

router.beforeEach((to, from, next) => {
  const {
    userIsLoggedIn,
  } = store.getters;

  if (userIsLoggedIn) {
    // console.log('User is Logged in...');
  } else {
    if (to.matched.some((route) => route.meta.requiresAuth)) {
      if (!to.path.endsWith("/login") && !to.path.endsWith("/login/password-reset")) {
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

export const setCookie = (
  key,
  value,
  expiresMins
) => {
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
