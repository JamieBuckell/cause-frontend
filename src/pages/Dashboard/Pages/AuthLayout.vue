<template>
  <div>
    <div class="wrapper wrapper-full-page">
      <div class="full-page" :data-color="backgroundColor" :class="pageClass">
        <!--   you can change the color of the filter page using: data-color="blue | azure | green | orange | red | purple | black" -->
        <div class="content">
          <div class="container" v-if="!siteIncompatible">
            <slot></slot>
          </div>
          <div class="container" v-else>
            <div class="row d-flex justify-content-center align-items-center">
              <div class="col-lg-6 col-md-6 col-sm-8">
                <card>
                  <div slot="header" class="text-center">
                    <h3 class="card-title text-center">Unsupported</h3>
                  </div>
                  <div class="text-center">
                    Your browser settings do not support this application.<br />Please <a href="mailto:hampers@cause-foundation.org.uk">contact us</a> to make alternative arrangements.
                  </div>
                </card>
              </div>
            </div>
          </div>
        </div>

        <footer class="footer footer-transparent">
          <div
            class="container d-flex flex-column justify-content-lg-between justify-content-end align-items-end"
          >
            <!--
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

        <div
          class="full-page-background"
          style="background-image: url(/static/img/full-screen-image-6.jpg)"
        ></div>
      </div>
    </div>
  </div>
</template>
<script>
import CollapseTransition from "element-ui/lib/transitions/collapse-transition";

export default {
  components: {
    [CollapseTransition.name]: CollapseTransition,
  },
  props: {
    pageClass: {
      type: String,
      default: "login-page",
    },
    backgroundColor: {
      type: String,
      default: "black",
    },
  },
  data() {
    return {
      showMenu: false,
      siteIncompatible: false
    };
  },
  mounted() {
    this.siteIncompatible = !this.isLocalStorageAvailable();

    // console.log(window.navigator.userAgent);
    // window.navigator.userAgent.indexOf("Edge")
  },
  methods: {
    isLocalStorageAvailable() {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }, 
    toggleNavbar() {
      document.body.classList.toggle("nav-open");
    },
    closeMenu() {
      document.body.classList.remove("nav-open");
      document.body.classList.remove("off-canvas-sidebar");
    },
  },
  beforeDestroy() {
    this.closeMenu();
  },
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
.navbar-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}
.wrapper-full-page .navbar-toggler,
.wrapper-full-page .navbar-collapse .navbar-nav {
  margin-right: 30px;
}
.navbar-collapse .navbar-nav .nav-link {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
