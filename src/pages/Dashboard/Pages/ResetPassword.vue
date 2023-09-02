<template>
  <auth-layout pageClass="login-page">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <fade-render-transition>
          <card>
            <div slot="header" class="text-center">
              <img :src="logo" :alt="logoAlt" class="site-logo" />
              <h3 class="card-title text-center">{{resetReceived ? 'Thank You' : 'Password Reset'}}</h3>
            </div>
            <div v-if="messages.length">
              <l-alert type="danger" v-for="m in messages" :key="m">
                <span>{{ getErrorMessage(m) }}</span>
              </l-alert>
            </div>
            <ValidationObserver v-slot="{ handleSubmit }" v-if="!resetReceived">
              <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
              <form @submit.prevent="handleSubmit(submit)" v-if="!verification.hash">
                <div>
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
                      v-model="emailAddress"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                  >
                    Send Reset Password Request
                  </button>
                </div>
              </form>
            </ValidationObserver>
            
            <div class="text-center" v-if="resetReceived">
              <p>
                Your reset request has been submitted.<br /><br />
                If your email exisits within our system, you will shortly recieve an e-mail with instructions on how to reset your password.
              </p>
            </div>
            
            <div class="text-center" v-if="verification.hash">
              <p v-if="loading">Please wait...</p>
              <p v-else>
                Your password has been successfully reset.<br /><br />
                Please check your emails for your new temporary password.
              </p>
            </div>
            <div class="text-center">
              <div class="forgot">
                <router-link to="/login" class="card-category">
                  Back to login
                </router-link>
              </div>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </auth-layout>
</template>
<script>
import { FadeRenderTransition } from "src/components/index";
import AuthLayout from "./AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import LAlert from "src/components/Alert";
import { resetUserPassword, resetUserPasswordCommit } from "@/api/users.api";

extend("email", email);
extend("required", required);
extend("min", min);

export default {
  components: {
    FadeRenderTransition,
    AuthLayout,
    LAlert,
  },
  data() {
    return {
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      emailAddress: "",
      password: "",
      password_confirm: "",

      callback: false,
      showerr: false,
      resend: false,
      errmsg: "",
      username: "",
      valid: false,
      passRules: [
        (v) => !!v || "Password is required",
        (v) => !v || v.length >= 8 || "Password must be at least 8 characters",
      ],
      hidepw: true,
      loader: false,
      loading: false,
      resetReceived: false,
      verification: {
        emailAddress: "",
        hash: ""
      },
      messages: [],
    };
  },
  computed: {
  },
  async mounted() {
    this.verification.emailAddress = this.$route.params.emailAddress;
    this.verification.hash = this.$route.params.verificationHash;

    if (this.verification.hash) {
      this.loading = true;
      const res = await resetUserPasswordCommit(this.verification.emailAddress, this.verification.hash);
      
      if (res?.status != 200 && res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
        this.verification.emailAddress = "";
        this.verification.hash = "";
      }
      this.loading = false;
    }
  },
  methods: {
    async submit() {
      this.messages = [];
      this.loader = "loading";
      const l = this.loader;
      this[l] = !this[l];

      const res = await resetUserPassword(this.emailAddress);

      if (res?.status != 200 && res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      } else {
        this.resetReceived = true;
      }
    },
    async reset() {

    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  watch: {
  },
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
