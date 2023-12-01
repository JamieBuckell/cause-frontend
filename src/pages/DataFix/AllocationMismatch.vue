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

            <!--
            <button
              type="button"
              class="btn btn-fill btn-wd"
              aria-label="Fix Hamper"
              @click="doAddHamper(donorId, hamperId, donor.familyRequestId)"
            >
              Fix Hamper
            </button>
            -->
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
import { addHamper } from "@/api/donors.api";
import Swal from "sweetalert2";

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
    const pData = this.$store.getters.getPlatformData;
    const pFamilyData = this.$store.getters.getPlatformFamilies;

    let errors = 0;
    for (var index = 0; index < pFamilyData.length; index++) {
      const family = pFamilyData[index];
      const allDonors = pData.donors;
      if (family?.allocatedTo && family.allocatedTo != "unallocated") {
        const allocatedDonor = allDonors.find(
          (d) => d.GSI2PK === family.allocatedTo
        );

        if (!allocatedDonor?.PK) {
          errors++;
          this.output += `${
            family?.allocatedTo
          } can not be matched as a donor but is allocated to hamper ${family.GSI2SK.replace(
            "SK#",
            ""
          )}<br />`;
        } else {
          const familyAllocated = allocatedDonor.familyDetails.request.filter(
            (r) =>
              r?.allocation
                ? r.allocation.find(
                    (a) => a.hamperId === family.GSI2SK.replace("SK#", "")
                  )
                : false
          );
          if (!familyAllocated.length) {
            errors++;
            /* *
          this.output += `${family.allocatedTo}: ${
            allocatedDonor.GSI3PK
          } has been allocated ${family.GSI2SK.replace(
            "SK#",
            ""
          )} but it's not showing in their list...<br />`;
          /* */

            let familyRequestId = "";
            allocatedDonor.familyDetails.request;

            for (
              var p = 0;
              p < allocatedDonor.familyDetails.request.length;
              p++
            ) {
              const request = allocatedDonor.familyDetails.request[p];
              if (
                !request?.allocation ||
                request.allocation.length < request.numberOfFamilies
              ) {
                familyRequestId = request.requestId;
              }
            }

            if (!this.fixData[family.allocatedTo]) {
              this.fixData[family.allocatedTo] = {};
            }
            this.fixData[family.allocatedTo].email = allocatedDonor.GSI3PK;
            this.fixData[family.allocatedTo].familyRequestId = familyRequestId;
            if (!this.fixData[family.allocatedTo]?.hamperIds) {
              this.fixData[family.allocatedTo].hamperIds = [];
            }
            this.fixData[family.allocatedTo].hamperIds.push(
              family.GSI2SK.replace("SK#", "")
            );
          }
        }
      }
    }

    for (var j = 0; j < pData.donors.length; j++) {
      const donor = pData.donors[j];
      const donorRequests = donor.familyDetails.request.filter(
        (r) => r?.allocation && r.allocation.length
      );
      if (donorRequests.length) {
        for (var k = 0; k < donorRequests.length; k++) {
          const request = donorRequests[k];
          for (var l = 0; l < request.allocation.length; l++) {
            const allocation = request.allocation[l];

            const family = pFamilyData.find(
              (f) => allocation.hamperId === f.GSI2SK.replace("SK#", "")
            );
            if (!family?.PK) {
              errors++;
              this.output += `${allocation.hamperId} is assigned to the allocation of ${donor.GSI2PK}: ${donor.GSI3PK} but cannot be found as a valid hamper<br />`;
            } else {
              if (family.allocatedTo != donor.GSI2PK) {
                errors++;
                this.output += `${allocation.hamperId} is allocated to ${family.allocatedTo} but is in the allocation of ${donor.GSI2PK}: ${donor.GSI3PK}<br />`;
              }
            }
          }
        }
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
