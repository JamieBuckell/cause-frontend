<template>
  <div class="row nominators-list">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="options"
        listingsType="teamleads"
      >
        <template v-slot:header> All Nominators </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { approveNominator } from "@/api/nominators.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

export default {
  components: { ListingsPage },
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 5,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
    searchKeys: {
      type: Array,
      default: () => [
        "userReference",
        "fullName",
        "lastName",
        "emailAddress",
        "telephoneNumber",
      ],
    },
    allowDelete: {
      type: Boolean,
      default: false,
    },
    allowAuthorise: {
      type: Boolean,
      default: false,
    },
    highlightUnauthorised: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nomData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 5,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      options: {
        columns: [
          {
            prop: "userReference",
            label: "Ref",
            minWidth: 70,
          },
          {
            prop: "nominatorDetail",
            label: "User Details",
            html: true,
            minWidth: 250,
          },
        ],
        searchKeys: this.searchKeys,
        delete: this.allowDelete,
      },
    };
  },
  computed: {
    listingsData() {
      return this?.nomData ?? [];
    },
  },
  methods: {
    async approveNom(nominator) {
      const resApprove = await approveNominator(
        nominator.requestId,
        this.organisationId != ""
          ? this.organisationId
          : nominator.organisationId
      );
      if (resApprove.status == 200 && this.nomData) {
        nominator.status = "Approved";
        nominator.nominatorDetail = this.setNominatorDetail(nominator);
        var foundIndex = this.nomData.findIndex(
          (n) => n.requestId == nominator.requestId
        );
        const updatedData = structuredClone(this.nomData);
        updatedData[foundIndex] = nominator;

        this.nomData = updatedData;
      }
    },
    handleEventBusEvent(requestId) {
      const nominator = this.nomData.find((n) => n.requestId === requestId);

      if (nominator?.requestId) {
        this.approveNom(nominator);
      }
    },
    setNominatorDetail(nominator) {
      let nominatorDetail = `
              <div
                class="${
                  !this.highlightUnauthorised || nominator.status == "Approved"
                    ? ""
                    : "unauthorised"
                }"
              >
                  <div class="row">
                    <div class="col-12">
                      <span class="nominatorName">
                        <strong>
                          ${nominator.firstName}
                          ${nominator.lastName}
                        </strong>
                        -
                        <a href="tel:${nominator.telephoneNumber}">${
        nominator.telephoneNumber
      }</a>
                      </span>`;
      if (nominator.emailAddress) {
        nominatorDetail += `
                      <span class="nominatorEmail">
                        <a href="mailto:${nominator.emailAddress}">${nominator.emailAddress}</a>
                      </span>`;
      }
      nominatorDetail += `
                    </div>
                  </div>`;
      if (this.allowAuthorise && nominator.status != "Approved") {
        nominatorDetail += `
                  <div class="row always-show" v-if="">
                    <div class="col-12">`;
        if (this.allowAuthorise && nominator.status != "Approved") {
          nominatorDetail += `
                      <button
                        type="submit"
                        class="btn btn-info btn-fill pull-right w-100 mt-3"
                        onclick="EventBus.emit('${nominator.requestId}')"
                      >
                        Authorise
                      </button>`;
        }
        nominatorDetail += `
                    </div>
                  </div>`;
      }
      nominatorDetail += `
              </div>
              `;
      return nominatorDetail;
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.userInGroup("teamlead")) {
      this.$router.push("/");
    }

    const res = {}; // await getNominators(this.organisationId != '' ? this.organisationId : false);
    this.nomData = Object.values(res.data);

    this.nomData.map((o) => {
      o.fullName = `${o.firstName} ${o.lastName}`;
      o.nominatorDetail = this.setNominatorDetail(o);
      return true;
    });

    this.nomData.sort((a, b) =>
      b.firstName < a.firstName ? 1 : a.firstName < b.firstName ? -1 : 0
    );

    EventBus.$on("$EventBusEvent", this.handleEventBusEvent);
  },
};
</script>
<style lang="scss">
.nominators-list {
  .nominatorName,
  .nominatorEmail {
    display: block;
  }
}
.el-table__row {
  .unauthorised {
    & > div {
      &:not(.always-show) {
        opacity: 0.3;
      }
    }
  }
}
</style>
