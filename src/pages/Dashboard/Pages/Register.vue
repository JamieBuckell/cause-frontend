<template>
  <auth-layout pageClass="register-page">
    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(submit)">
            <fade-render-transition>
              <card>
                <div slot="header" class="text-center">
                  <img :src="logo" :alt="logoAlt" class="site-logo" />
                  <h3 class="card-title text-center">Register</h3>
                </div>
                <div>
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
                      v-model="firstname"
                    ></fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="lastname"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your Last name"
                      :error="failed ? 'The Last name field is required' : null"
                      :hasSuccess="passed"
                      label="Last name"
                      name="lastname"
                      v-model="lastname"
                    ></fg-input>
                  </ValidationProvider>
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
                      v-model="email"
                    >
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="telephone"
                    rules="required|numeric"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="telephone"
                      placeholder="Your Contact number"
                      :error="
                        failed ? 'The Contact number field is required' : null
                      "
                      :hasSuccess="passed"
                      label="Contact number"
                      name="telephone"
                      v-model="telephone"
                    >
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="organisation"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your Organisation"
                      :error="failed ? 'Your Organisation is required' : null"
                      :hasSuccess="passed"
                      label="Organisation"
                      name="organisation"
                      v-model="organisation"
                    ></fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="department"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your Department"
                      :error="failed ? 'Your Department is required' : null"
                      :hasSuccess="passed"
                      label="Department"
                      name="department"
                      v-model="department"
                    ></fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="position"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your Position"
                      :error="failed ? 'Your Position is required' : null"
                      :hasSuccess="passed"
                      label="Position"
                      name="position"
                      v-model="position"
                    ></fg-input>
                  </ValidationProvider>
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
import AuthLayout from "./AuthLayout.vue";

export default {
  components: {
    FadeRenderTransition,
    AuthLayout,
  },
  data() {
    return {
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      firstname: "",
      lastname: "",
      email: "",
      telephone: "",
      organisation: "",
      department: "",
      position: "",
    };
  },
  methods: {
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
<style></style>
