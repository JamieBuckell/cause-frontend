<template>
  <div
    class="nominator-detail"
    :class="
      this.options.highlight.unauthorised || nominator.status == 'Approved'
        ? ''
        : 'unauthorised'
    "
  >
    <div class="row">
      <div class="col-12">
        <span class="nominatorName">
          <strong>
            {{ nominator.firstName ? nominator.firstName : "" }}
            {{ nominator.lastName ? nominator.lastName : "" }}
          </strong>
          <span v-if="nominator.telephoneNumber" class="nominatorEmail"
            >-
            <a :href="`tel:${nominator.telephoneNumber}`">{{
              nominator.telephoneNumber
            }}</a>
          </span>
        </span>
        <span v-if="nominator.emailAddress" class="nominatorEmail">
          <a :href="`mailto:${nominator.emailAddress}`">{{
            nominator.emailAddress
          }}</a>
        </span>
      </div>
    </div>
    <div
      class="row always-show"
      v-if="
        this.options.highlight.admin &&
        nominator.type &&
        nominator.type === 'team-lead'
      "
    >
      <div class="col-12">
        <span class="team-lead text-secondary">Team Lead</span>
      </div>
    </div>
    <div
      class="row always-show"
      v-if="this.options.authorise && nominator.status != 'Approved'"
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
    nominator: {
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
      if (this.nominator?.requestId) {
        this.$emit("approve", this.nominator.requestId);
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
