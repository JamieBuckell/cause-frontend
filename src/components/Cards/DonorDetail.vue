<template>
  <div class="donor-detail">
    <div class="row">
      <div class="col-12">
        <span class="donorName">
          <strong>
            {{ rowData.donorDetails.firstName }}
            {{ rowData.donorDetails.lastName }}
          </strong>
          <span v-if="rowData.GSI3PK" class="donor-email"
            >-
            <a :href="`mailto:${rowData.GSI3PK}`">{{ rowData.GSI3PK }}</a>
          </span>
          <span
            v-if="rowData.donorDetails.telephone"
            class="donor-telephone detail-block"
          >
            <strong>Telephone: </strong>
            <a :href="`tel:${rowData.donorDetails.telephone}`">{{
              rowData.donorDetails.telephone
            }}</a>
          </span>
          <span
            v-if="rowData.donorDetails.howHeard"
            class="donor-source detail-block"
          >
            <strong>Source:</strong> {{ rowData.donorDetails.howHeard }}
          </span>
        </span>
      </div>
    </div>
    <div class="row always-show" v-if="!rowData.emailVerification.verified">
      <div class="col-6">
        <button
          type="submit"
          class="btn btn-info btn-fill pull-right w-100 mt-3"
          @click="sendVerification"
          v-if="!verificationPending"
          >
          Resend Verification Email
        </button>
      </div>
      <div class="col-6">
        <button
          type="submit"
          class="btn btn-warning btn-fill pull-right w-100 mt-3"
          @click="manualVerification"
          v-if="!verificationPending"
        >
          Manually Verify
        </button>
      </div>
      <div class="col-12">

        <div class="text-center w-100">
          <div
            class="spinner-border text-muted"
            role="status"
            v-if="verificationPending"
          >
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { resendVerification, verifySubscription } from "@/api/donors.api";
import Swal from "sweetalert2";
export default {
  name: "DonorDetail",
  props: {
    rowData: {
      type: Object,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      verificationPending: false,
    };
  },
  methods: {
    async manualVerification() {
      if (this.rowData.GSI2PK) {
        this.verificationPending = true;

        const verification = await verifySubscription(
          this.rowData.GSI3PK,
          "",
          this.$store.getters.getActiveCampaign
        );
      
        if (verification.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Email successfully Verified.",
            timer: 3000,
            showConfirmButton: false,
          });
        }
        this.verificationPending = false;
      }
    },
    async sendVerification() {
      if (this.rowData.GSI2PK) {
        this.verificationPending = true;
        const sent = await resendVerification({
          donorId: this.rowData.GSI2PK,
          campaign: this.$store.getters.getActiveCampaign,
        });
        if (sent.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Verification email sent successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
        }
        this.verificationPending = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.donor-detail {
  .detail-block {
    display: block;
  }

  .donor-mail {
    display: initial !important;
  }

  .donorAdditional {
    padding-top: 10px;
  }
}
</style>
