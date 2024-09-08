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
                  <h3 class="card-title text-center">Hamper Scanner</h3>
                </div>

                <div>
                  <qrcode-stream
                    :camera="camera"
                    @decode="onDecode"
                    @init="onInit"
                    class="qr-code-stream"
                  >
                    <div
                      v-show="showScanConfirmation"
                      class="scan-confirmation"
                    >
                      <img
                        alt="Checkmark"
                        src="/static/img/checkmark.png"
                        width="60%"
                        height="60%"
                        style="margin: auto"
                      />
                    </div>
                  </qrcode-stream>

                  <br />
                  <l-alert
                    type="danger"
                    v-for="(m, idx) in messages"
                    :key="idx"
                  >
                    <span> {{ getErrorMessage(m) }}</span>
                  </l-alert>

                  <ValidationProvider
                    name="hamperId"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <label>Hamper ID</label>

                    <fg-input
                      type="text"
                      :error="failed ? 'The Hamper ID field is required' : null"
                      :hasSuccess="passed"
                      name="hamperId"
                      v-model="hamperId"
                    >
                      <a
                        slot="addonRight"
                        class="hamper-check"
                        @click.prevent="checkHamperId"
                      >
                        Check
                      </a>
                    </fg-input>
                  </ValidationProvider>
                  <div v-if="hamperDetails.reference">
                    <div class="row">
                      <div class="col col-5">
                        <strong>Status:</strong>
                      </div>
                      <div class="col col-7">
                        {{ hamperDetails.receiveStatus }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="col col-5">
                        <strong>Total Bags:</strong>
                      </div>
                      <div class="col col-7">
                        {{ hamperDetails.bagsReceived }}
                      </div>
                    </div>
                    <!--
                    <div class="row">
                      <div class="col col-12 text-center">
                        <button
                          type="submit"
                          class="btn btn-fill btn-danger btn-round btn-wd"
                          @click.prevent="downloadFeedbackPDF"
                        >
                          Download Feedback Label
                        </button>
                      </div>
                    </div>
                    -->
                  </div>
                </div>
                <!--
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                    @click.prevent="checkHamperId"
                  >
                    Submit
                  </button>
                </div>
                -->
              </card>
            </fade-render-transition>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </auth-layout>
</template>
<script>
import Vue from "vue";
import { FadeRenderTransition } from "src/components/index";
import AuthLayout from "src/pages/Dashboard/Pages/AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import { getHamperOverview, getHamperFeedbackLabels } from "@/api/families.api";
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from "vue-qrcode-reader";
import LAlert from "src/components/Alert";
import Swal from "sweetalert2";

extend("email", email);
extend("required", required);
extend("min", min);

export default {
  components: {
    FadeRenderTransition,
    AuthLayout,
    QrcodeStream,
    LAlert,
  },
  data() {
    return {
      messages: [],
      hamperDetails: {},
      submitting: false,
      camera: "auto",
      showScanConfirmation: false,
      maintenanceMode: false,
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      hamperId: "",
      numberOfBags: "",
      callback: false,
      showerr: false,
      resend: false,
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
  methods: {
    async downloadFeedbackPDF() {
      this.messages = [];
      this.hamperDetails.offset = 1000;
      const res = await getHamperFeedbackLabels({
        ...this.hamperDetails,
        campaignId: this.$store.getters.getActiveCampaign,
      });
      if (res.status == 200) {
        const linkSource = `data:application/pdf;base64,${res.data}`;
        const downloadLink = document.createElement("a");
        const fileName = `feedback-slips-pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        this.downloadPending = false;
      } else {
        if (res?.data?.messages) {
          Swal.fire({
            title: "Error",
            text: Object.keys(res?.data?.messages)
              .map((k) => res?.data?.messages[k])
              .join(),
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    },
    async checkHamperId() {
      this.hamperId = this.hamperId.toUpperCase();
      this.messages = [];
      const res = await getHamperOverview(this.hamperId);

      if (!res.data.success) {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      } else {
        this.hamperDetails = res?.data.hamper;
      }

      this.showScanConfirmation = true;
      await this.timeout(2500);
      this.showScanConfirmation = false;
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (e) {
        // console.error(e)
      } finally {
        this.showScanConfirmation = this.camera === "off";
      }
    },

    async onDecode(content) {
      this.hamperId = content;
      await this.checkHamperId();

      this.pause();
      await this.timeout(500);
      this.unpause();
    },

    unpause() {
      this.camera = "auto";
    },

    pause() {
      this.camera = "off";
    },

    timeout(ms) {
      return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  mounted() {
    if (!this.userInGroup("admin")) {
      // this.$router.push('/')
    }
  },
};
</script>
<style lang="scss">
.scan-confirmation {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: rgba(255, 255, 255, 0.8);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}
.input-group-addon {
  padding: 0 !important;
  .hamper-check {
    background: #009643;
    color: #fff;
    padding: 7px 15px;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
