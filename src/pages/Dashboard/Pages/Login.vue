<template>
  <auth-layout pageClass="login-page">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(submit)">
            <fade-render-transition>
              <card>
                <div slot="header" class="text-center">
                  <img :src="logo" :alt="logoAlt" class="site-logo" />
                  <h3 class="card-title text-center">
                    {{ maintenanceMode ? "Site Unavailable" : "Login" }}
                  </h3>
                  <div
                    class="text-danger invalid-feedback"
                    style="display: block"
                    v-if="errmsg"
                  >
                    {{ errmsg }}
                  </div>
                </div>
                <div v-if="!maintenanceMode">
                  <ValidationProvider
                    name="email"
                    rules="required|email"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="email"
                      :error="failed ? 'The Email field is required' : null"
                      :hasSuccess="passed"
                      label="Email address"
                      name="email"
                      v-model="email"
                    >
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="password"
                    rules="required|min:5"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="password"
                      :error="failed ? 'The Password field is required' : null"
                      :hasSuccess="passed"
                      name="password"
                      label="Password"
                      v-model="password"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="text-center" v-if="!maintenanceMode">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                  >
                    Login
                  </button>
                  <br />
                  <div class="forgot">
                    <router-link to="/reset-password" class="card-category">
                      Having trouble logging in?<br />Click here to reset your
                      password
                    </router-link>
                  </div>
                </div>
                <div v-else>
                  <p class="text-center">
                    The CAUSE Foundation portal is currently unavailable for
                    maintenance. Please try again later.
                  </p>
                </div>
              </card>
            </fade-render-transition>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </auth-layout>
</template>
<script>
import { FadeRenderTransition } from "src/components/index";
import AuthLayout from "./AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";

extend("email", email);
extend("required", required);
extend("min", min);

export default {
  components: {
    FadeRenderTransition,
    AuthLayout,
  },
  data() {
    return {
      maintenanceMode: false,
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      email: "",
      password: "",
      callback: false,
      showerr: false,
      resend: false,
      errmsg: "",
      valid: false,
      emailrules: {
        required: (value) => !!value || "E-mail is required",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "E-mail must be valid";
        },
      },
      passRules: [
        (v) => !!v || "Password is required",
        (v) => !v || v.length >= 8 || "Password must be at least 8 characters",
      ],
      hidepw: true,
      loader: false,
      loading: false,
    };
  },
  computed: {
    errcode: function () {
      return this.$store.state.authenticate.errcode;
    },
  },
  mounted() {
    this.$store.dispatch("resetAuthState");
    if (this.$route.query.error) {
      this.errmsg = this.$route.query.error;
    }
  },
  methods: {
    async submit() {
      this.loader = "loading";
      const l = this.loader;
      this[l] = !this[l];

      var authData = {
        Username: this.email,
        Password: this.password,
      };
      await this.$store.dispatch("signIn", authData);
    },
    getMessage: function () {
      return this.message;
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
  watch: {
    errcode() {
      this.loader = "loading";
      const l = this.loader;
      this[l] = !this[l];
      if (this.errcode !== "") {
        if (this.errcode === '"NotAuthorizedException"') {
          this.errmsg = "Incorrect username or password";
        } else if (this.errcode === '"UserNotFoundException"') {
          this.errmsg = "User not found";
        } else if (this.errcode === '"UserNotConfirmedException"') {
          this.$store.commit("setUsername", this.email);
          this.resend = true;
          this.errmsg = "User registration not confirmed";
        } else if (this.errcode === '"PasswordResetRequiredException"') {
          this.errmsg = "You must reset your password to continue";
        } else if (this.errcode === '"LimitExceededException"') {
          this.errmsg = "Attempt limit exceeded, please try after some time";
        } else {
          this.errmsg = "An error has occured!";
        }
        this.showerr = true;
      } else {
        this.showerr = false;
      }
      this[l] = false;
      this.loader = null;
    },
  },
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
