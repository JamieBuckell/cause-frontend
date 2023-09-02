<template>
  <div class="row donors-list">
    <div class="col-12">
      <p v-if="!output">Loading</p>
      <p v-else v-html="output"></p>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { getDonorsByCampaign } from '@/api/donors.api'
import { getFamilies } from '@/api/families.api'

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit('$EventBusEvent', payload)
    },
  },
})

export default {
  components: {},
  props: {},
  data() {
    return {
      output: '',
    }
  },
  computed: {},
  methods: {},
  async mounted() {
    if (!this.isJamie()) {
      this.$router.push('/')
    }

    const familyData = await getFamilies()
    const donorsData = await getDonorsByCampaign(
      this.$store.getters.getActiveCampaign
    )

    let errors = 0
    for (
      var index = 0;
      index < Object.values(donorsData.data).length;
      index++
    ) {
      const donor = Object.values(donorsData.data)[index]
      const allocatedFamiliesNum = donor?.allocatedFamilies
        ? donor.allocatedFamilies
        : 0

      const allocatedFamilies = Object.values(familyData.data).filter(
        (f) => f.allocatedTo === donor.requestId
      )

      const allocatedFamiliesActual = allocatedFamilies
        ? allocatedFamilies.length
        : 0
      if (allocatedFamiliesNum != allocatedFamiliesActual) {
        errors++
        this.output += `${donor.requestId}: ${donor.email} has been allocated ${allocatedFamiliesActual} families but the system says ${allocatedFamiliesNum}<br />`
      }
    }
    this.output += `<br />Total Errors: ${errors}`

    // Fixed donors
    /* *
    emma.wardcovell@gmail.com has been allocated 1 families but the system says 0
abbie317@hotmail.co.uk has been allocated 2 families but the system says 0
jemmahonzikfinn@outlook.com has been allocated 3 families but the system says 1
rachelharte@ymail.com has been allocated 1 families but the system says 0
jenni_hartley@hotmail.com has been allocated 1 families but the system says 0
gemmaferguson14@gmail.com has been allocated 1 families but the system says 0
nixon4nixon@hotmail.com has been allocated 1 families but the system says 0
apovey40@icloud.com has been allocated 1 families but the system says 0
    /* */

    //console.log(familyData, donorsData)
  },
}
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
