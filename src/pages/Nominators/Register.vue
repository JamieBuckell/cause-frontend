<template>
  <auth-layout pageClass="register-page">
    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(handleNominatorRegisterSubmit)">
            <fade-render-transition>
              <card>
                <div slot="header" class="text-center">
                  <img :src="logo" :alt="logoAlt" class="site-logo" />
                  <h3 class="card-title text-center">Nominator Registration</h3>
                </div>
                <div>
                  <div class="row" v-if="messages.length">
                    <div class="col-12">
                      <l-alert type="danger" v-for="m in messages" :key="m">
                        <span v-html="m" />
                      </l-alert>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12 col-md-6">
                      <ValidationProvider
                        name="firstname"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          placeholder="Your First name"
                          :error="
                            failed ? 'The First name field is required' : null
                          "
                          :hasSuccess="passed"
                          label="First name"
                          name="firstname"
                          v-model="nominatorData.firstname"
                        ></fg-input>
                      </ValidationProvider>
                    </div>
                    <div class="col-12 col-md-6">
                      <ValidationProvider
                        name="lastname"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          placeholder="Your Last name"
                          :error="
                            failed ? 'The Last name field is required' : null
                          "
                          :hasSuccess="passed"
                          label="Last name"
                          name="lastname"
                          v-model="nominatorData.lastname"
                        ></fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="email"
                        rules="required|email"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="email"
                          placeholder="Your Email address"
                          :error="failed ? 'The Email field is required' : null"
                          :hasSuccess="passed"
                          label="Email address"
                          name="email"
                          v-model="nominatorData.email"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                    <div class="col-12">
                      <ValidationProvider
                        name="telephone"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="telephone"
                          placeholder="Your Contact number"
                          :error="
                            failed
                              ? 'The Contact number field is required'
                              : null
                          "
                          :hasSuccess="passed"
                          label="Contact number"
                          name="telephone"
                          v-model="nominatorData.telephone"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                  >
                    Register
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
import LAlert from "src/components/Alert";
import AuthLayout from "../Dashboard/Pages/AuthLayout.vue";
import { nominatorRegister } from "@/api/nominators.api";
import { getOrganisationByHash } from "@/api/organisations.api";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import router from "@/router";

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
    const nominatorData = {
      firstname: "",
      lastname: "",
      email: "",
      telephone: "",
      organisationId: "",
    };
    return {
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      nominatorData,
      messages: [],
    };
  },
  methods: {
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    async handleNominatorRegisterSubmit() {
      // showModal.value = false;
      try {
        this.nominatorData.organisationId = this.$route.params.requestId;
        this.nominatorData.hashPassword = this.$route.params.hashPassword;
        const response = await nominatorRegister({
          ...this.nominatorData,
        });
        if (response.status == 400) {
          if (response.data.messages) {
            this.messages = [];
            for (const [key, value] of Object.entries(response.data.messages)) {
              this.messages.push(value);
            }
          }
        } else {
          router.push(`/register/success`);
        }
      } catch (e) {
        if (e.message) {
          this.messages = [];
          this.messages.push(e.message);
        }
      }
    },
  },
  async mounted() {
    this.$store.dispatch("resetAuthState");
    let orgFound = false;
    if (this.$route.params.requestId && this.$route.params.hashPassword) {
      try {
        const res = await getOrganisationByHash(
          this.$route.params.requestId,
          this.$route.params.hashPassword
        );
        orgFound =
          res.data.organisationId &&
          res.data.organisationId == this.$route.params.requestId;
      } catch (e) {}
    }
    if (!orgFound) {
      router.push("/login?error="+encodeURI("This link is invalid, please ensure you've copied the full link correctly and try again. Contact us if this problem persists"));
    }
  },
};
</script>
<style></style>
