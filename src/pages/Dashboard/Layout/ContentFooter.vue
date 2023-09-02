<template>
  <footer class="footer">
    <div class="container-fluid d-flex flex-wrap justify-content-between">
      <!--
      <nav>
        <ul class="footer-menu">
          <li v-if="checkRole('admin')">
            <router-link :to="{ path: '/admin' }">Dashboard</router-link>
          </li>
        </ul>
      </nav>
      <div class="copyright">
        &copy; Coded with
        <i class="fa fa-heart heart"></i> by
        <a
          href="https://www.jamiebuckell.co.uk/"
          target="_blank"
          rel="noopener"
        >
          JamieBuckell</a
        >.
      </div>
      -->
    </div>
  </footer>
</template>
<script>
export default {
  methods: {
    checkRole(role) {
      return this.userInGroup(role);
    },
  },
};
</script>
<style></style>
