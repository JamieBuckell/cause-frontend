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
                  <h3 class="card-title text-center">Change Password</h3>
                </div>
                <div>
                  <div
                    class="text-danger invalid-feedback"
                    style="display: block"
                    v-if="errmsg"
                  >
                    {{ errmsg }}
                  </div>
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
                      label="New Password"
                      v-model="password"
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
                      name="password_confirm"
                      label="Confirm New Password"
                      v-model="password_confirm"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                  >
                    Update Password
                  </button>
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
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
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
      /* *
      Contains at least 1 number
      Contains at least 1 special character (^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + =)
      Contains at least 1 uppercase letter
      Contains at least 1 lowercase letter
      /* */
      hidepw: true,
      loader: false,
      loading: false,
      messages: [],
    };
  },
  computed: {
    userCheck: function () {
      return this.$store?.getters?.usersEmail;
    },
    errcode: function () {
      return this.$store.state.authenticate.errcode;
    },
  },
  mounted() {
    const authUserEmail = this.userCheck;
    if (!authUserEmail) {
      this.$router.push({ name: "Login" });
    }
    this.username = authUserEmail;
  },
  methods: {
    submit() {
      this.loader = "loading";
      const l = this.loader;
      this[l] = !this[l];

      var authData = {
        Password: this.password,
        PasswordConfirmed: this.password_confirm,
      };
      this.$store.dispatch("completeNewPasswordChallenge", authData);
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  watch: {
    errcode() {
      this.loader = "loading";
      const l = this.loader;
      this[l] = !this[l];

      if (this.errcode !== "") {
        if (this.errcode === '"InvalidPasswordException"') {
          this.errmsg = "Your password must be a minimum of 8 characters";
        } else if (this.errcode === '"UserNotFoundException"') {
          this.errmsg = "User not found";
        } else if (this.errcode === '"UserNotConfirmedException"') {
          this.$store.commit("setUsername", this.username);
          this.resend = true;
          this.errmsg = "User registration not confirmed";
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
