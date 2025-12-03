<template>
  <div class="row donors-list">
    <div class="col-12">
      <div class="row" v-if="fixData">
        <div
          v-for="(donor, donorId) in fixData"
          :key="donorId"
          class="col col-12"
        >
          <div
            v-for="(hamperId, i) in donor.hamperIds"
            :key="i"
            class="col col-12"
          >
            {{ donorId }} ({{ donor.email }}): has been allocated
            {{ hamperId }} but it's not showing in their list ({{
              donor.familyRequestId
            }})...

            <button
              type="button"
              class="btn btn-fill btn-wd"
              aria-label="Fix Hamper"
              @click="doAddHamper(donorId, hamperId, donor.familyRequestId)"
            >
              Fix Hamper
            </button>
          </div>
        </div>
      </div>
      <p v-if="!output">Loading</p>
      <p v-else v-html="output"></p>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { listFamilies } from "@/api/families.api";
import { addHamper } from "@/api/donors.api";
import Swal from "sweetalert2";

import moment from "moment";
import { createFamilyDetail } from "src/util/common";

export default {
  components: {},
  props: {},
  data() {
    return {
      output: "",
      fixData: {},
    };
  },
  computed: {},
  methods: {
    async doAddHamper(donorId, hamperId, familyRequestId) {
      const res = await addHamper({
        campaignId: this.$store.getters.getActiveCampaign,
        requestId: familyRequestId,
        hamperId: hamperId,
        donorId: donorId,
      });

      if (res.status === 200) {
        const hamperIndex = this.fixData[donorId].hamperIds.findIndex(
          (hId) => hId === hamperId
        );
        this.fixData[donorId].hamperIds.splice(hamperIndex, 1);

        Swal.fire({
          title: "Success",
          text: "Hamper fixed successfully.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    },
  },
  async mounted() {
    if (!this.isJamie()) {
      this.$router.push("/");
    }

    let familiesData = [];
    if (this.data && typeof this.data === "object") {
      familiesData = this.data;
    } else {
      const familiesResult = await listFamilies(
        this.$store.getters.getActiveCampaign,
        { organisationId: this.organisationId }
      );

      familiesData = familiesResult?.data ?? [];
    }
    const tableData = familiesData.map((f) => ({
      requestId: f?.GSI2PK ?? "",
      allocatedTo: f?.allocatedTo ?? "",
      organisationId: f?.GSI3PK,
      nominatorId: f?.GSI3SK,
      reference: f?.SK ? f.GSI2SK.replace("SK#", "") : "",
      nominatorDetail: f?.nominatorDetail ?? "",
      donorDetail: f?.donorDetail ?? "",
      familyDetail: createFamilyDetail(f?.members),
      totalUnit: f?.totalUnit ?? 0,
      bagsReceived: f?.bagsReceived ?? 0,
      status: f?.status ?? "",
      members: f?.members ?? [],
      receiveStatus: f?.receiveStatus ?? "",
      dateAddedSort: moment(f?.dateAdded).format("YYYYMMDDHHmmss"),
    }));

    let result = tableData ? tableData : [];

    const pData = this.$store.getters.getPlatformData;
    result.map((f) => {
      f.authorised = pData?.nominators
        ? pData.nominators.find((n) => n?.GSI2PK === f?.nominatorId)?.status ===
            "Approved" ?? false
        : false;
      return f;
    });
    if (result.length) {
    }
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
