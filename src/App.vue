<template>
  <div>
    <router-view></router-view>
    <small v-if="showPortalVersion" class="portal-version">
      Version {{ portalVersion }}
    </small>
  </div>
</template>

<script>
export default {
  data() {
    return {
      portalVersion: process.env.VUE_APP_BUILD_VERSION,
    };
  },
  computed: {
    showPortalVersion() {
      return (
        this.portalVersion &&
        this.$store.getters.userIsLoggedIn &&
        this.$route.matched.some((route) => route.meta.requiresAuth)
      );
    },
  },
};
</script>

<style scoped>
.portal-version {
  position: fixed;
  right: 12px;
  bottom: 8px;
  z-index: 1000;
  max-width: calc(100vw - 24px);
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.95);
  color: #666;
  font-size: 11px;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: right;
  pointer-events: none;
}

@media print {
  .portal-version {
    display: none;
  }
}
</style>
