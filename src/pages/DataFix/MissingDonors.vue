<template>
  <div class="row donors-list">
    <div class="col-12">
      <p v-if="!output">Loading</p>
      <p v-else v-html="output"></p>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { uuid } from "vue-uuid";

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

export default {
  components: {},
  props: {},
  data() {
    return {
      output: "",
    };
  },
  computed: {},
  methods: {},
  async mounted() {
    if (!this.isJamie()) {
      this.$router.push("/");
    }

    const donorsData = []; //await getDonors()
    const donorsCampaignData = []; /*await getDonorsByCampaign(
      this.$store.getters.getActiveCampaign
    )*/

    let errors = 0;
    let donorCount = 0;
    for (
      var index = 0;
      index < Object.values(donorsData.data).length;
      index++
    ) {
      const donor = Object.values(donorsData.data)[index];

      if (donor?.bounced) {
        continue;
      }

      if (
        donor?.dateSubscribed &&
        donor.dateSubscribed.indexOf("2022-08-27") >= 0 &&
        !donor?.dateAdded
      ) {
        continue;
      }

      const donorsOnly = Object.values(donorsCampaignData.data).filter(
        (dc) => dc.donorId === donor.requestId
      );

      if (donorsOnly && donorsOnly.length > 0) {
        donorCount++;
      } else {
        errors++;
        this.output += `<a href="/donors/view/${donor.requestId}">${donor.email}</a><br />${donor.dateVerified} - ${donor.verified}<br /><br />`;
        this.output += `
        {
          "requestId": {
            "S": "${uuid.v4()}"
          },
          "additionalInfo": {
            "S": ""
          },
          "allocatedFamilies": {
            "N": "0"
          },
          "campaignId": {
            "S": "6fd91723-9316-4502-99cb-0fc6399aed86"
          },
          "donorId": {
            "S": "${donor.requestId}"
          },
          "familyDetail": {
            "S": "[\\"any\\"]"
          },
          "numberOfFamilies": {
            "N": "1"
          }
        }<br /><br />`;
      }
    }

    this.output += `<br />Total Errors: ${errors}`;
  },
};
</script>
<style lang="scss">
.donors-list {
  .donorName,
  .donorEmail,
  .donorTelephone,
  .donorCompany,
  .donorAdditional {
    display: block;
  }

  .donorAdditional {
    padding-top: 10px;
  }
}
</style>
