<template>
  <auth-layout pageClass="register-page">
    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10">
        <card>
          <div slot="header" class="text-center">
            <img :src="logo" :alt="logoAlt" class="site-logo" />
            <h3 class="card-title text-center">Nominator Registration</h3>
          </div>
          <div>
            <div class="row">
              <div class="col-12 col-md-12 text-center">
                Thank you for registering.<br />
                You will now recieve an email confirming your registration along
                with a temporary password.
                <br /><br />
                Please log in, change your password and start nominating!
                <br /><br />
                <a class="btn btn-fill btn-info btn-round btn-wd" href="/login"
                  >Click here to login</a
                >
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
  </auth-layout>
</template>
<script>
import AuthLayout from "../Dashboard/Pages/AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";

extend("email", email);
extend("required", required);
extend("min", min);

export default {
  components: {
    AuthLayout,
  },
  data() {
    return {
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
    };
  },
};
</script>
<style></style>
