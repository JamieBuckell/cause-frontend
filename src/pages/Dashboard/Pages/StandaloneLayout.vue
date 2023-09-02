<template>
  <div>
    <div class="wrapper-auto">
      <div :data-color="backgroundColor" :class="pageClass">
        <div class="content">
          <div class="container">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    pageClass: {
      type: String,
      default: "login-page",
    },
    backgroundColor: {
      type: String,
      default: "white",
    },
  },
  data() {
    return {};
  },
};
</script>
