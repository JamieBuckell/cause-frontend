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
  methods: {},
  async mounted() {
    const pData = this.$store.getters.getPlatformData;

    const familiesResult = await listFamilies(
      this.$store.getters.getActiveCampaign
    );
    const pFamilyData = familiesResult?.data ?? [];

    let errors = 0;
    for (var index = 0; index < pFamilyData.length; index++) {
      const family = pFamilyData[index];
      const familyHamperId = family.GSI2SK.replace("SK#", "");

      if (family?.members && family.members.length) {
        for (var jindex = 0; jindex < family.members.length; jindex++) {
          const member = family.members[jindex];
          if (member?.hamperId && member?.hamperId != familyHamperId) {
            errors++;
            this.output += `${member.hamperId} on member (${member?.who} - ${member?.age} ${member?.ageType}), does not match the hamped id: ${familyHamperId}<br />`;
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
