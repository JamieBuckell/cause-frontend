<template>
  <standalone-layout pageClass="hamper-feedback-page">
    <div
      v-if="isLoading"
      class="loading-full"
      v-loading="isLoading"
      id="loading"
    ></div>

    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-10">
        <fade-render-transition>
          <card>
            <template #header>
              <div class="letterhead">
                <img :src="logo" :alt="logoAlt" class="site-logo" />
                <div class="title-wrap">
                  <h2 class="card-title">Hamper Feedback</h2>
                  <div class="meta">
                    <span><strong>Date:</strong> {{ issuedDate }}</span>
                  </div>
                </div>
                <p v-if="!feedbackRecieved" class="subtitle">
                  Anonymous feedback to help us improve your hamper experience.
                </p>
              </div>
            </template>

            <validation-observer
              v-slot="{ handleSubmit, invalid }"
              v-if="!feedbackRecieved"
            >
              <form
                @submit.prevent="handleSubmit(handleFeedbackSubmit)"
                novalidate
              >
                <div class="row" v-if="messages.length">
                  <div class="col-12">
                    <l-alert type="danger" v-for="m in messages" :key="m">
                      <span>{{ m }}</span>
                    </l-alert>
                  </div>
                </div>

                <l-alert type="info" class="mb-3 cause-alert">
                  <ul class="privacy-list">
                    <li>We only store your feedback text.</li>
                    <li>
                      Do not include names, addresses, or other personally
                      identifiable information.
                    </li>
                    <li>
                      If you'd like a response, please contact us via the
                      official channels on our website.
                    </li>
                  </ul>
                </l-alert>

                <div class="form-block">
                  <label for="hamperFeedback" class="form-label"
                    >Your feedback <span class="req">*</span></label
                  >

                  <validation-provider
                    name="Feedback"
                    :rules="`required|min:${minChars}|max:${charLimit}`"
                    v-slot="{ errors, valid }"
                    vid="hamperFeedback"
                  >
                    <textarea
                      id="hamperFeedback"
                      class="form-control"
                      :class="{
                        'is-valid': valid,
                        'is-invalid': errors.length,
                      }"
                      :placeholder="`Please provide at least ${minChars} characters of feedback...`"
                      rows="8"
                      v-model="hamperFeedback"
                      aria-describedby="feedbackHelp"
                      maxlength="1200"
                    ></textarea>
                    <small id="feedbackHelp" class="form-text text-muted">
                      {{ charCount }} / {{ charLimit }} characters
                    </small>
                    <div v-if="errors[0]" class="invalid-feedback d-block">
                      {{ errors[0] }}
                    </div>
                  </validation-provider>
                </div>

                <div class="form-block">
                  <ValidationProvider
                    name="Confirmation"
                    rules="required"
                    v-slot="{ errors }"
                    vid="consent"
                  >
                    <div class="form-check">
                      <label class="form-check-label" for="consent">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="consent"
                          v-model="consentChecked"
                        />
                        <span class="form-check-sign"
                          ><span class="check"></span
                        ></span>
                        I confirm I have not included personal information in my
                        message.
                      </label>
                    </div>
                    <div v-if="errors[0]" class="invalid-feedback d-block mt-1">
                      {{ errors[0] }}
                    </div>
                  </ValidationProvider>
                </div>

                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                    :disabled="invalid || !consentChecked || isLoading"
                  >
                    <span v-if="!isLoading">Submit Feedback</span>
                    <span v-else>Submitting…</span>
                  </button>
                </div>
              </form>
            </validation-observer>

            <div v-else class="success-state text-center">
              <div class="seal" aria-hidden="true">✔</div>
              <h4 class="mb-2">Thank you for your feedback.</h4>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </standalone-layout>
</template>

