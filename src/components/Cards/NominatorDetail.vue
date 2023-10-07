<template>
  <div
    class="nominator-detail"
    :class="
      this.options.highlight.unauthorised || rowData.status == 'Approved'
        ? ''
        : 'unauthorised'
    "
  >
    <div class="row">
      <div class="col-12">
        <span class="nominatorName">
          <strong>
            {{ rowData.firstName ? rowData.firstName : "" }}
            {{ rowData.lastName ? rowData.lastName : "" }}
          </strong>
          <span v-if="rowData.telephoneNumber" class="nominatorEmail"
            >-
            <a :href="`tel:${rowData.telephoneNumber}`">{{
              rowData.telephoneNumber
            }}</a>
          </span>
        </span>
        <span v-if="rowData.emailAddress" class="nominatorEmail">
          <a :href="`mailto:${rowData.emailAddress}`">{{
            rowData.emailAddress
          }}</a>
        </span>
      </div>
    </div>
    <div
      class="row always-show"
      v-if="
        this.options.highlight.admin &&
        rowData.type &&
        rowData.type === 'team-lead'
      "
    >
      <div class="col-12">
        <span class="team-lead text-secondary">Team Lead</span>
      </div>
    </div>
    <div
      class="row always-show"
      v-if="this.options.authorise && rowData.status != 'Approved'"
    >
      <div class="col-12">
        <button
          type="submit"
          class="btn btn-info btn-fill pull-right w-100 mt-3"
          @click="approveNominator"
        >
          Authorise
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "NominatorDetail",
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
  methods: {
    approveNominator() {
      if (this.rowData?.requestId) {
        this.$emit("approve", this.rowData.requestId);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.unauthorised {
  & > div {
    &:not(.always-show) {
      opacity: 0.3;
    }
  }
}
</style>
