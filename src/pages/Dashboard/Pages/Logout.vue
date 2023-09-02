<template>
  <auth-layout pageClass="login-page">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        ... Please Wait ...
      </div>
    </div>
  </auth-layout>
</template>
<script>
import AuthLayout from "./AuthLayout.vue";

export default {
  components: {
    AuthLayout,
  },
  data() {
    return {};
  },
  mounted() {
    this.$store.dispatch("signOut");
  },
};
</script>
