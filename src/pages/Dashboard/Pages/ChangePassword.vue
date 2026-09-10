<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <ValidationObserver v-slot="{ handleSubmit }" ref="form">
            <form @submit.prevent="handleSubmit(submit)">
              <card title="Change Password">
                <div
                  v-if="message"
                  class="alert"
                  :class="successful ? 'alert-success' : 'alert-danger'"
                  role="alert"
                >
                  {{ message }}
                </div>

                <ValidationProvider
                  name="current password"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <fg-input
                    v-model="currentPassword"
                    type="password"
                    name="current-password"
                    label="Current Password"
                    autocomplete="current-password"
                    :error="errors[0]"
                  />
                </ValidationProvider>

                <ValidationProvider
                  vid="newPassword"
                  name="new password"
                  rules="required|min:8"
                  v-slot="{ errors }"
                >
                  <fg-input
                    v-model="newPassword"
                    type="password"
                    name="new-password"
                    label="New Password"
                    autocomplete="new-password"
                    :error="errors[0]"
                  />
                </ValidationProvider>

                <ValidationProvider
                  name="password confirmation"
                  rules="required|confirmed:newPassword"
                  v-slot="{ errors }"
                >
                  <fg-input
                    v-model="confirmPassword"
                    type="password"
                    name="confirm-password"
                    label="Confirm New Password"
                    autocomplete="new-password"
                    :error="errors[0]"
                  />
                </ValidationProvider>

                <div class="text-right">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info"
                    :disabled="submitting"
                  >
                    {{ submitting ? "Updating..." : "Update Password" }}
                  </button>
                </div>
              </card>
            </form>
          </ValidationObserver>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import { confirmed, min, required } from "vee-validate/dist/rules";

extend("required", required);
extend("min", min);
extend("confirmed", confirmed);

export default {
  data() {
    return {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      submitting: false,
      successful: false,
      message: "",
    };
  },
  methods: {
    async submit() {
      this.submitting = true;
      this.successful = false;
      this.message = "";

      try {
        await this.$store.dispatch("changePassword", {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        });
        this.successful = true;
        this.message = "Your password has been changed.";
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.$nextTick(() => this.$refs.form.reset());
      } catch (error) {
        if (error && error.code === "NotAuthorizedException") {
          this.message = "The current password is incorrect.";
        } else if (error && error.code === "InvalidPasswordException") {
          this.message = "The new password does not meet the password policy.";
        } else if (error && error.code === "LimitExceededException") {
          this.message = "Too many attempts. Please wait and try again.";
        } else {
          this.message = "We could not change your password. Please try again.";
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
