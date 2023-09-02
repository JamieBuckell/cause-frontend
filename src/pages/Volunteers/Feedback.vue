<template>
  <standalone-layout pageClass="donor-register-page">
    <div
      v-if="isLoading"
      class="loading-full"
      v-loading="isLoading"
      id="loading"
    ></div>

    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10">
        <fade-render-transition>
          <card>
            <div slot="header" class="text-center">
              <img :src="logo" :alt="logoAlt" class="site-logo" />
              <h3 class="card-title text-center">Volunteer Feedback</h3>
              <!--<p v-if="!feedbackRecieved">Your feedback...</p>-->
            </div>
            <ValidationObserver
              v-slot="{ handleSubmit }"
              v-if="!feedbackRecieved"
            >
              <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
              <form @submit.prevent="handleSubmit(handleFeedbackSubmit)">
                <div>
                  <div class="row" v-if="messages.length">
                    <div class="col-12">
                      <l-alert type="danger" v-for="m in messages" :key="m">
                        <span> {{ m }}</span>
                      </l-alert>
                    </div>
                  </div>

                  <ValidationProvider name="name" v-slot="{ passed, failed }">
                    <fg-input
                      label="Your Name (Optional)"
                      type="name"
                      :error="failed ? 'The Name field is invalid' : null"
                      :hasSuccess="passed"
                      name="name"
                      v-model="fullName"
                      class="mb-0"
                    >
                    </fg-input>
                  </ValidationProvider>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="positives"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          label="Positives from volunteering with us"
                          :error="failed ? 'This field is required' : null"
                        >
                          <textarea
                            class="form-control"
                            placeholder="Enter your comments here"
                            rows="8"
                            :hasError="failed"
                            :hasSuccess="passed"
                            name="positives"
                            v-model="positives"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="negatives"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          label="Negatives from volunteering with us"
                          :error="failed ? 'This field is required' : null"
                        >
                          <textarea
                            class="form-control"
                            placeholder="Enter your comments here"
                            rows="8"
                            :hasSuccess="passed"
                            name="negatives"
                            v-model="negatives"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="improvements"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          label="Suggestions for improvement"
                          :error="failed ? 'This field is required' : null"
                        >
                          <textarea
                            class="form-control"
                            placeholder="Enter your comments here"
                            rows="8"
                            :hasSuccess="passed"
                            name="improvements"
                            v-model="improvements"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="skills"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          label="Do you have any contacts/skills/practical help you can offer to grow the charity"
                          :error="failed ? 'This field is required' : null"
                        >
                          <textarea
                            class="form-control"
                            placeholder="Enter your comments here"
                            rows="8"
                            :hasSuccess="passed"
                            name="skills"
                            v-model="skills"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="otherComments"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          label="Other comments"
                          :error="failed ? 'This field is required' : null"
                        >
                          <textarea
                            class="form-control"
                            placeholder="Enter your comments here"
                            rows="8"
                            :hasSuccess="passed"
                            name="otherComments"
                            v-model="otherComments"
                          ></textarea>
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
                    Submit Feedback
                  </button>
                </div>
              </form>
            </ValidationObserver>
            <div v-else>
              <div class="row">
                <div class="col-12 col-md-12 text-center">
                  <p>Thank you for your feedback.</p>
                </div>
              </div>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </standalone-layout>
</template>
<script>
import Vue from 'vue'
import { FadeRenderTransition } from 'src/components/index'
import { Collapse, CollapseItem, Select, Option } from 'element-ui'
import StandaloneLayout from '../Dashboard/Pages/StandaloneLayout.vue'
import { volunteerFeedback } from '@/api/feedback.api'
import { extend } from 'vee-validate'
import {
  required,
  min_value,
  max_value,
  confirmed,
} from 'vee-validate/dist/rules'
import LAlert from 'src/components/Alert'
import { Loading } from 'element-ui'

Vue.use(Loading)

extend('confirmed', confirmed)
extend('required', required)
extend('min_value', min_value)
extend('max_value', max_value)

export default {
  components: {
    LAlert,
    FadeRenderTransition,
    StandaloneLayout,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      fullName: '',
      positives: '',
      negatives: '',
      improvements: '',
      skills: '',
      otherComments: '',
      feedbackRecieved: false,
      isLoading: true,
      maxFamilyDetail: 4,
      logo: '/static/img/cause-foundation-logo.png',
      logoAlt: 'CAUSE Foundation Logo',
      messages: [],
    }
  },
  methods: {
    populateDefaults() {
      this.fullName = ''
      this.positives = ''
      this.negatives = ''
      this.improvements = ''
      this.skills = ''
      this.otherComments = ''
    },
    async handleFeedbackSubmit() {
      try {
        this.isLoading = true
        const response = await volunteerFeedback({
          hamperId: this.$route.params?.hamperId,
          hamperHash: this.$route.params?.hamperHash,
          fullName: this.fullName,
          positives: this.positives,
          negatives: this.negatives,
          improvements: this.improvements,
          skills: this.skills,
          otherComments: this.otherComments,
        })
        if (response.status == 400) {
          this.feedbackRecieved = false
          if (response.data.messages) {
            this.messages = []
            for (const [key, value] of Object.entries(response.data.messages)) {
              this.messages.push(value)
            }
          }
        } else {
          this.feedbackRecieved = true
        }

        this.isLoading = false
      } catch (e) {
        if (e.message) {
          this.messages = []
          this.messages.push(e.message)
        }
      }
    },
  },
  async mounted() {
    this.isLoading = false
    this.populateDefaults()
  },
}
</script>
<style lang="scss">
.loading-full {
  position: initial !important;
}
.form-check-label {
  text-transform: none !important;
}
.marketing-info {
  border-top: none;

  .el-collapse-item {
    .el-collapse-item__header {
      font-weight: 400;
      font-size: 12px;
    }
  }
  .el-collapse-item__content {
    color: #9a9a9a;
  }
}
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
  color: #888888;
}
.form-control:-moz-placeholder {
  color: #888888;
}
.form-control::-webkit-input-placeholder {
  color: #888888;
}
.form-control:-ms-input-placeholder {
  color: #888888;
}
</style>
