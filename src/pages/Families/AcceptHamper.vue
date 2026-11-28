<template>
  <auth-layout pageClass="singular-page no-padding">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(recieveHamper)">
            <div class="accept-loading" v-if="loading">
              <div class="center">
                <div class="spinner-border text-muted" role="status">
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
            </div>
            <fade-render-transition>
              <card>
                <div slot="header" class="text-center">
                  <img :src="logo" :alt="logoAlt" class="site-logo" />
                  <h3 class="card-title text-center">Hamper Scanner</h3>
                </div>

                <div>
                  <p v-if="campaignId" class="text-center">
                    Campaign: {{ campaignName || campaignId }} ({{ campaignId }})
                  </p>
                  <div v-if="!campaignId" class="text-center mb-3">
                    <p>{{ campaignLoading ? 'Loading current campaign…' : 'Current campaign unavailable' }}</p>
                    <button type="button" class="btn btn-info" :disabled="campaignLoading" @click="loadCampaign">Retry campaign</button>
                  </div>
                  <div v-if="cameraError" class="text-center mb-3" role="alert">
                    <p>{{ cameraError }}</p>
                    <button type="button" class="btn btn-info" @click="retryCamera">Retry camera</button>
                  </div>
                  <p v-if="cameraStarting && !cameraError" class="text-center" role="status">Starting camera… If prompted, allow camera access.</p>
                  <qrcode-stream
                    v-if="!cameraError && pageVisible"
                    :key="cameraKey"
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
                  <div v-if="!cameraError" class="text-center mt-2">
                    <button
                      type="button"
                      class="btn btn-info"
                      :disabled="cameraStarting || decoding || loading || submitting || !pageVisible"
                      @click="retryCamera"
                    >Restart camera</button>
                    <p class="small text-muted">If the picture stays blurry, move the phone slightly further away or restart the camera. Your entered details will be kept.</p>
                  </div>


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
                      :disabled="loading || submitting || !campaignId"
                      v-model="hamperId"
                    >
                      <button
                        type="button"
                        :disabled="loading || submitting || !campaignId"
                        slot="addonRight"
                        class="hamper-check"
                        @click.prevent="checkHamperId"
                      >
                        Check
                      </button>
                    </fg-input>
                  </ValidationProvider>

                  <div class="row" v-if="familyUnitTotal !== ''">
                    <div class="col col-5">
                      <strong>Family Unit:</strong>
                    </div>
                    <div class="col col-7">
                      {{ familyUnitTotal }}
                    </div>
                  </div>

                  <div class="row" v-if="familyDynamic !== ''">
                    <div class="col col-12" v-html="familyDynamic"></div>
                  </div>

                  <div class="row" v-if="donorName !== ''">
                    <div class="col col-5">
                      <strong>Donor:</strong>
                    </div>
                    <div class="col col-7">
                      {{ donorName }}
                    </div>
                  </div>

                  <div class="row" v-if="donorCompany !== ''">
                    <div class="col col-5">
                      <strong>Company:</strong>
                    </div>
                    <div class="col col-7">
                      {{ donorCompany }}
                    </div>
                  </div>

                  <ValidationProvider
                    name="numberOfBags"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="number"
                      :error="failed ? 'The number of bags is required' : null"
                      :hasSuccess="passed"
                      label="Number of Bags"
                      name="numberOfBags"
                      v-model="numberOfBags"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                    :disabled="loading || submitting || !campaignId"
                  >
                    Submit
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
import AuthLayout from "src/pages/Dashboard/Pages/AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import { checkHamper, recieveHamper, getScannerCampaign } from "@/api/families.api";
import { QrcodeStream } from "vue-qrcode-reader";
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
      campaignId: "",
      campaignName: "",
      campaignLoading: false,
      cameraError: "",
      cameraStarting: true,
      cameraKey: 0,
      cameraInitAttempt: 0,
      pageVisible: !document.hidden,
      decoding: false,
      messages: [],
      submitting: false,
      camera: "auto",
      showScanConfirmation: false,
      maintenanceMode: false,
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      hamperId: "",
      numberOfBags: "",
      familyUnitTotal: "",
      donorName: "",
      donorCompany: "",
      familyDynamic: "",
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
    clearDetails() {
      this.familyUnitTotal = "";
      this.familyDynamic = "";
      this.donorName = "";
      this.donorCompany = "";
    },
    setMessages(data, fallback) {
      this.messages = data?.messages
        ? Object.values(data.messages).map(error => ({ error }))
        : [{ error: fallback }];
    },
    async loadCampaign() {
      if (this.campaignLoading) return;
      this.campaignLoading = true;
      this.messages = [];
      this.campaignId = "";
      try {
        const { data } = await getScannerCampaign();
        if (!data?.success || !data.campaignId) {
          this.setMessages(data, "Unable to load the current campaign. Please try again.");
          return;
        }
        this.campaignId = data.campaignId;
        this.campaignName = data.campaignName;
      } catch (error) {
        this.setMessages(null, "Unable to load the current campaign. Please check your connection and try again.");
      } finally {
        this.campaignLoading = false;
      }
    },
    async checkHamperId() {
      if (this.loading || this.submitting || !this.campaignId) return false;
      this.loading = true;
      this.numberOfBags = "";
      this.clearDetails();
      this.messages = [];
      const hamperId = this.hamperId.trim().toUpperCase();
      this.hamperId = hamperId;
      try {
        const { data } = await checkHamper({ hamperId, expectedCampaignId: this.campaignId });
        // Ignore a response if the input changed while the request was running.
        if (this.hamperId !== hamperId) return false;
        if (data?.hamperId) {
          this.hamperId = data.hamperId;
          this.numberOfBags = Number(data.bagsReceived) > 0 ? data.bagsReceived : "";
          this.familyUnitTotal = data.familyUnitTotal ?? "";
          this.familyDynamic = data.familyDynamic ?? "";
          this.donorName = data.donor?.name ?? "";
          this.donorCompany = data.donor?.company ?? "";
        }
        if (!data?.success) {
          this.setMessages(data, "Unable to check this hamper. Please try again.");
          return false;
        }
        return true;
      } catch (error) {
        this.setMessages(null, "Unable to check this hamper. Please check your connection and try again.");
        return false;
      } finally {
        this.loading = false;
      }
    },
    async recieveHamper() {
      if (this.submitting || this.loading || this.decoding || !this.campaignId) return;
      if (!this.hamperId.trim() || !Number.isInteger(Number(this.numberOfBags)) || Number(this.numberOfBags) <= 0) {
        this.setMessages(null, "Enter a Hamper ID and a positive whole number of bags.");
        return;
      }
      this.submitting = true;
      this.messages = [];
      this.camera = "off";
      try {
        const { data } = await recieveHamper({
          hamperId: this.hamperId.trim().toUpperCase(),
          noBags: this.numberOfBags,
          expectedCampaignId: this.campaignId,
        });
        if (!data?.success) {
          this.setMessages(data, "Unable to receive this hamper. Please try again.");
          return;
        }
        this.hamperId = "";
        this.numberOfBags = "";
        this.clearDetails();
        await Swal.fire({ title: "Hamper successfully received", timer: 2000, showConfirmButton: false });
      } catch (error) {
        this.setMessages(null, "Unable to confirm receipt. Please check the hamper before trying again.");
      } finally {
        this.submitting = false;
        this.camera = "auto";
      }
    },
    async onInit(promise) {
      const attempt = ++this.cameraInitAttempt;
      this.cameraStarting = this.camera !== "off";
      try {
        await promise;
      } catch (error) {
        if (attempt !== this.cameraInitAttempt) return;
        this.cameraError = "Unable to start the camera. Check camera permissions, then retry or enter the Hamper ID below.";
      } finally {
        if (attempt === this.cameraInitAttempt) this.cameraStarting = false;
      }
    },
    retryCamera() {
      if (this.decoding || this.loading || this.submitting || !this.pageVisible) return;
      this.cameraInitAttempt += 1;
      this.cameraStarting = true;
      this.cameraError = "";
      this.camera = "auto";
      // Remount to release the old stream and open a fresh camera session.
      this.cameraKey += 1;
    },
    onVisibilityChange() {
      this.pageVisible = !document.hidden;
      // Unmount while hidden so iOS does not retain an interrupted stream.
      this.cameraInitAttempt += 1;
      this.cameraStarting = this.pageVisible && !this.cameraError;
    },
    async onDecode(content) {
      if (this.decoding || this.loading || this.submitting || !this.campaignId) return;
      this.decoding = true;
      this.camera = "off";
      this.hamperId = content;
      try {
        this.showScanConfirmation = await this.checkHamperId();
        await this.timeout(this.showScanConfirmation ? 2500 : 500);
      } finally {
        this.showScanConfirmation = false;
        this.decoding = false;
        this.camera = "auto";
      }
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
    this.loadCampaign();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  },
  beforeDestroy() {
    this.cameraInitAttempt += 1;
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  },
};
</script>
<style lang="scss">
.qrcode-stream-camera {
  height: 60vh !important; // or 70–80vh if you prefer
  width: 100%;
  object-fit: cover;
  display: block;
}
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
    border: 0;
    &:disabled { opacity: 0.6; cursor: default; }

    &:hover {
      cursor: pointer;
    }
  }
}

.singular-page {
  form {
    position: relative;
  }
}

.accept-loading {
  padding: 0;
  min-height: 100%;
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  width: 100%;
  z-index: 1000;
  text-align: center;
  .center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .spinner-border {
      z-index: 1001;
      width: 4rem;
      height: 4rem;
      border-width: 0.5em;
    }
  }
}
</style>
