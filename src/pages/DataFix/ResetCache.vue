<template>
  <div class="row donors-list">
    <div class="col-12">
      <p v-if="!output">Resetting Cache. Please Wait</p>
      <p v-else v-html="output"></p>
    </div>
  </div>
</template>
<script>
import Vue from "vue";

export default {
  components: {},
  props: {},
  data() {
    return {
      output: "",
    };
  },
  computed: {},
  methods: {},
  async mounted() {
    this.$store.commit("clearCache");
    this.$store.dispatch("signOut");
  },
};
</script>
<style lang="scss"></style>