<script>
import Vue from "vue";
import { FadeRenderTransition } from "src/components/index";
import StandaloneLayout from "../Dashboard/Pages/StandaloneLayout.vue";
import { hamperFeedback, hamperFeedbackCheck } from "@/api/feedback.api";
import { extend } from "vee-validate";
import { required, min, max } from "vee-validate/dist/rules";
import LAlert from "src/components/Alert";
import { Loading } from "element-ui";
import { ValidationObserver, ValidationProvider } from "vee-validate";

Vue.use(Loading);

// Vee-validate rules
extend("required", required);
extend("min", min);
extend("max", max);

export default {
  name: "HamperFeedbackOfficial",
  components: {
    LAlert,
    FadeRenderTransition,
    StandaloneLayout,
    ValidationObserver,
    ValidationProvider,
  },
  data() {
    return {
      hamperFeedback: "",
      consentChecked: false,
      feedbackRecieved: false,
      isLoading: true,
      messages: [],
      charLimit: 1200,
      minChars: 5,
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
    };
  },
  computed: {
    charCount() {
      return this.hamperFeedback.length;
    },
    issuedDate() {
      const d = new Date();
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  methods: {
    populateDefaults() {
      this.hamperFeedback = "";
      this.consentChecked = false;
      this.messages = [];
    },
    async handleFeedbackSubmit() {
      try {
        this.isLoading = true;
        const response = await hamperFeedback({
          campaignId: this.$route.params?.campaignId,
          feedback: this.hamperFeedback,
        });

        if (response.status === 400) {
          this.feedbackRecieved = false;
          this.messages = [];
          if (response.data?.messages) {
            for (const [, value] of Object.entries(response.data.messages))
              this.messages.push(value);
          }
        } else {
          this.feedbackRecieved = true;
        }
      } catch (e) {
        this.messages = [];
        if (e?.message) this.messages.push(e.message);
      } finally {
        this.isLoading = false;
      }
    },
  },
  async mounted() {
    if (this.$route.params.hamperId && this.$route.params.hamperHash) {
      const response = await hamperFeedbackCheck({
        hamperId: this.$route.params.hamperId,
        hamperHash: this.$route.params.hamperHash,
      });
      this.feedbackRecieved = response?.data?.hasFeedback;
    }
    this.isLoading = false;
    this.populateDefaults();
  },
};
</script>

<style lang="scss">
.loading-full {
  position: initial !important;
}

.hamper-feedback-page {
  .letterhead {
    text-align: center;

    .site-logo {
      max-height: 70px;
      margin: 0.5rem 0 0.75rem;
    }
    .title-wrap {
      h2 {
        margin-bottom: 0.25rem;
      }
      .meta {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        font-size: 12px;
        color: #6b6b6b;
      }
    }
    .subtitle {
      margin-top: 0.75rem;
      color: #666;
    }
  }

  .form-block {
    margin-bottom: 1rem;
  }
  .form-label {
    font-weight: 600;
    display: inline-block;
    margin-bottom: 0.25rem;
  }
  .req {
    color: #d9534f;
  }

  .form-control {
    color: #252526;
  }
  .is-valid {
    border-color: #2e8f45;
  }
  .is-invalid {
    border-color: #d9534f;
  }

  .privacy-list {
    margin: 0;
    padding-left: 1.1rem;
  }
  .privacy-list li {
    margin: 0.15rem 0;
  }

  .success-state .seal {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin: 0 auto 0.5rem;
    line-height: 64px;
    font-size: 28px;
    background: #eaf5ee;
    color: #2e8f45;
    font-weight: 700;
  }
}

/* Keep your existing palette/overrides */
.card .card-category,
.card label {
  color: #252526;
}
.form-control,
.form-group .el-input__inner,
.el-date-picker .el-input .el-input__inner {
  color: #252526;
}
.form-control::-moz-placeholder {
  color: #888;
}
.form-control:-moz-placeholder {
  color: #888;
}
.form-control::-webkit-input-placeholder {
  color: #888;
}
.form-control:-ms-input-placeholder {
  color: #888;
}
.form-check-label {
  text-transform: none !important;
}
.cause-alert {
  background-color: #009643 !important;
}
</style>
