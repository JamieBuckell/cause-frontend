<template>
  <auth-layout pageClass="singular-page no-padding">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(submit)">
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
                  <div v-if="showManual" class="text-center mt-3">
                    <small>Having trouble focusing?</small><br />
                    <qrcode-capture
                      @decode="onDecode"
                      style="margin-top: 0.5rem"
                    />
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
                      pattern="[0-9a-zA-Z\-]*"
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
                    @click.prevent="recieveHamper"
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
import Vue from "vue";
import config from "@/config";
import { FadeRenderTransition } from "src/components/index";
import AuthLayout from "src/pages/Dashboard/Pages/AuthLayout.vue";
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import { checkHamper, recieveHamper } from "@/api/families.api";
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
    QrcodeCapture,
    LAlert,
  },
  data() {
    return {
      showManual: false,
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
    async checkHamperId() {
      this.loading = true;
      this.numberOfBags = "";
      this.hamperId = this.hamperId.toUpperCase();
      this.messages = [];
      const activeCampaign = this.$store.getters?.getActiveCampaign; // HC04JA-047
      const res = await checkHamper({
        hamperId: this.hamperId,
        campaignId:
          activeCampaign && activeCampaign.length
            ? activeCampaign
            : config.portalDefaults.campaign,
      });

      this.loading = false;
      if (!res.data.success) {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      }

      if (res?.data?.hamperId) {
        this.hamperId = res.data.hamperId;
      }

      if (res?.data?.bagsReceived) {
        this.numberOfBags = res.data.bagsReceived;
      }
      if (res?.data?.familyUnitTotal) {
        this.familyUnitTotal = res.data.familyUnitTotal;
      }
      if (res?.data?.donor?.name) {
        this.donorName = res.data.donor.name;
      }
      if (res?.data?.donor?.company && res.data.donor.company != "") {
        this.donorCompany = res.data.donor.company;
      }

      if (res?.data?.familyDynamic) {
        this.familyDynamic = res.data.familyDynamic;
      }

      this.showScanConfirmation = true;
      await this.timeout(2500);
      this.showScanConfirmation = false;
    },
    async recieveHamper() {
      const res = await recieveHamper({
        hamperId: this.hamperId,
        noBags: this.numberOfBags,
        campaignId: this.$store.getters.getActiveCampaign.length
          ? this.$store.getters.getActiveCampaign
          : config.portalDefaults.campaign,
      });
      if (res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      }
      if (res.data.success) {
        this.submitting = false;
        this.hamperId = "";
        this.numberOfBags = "";
        this.familyUnitTotal = "";
        this.familyDynamic = "";

        Swal.fire({
          title: "Hamper successfully received",
          timer: 2000,
          showConfirmButton: false,
        });
      }
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
