<template>
  <div class="row donors-list">
    <div class="col-12">
      <p v-if="loading">Loading</p>
      <div>
        <div class="col-12">
          <ListingsPage
            :paginateOptions="pagination"
            :listingsData="listingsData"
            :options="listingsOptions"
            listingsType="families"
            :customActions="getCustomActions"
            @handleCustomAction="handleCustomAction"
            @updateSearch="updateSearch"
          >
            <template v-slot:header>
              Families To Fix ({{ listingsData.length }})
            </template>
          </ListingsPage>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-console */
import Vue from "vue";
import { fixReferences } from "@/api/users.api";
import { getPlatformData } from "@/services/campaignData";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import { Dialog, Select, Option } from "element-ui";
import moment from "moment";

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

export default {
  components: {
    ListingsPage,
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  props: {},
  computed: {
    listingsData() {
      let result = this?.tableData ? this.tableData : [];

      const pData = this.$store.getters.getPlatformData;
      result.map((f) => {
        f.authorised = pData?.nominators
          ? pData.nominators.find((n) => n?.GSI2PK === f?.nominatorId)
              ?.status === "Approved" ?? false
          : false;
        return f;
      });
      if (result.length) {
        if (this.filters.familySize && this.filters.familySize != "All") {
          result = result.filter((d) =>
            this.filters.familySize != "10+"
              ? d.totalUnit == this.filters.familySize
              : d.totalUnit >= 10
          );
        }
        if (this.filters.nominatorId && this.filters.nominatorId != "All") {
          result = result.filter(
            (d) => d.nominatorId === this.filters.nominatorId
          );
        }

        if (
          this.filters.hasAdditionalInformation &&
          this.filters.hasAdditionalInformation != "All"
        ) {
          result = result.filter((d) => d.familyDetail.indexOf("Info:") !== -1);
        }

        if (
          this.filters.allocationStatus &&
          this.filters.allocationStatus != "All"
        ) {
          let allowedStatuses = [];
          switch (this.filters.allocationStatus.toLowerCase()) {
            case "allocated":
              allowedStatuses = [
                "allocated-sent",
                "allocated-unconfirmed",
                "allocated-confirmed",
              ];
              break;
            case "allocated - confirmed":
              allowedStatuses = ["allocated-confirmed"];
              break;
            case "allocated - unconfirmed":
              allowedStatuses = ["allocated-unconfirmed"];
              break;
            case "unallocated":
            default:
              allowedStatuses = ["", "unallocated"];
              break;
          }
          result = result.filter((d) => allowedStatuses.includes(d.status));
        }

        if (this.filters.dropoffStatus && this.filters.dropoffStatus != "All") {
          let allowedStatuses = [];
          switch (this.filters.dropoffStatus.toLowerCase()) {
            case "dropped off":
              allowedStatuses = ["hamper-received"];
              break;
            case "awaiting":
            default:
              allowedStatuses = [""];
              break;
          }
          result = result.filter((d) =>
            allowedStatuses.includes(d.receiveStatus)
          );
        }
      }

      if (this.filters.sort) {
        if (this.filters.sort === "Reference A-Z") {
          result.sort((a, b) =>
            b.reference < a.reference ? 1 : a.reference < b.reference ? -1 : 0
          );
        }

        if (this.filters.sort === "Reference Z-A") {
          result.sort((a, b) =>
            b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
          );
        }

        if (this.filters.sort === "Newest First") {
          result.sort((a, b) =>
            a.dateAddedSort < b.dateAddedSort
              ? 1
              : b.dateAddedSort < a.dateAddedSort
              ? -1
              : 0
          );
        }

        if (this.filters.sort === "Oldest First") {
          result.sort((a, b) =>
            a.dateAddedSort > b.dateAddedSort
              ? 1
              : b.dateAddedSort > a.dateAddedSort
              ? -1
              : 0
          );
        }
      }

      return result;
    },
    getCustomActions() {
      const propCustomActions = [];
      if (!this.organisationId) {
        propCustomActions.push({
          emit: "viewOrganisation",
          type: "icon",
          icon: "nc-icon nc-istanbul",
          class: "btn-primary",
          text: "View Organisation",
        });
      }
      if (this.userInGroup("admin")) {
        if (this.options.resetReferences) {
          propCustomActions.push({
            emit: "resetReferences",
            type: "icon",
            icon: "nc-icon nc-ruler-pencil",
            class: "btn-warning",
            text: "Reset References",
          });
        }
        if (this.options.splitFamily) {
          propCustomActions.push({
            emit: "splitFamily",
            type: "icon",
            icon: "nc-icon nc-vector",
            class: "btn-info",
            text: "Split Family",
          });
        }
      }
      return propCustomActions;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
    platformFamilies() {
      return this.$store.getters.getPlatformFamilies;
    },
  },
  methods: {
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: `familiesFilters${this.listKey}`,
        data: this.filters,
      });
    },
    updateSearch(results) {
      this.searchResults = results;
    },
    setModelData(type, data) {
      this.model[type] = data;
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "viewOrganisation":
          this.$router.push(`/organisations/view/${r.organisationId}`);
          break;
        case "splitFamily":
          this.currentNominator = this.allNominators.find(
            (n) => n.requestId === r.nominatorId
          );
          this.familyData = r;
          this.familyData.members = this.familyMemberData.filter(
            (m) => m.familyId === this.familyData.requestId
          );
          this.openModal("split");
          break;
        case "resetReferences":
          /* */
          if (r.nominatorId) {
            const res = await fixReferences({
              nominatorId: r.nominatorId,
              campaign: this.$store.getters.getActiveCampaign,
            });
            if (res.status == 200) {
              await getPlatformData(true);
              this.$router.go();
            } else {
              if (res?.data?.messages) {
                this.messages = Object.keys(res?.data?.messages).map((k) => ({
                  error: res?.data?.messages[k],
                }));
              }
            }
          } else {
            this.messages.push({
              error: "An unexpected error has occurred.",
            });
          }
          /* */
          break;
        default:
          this.currentNominator = this.allNominators.find(
            (n) => n.requestId === r.nominatorId
          );
          this.$emit(k, i, r);
          break;
      }
    },
    async getFamilyData() {
      const pData = this.platformData;
      let familiesData = [];
      familiesData = await this.platformFamilies.filter(
        (f) => f?.type === "family"
      );
      const errorFamilies = await familiesData.filter((f) => {
        const fOrg = pData.organisations.find((o) => o.GSI2PK === f?.GSI3PK);
        if (!fOrg?.SK) {
          console.log("ORG NOT FOUND FOR", f);
          return true;
        }
        const orgRef = fOrg.SK;

        const fNom = pData.nominators.find((n) => n.GSI2PK === f?.GSI3SK);
        if (!fNom?.nominatorDetails?.reference) {
          console.log("NOM NOT FOUND FOR", f);
          return true;
        }
        const nomRef = fNom.nominatorDetails.reference;

        return !f.GSI2SK.includes(`SK#${orgRef}${nomRef}`);
      });
      if (errorFamilies.length) {
        const nominatorIDs = errorFamilies.reduce((a, { GSI3SK }) => {
          if (GSI3SK) a.push(GSI3SK);
          return a;
        }, []);
        familiesData = familiesData.filter((f) =>
          nominatorIDs.includes(f.GSI3SK)
        );
        // GSI3SK
        this.tableData = familiesData.map((f) => ({
          requestId: f?.GSI2PK ?? "",
          allocatedTo: f?.allocatedTo ?? "",
          organisationId: f?.GSI3PK,
          nominatorId: f?.GSI3SK,
          reference: f?.SK ? f.GSI2SK.replace("SK#", "") : "",
          nominatorDetail: this.createNominatorDetail(f?.GSI3SK),
          donorDetail: this.createDonorDetail(f?.allocatedTo),
          familyDetail: this.createFamilyDetail(f?.members),
          totalUnit: f?.totalUnit ?? 0,
          bagsReceived: f?.bagsReceived ?? 0,
          status: f?.status ?? "",
          dateAddedSort: moment(f?.dateAdded).format("YYYYMMDDHHmmss"),
        }));
      } else {
        this.tableData = [];
      }
    },

    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    createDonorDetail(donorId) {
      var rtnStr = "Not Allocated";
      const donor = this?.platformData?.donors
        ? this.platformData.donors.find((n) => n.GSI2PK === donorId)
        : {};
      if (donor?.PK) {
        rtnStr = `<strong>${donor.donorDetails.firstName} ${donor.donorDetails.lastName}</strong>`;
        if (donor.donorDetails.telephone) {
          rtnStr += ` - <a href="tel:${donor.donorDetails.telephone}">${donor.donorDetails.telephone}</a>`;
        }

        if (donor.donorDetails.company) {
          rtnStr += `<br />${donor.donorDetails.company}`;
        }
        if (donor.GSI3PK) {
          rtnStr += `<br /><a href="tel:${donor.GSI3PK}">${donor.GSI3PK}</a>`;
        }
        rtnStr += `<br /><a href="/donors/view/${donor.GSI2PK}" class="btn btn-info btn-fill btn-wd">Manage Donor</a>`;
      }
      return rtnStr;
    },
    createNominatorDetail(nominatorId) {
      var rtnStr = "";
      const nominator = this?.platformData?.nominators
        ? this.platformData.nominators.find((n) => n.GSI2PK === nominatorId)
        : {};
      if (nominator?.PK) {
        rtnStr = `<strong>${nominator.nominatorDetails.firstName} ${nominator.nominatorDetails.lastName}</strong>`;
        if (nominator.nominatorDetails.telephone) {
          rtnStr += ` - <a href="tel:${nominator.nominatorDetails.telephone}">${nominator.nominatorDetails.telephone}</a>`;
        }
        if (nominator.nominatorDetails.email) {
          rtnStr += `<br /><a href="tel:${nominator.nominatorDetails.email}">${nominator.nominatorDetails.email}</a>`;
        }
      }
      return rtnStr;
    },
    createFamilyDetail(members) {
      var rtnString = "";
      if (members) {
        /* */
        for (const [key, m] of Object.entries(members)) {
          rtnString += `
                    <div class="row">
                        <div class="col-12">
                            <strong>
                            ${m.who}${m.whoOther ? " (" + m.whoOther + ")" : ""}
                            </strong>
                            ${m.age} ${m.age ? m.ageType : ""}
                            ${
                              m.additionalInfo
                                ? "<br />Info: " + m.additionalInfo
                                : ""
                            }
                        </div>
                    </div>
                    `;
        }
        /* */
      }
      return rtnString;
    },
  },
  watch: {
    async data() {
      this.isLoading = true;
      await this.getFamilyData();
      this.isLoading = false;
    },
    allNominators(newVal) {
      this.allNominatorsData = newVal;
    },
    async platformData() {
      this.isLoading = true;
      await this.getFamilyData();
      this.isLoading = false;
    },
    async platformFamilies() {
      this.isLoading = true;
      await this.getFamilyData();
      this.isLoading = false;
    },
  },
  data() {
    const searchKeys = ["reference", "familyDetail", "nominatorDetail"];

    const options = {
      create: false,
      update: true,
      delete: true,
      download: true,
      authorise: false,
      resetReferences: true,
      splitFamily: false,
      showDonor: true,
      highlight: {
        unauthorised: false,
        admin: false,
      },
    };

    const tableColumns = [
      {
        prop: "reference",
        label: "Hamper ID",
        minWidth: 125,
      },
      {
        prop: "nominatorDetail",
        label: "Worker Details",
        html: true,
        minWidth: 250,
      },
      {
        prop: "familyDetail",
        label: "Family Detail",
        html: true,
        minWidth: 150,
      },
      {
        prop: "totalUnit",
        label: "Family Unit",
        minWidth: 60,
      },
    ];
    if (this.userInGroup("admin")) {
      tableColumns.push({
        prop: "bagsReceived",
        label: "Bags",
        minWidth: 50,
      });
    }
    if (options.showDonor && this.userInGroup("admin")) {
      tableColumns.push({
        prop: "donorDetail",
        label: "Donor Detail",
        html: true,
        minWidth: 250,
      });
    }
    const savedFilters = this.$store.getters.getGenericData(
      `familiesFilters${this.listKey}`
    );

    return {
      tableData: [],
      loading: true,
      organisations: [],
      allNominators: [],
      options,
      familyOptions: {
        create: true,
        update: true,
        delete: true,
        download: true,
        resetReferences: true,
        splitFamily: true,
      },
      pagination: {
        perPage: 50,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: searchKeys,
        modalMessages: {},
        create: false,
        edit: false,
        delete: false,
        download: false,
        search: true,
      },
      filters: {
        nominatorId: "All",
        verified: savedFilters?.verified ? savedFilters.verified : "Yes",
        verifiedOptions: ["All", "Yes", "No"],
        bounced: savedFilters?.bounced ? savedFilters.bounced : "All",
        bouncedOptions: ["All", "Yes", "No"],
        familySize: savedFilters?.familySize ? savedFilters.familySize : "All",
        familySizeOptions: [
          "All",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10+",
        ],
        allocationStatus: savedFilters?.allocationStatus
          ? savedFilters.allocationStatus
          : "All",
        allocationStatusOptions: [
          "All",
          "Allocated",
          "Allocated - Confirmed",
          "Allocated - Unconfirmed",
          "Unallocated",
        ],
        dropoffStatus: savedFilters?.dropoffStatus
          ? savedFilters.dropoffStatus
          : "All",
        dropoffStatusOptions: ["All", "Awaiting", "Dropped Off"],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        hasAdditionalInformationOptions: [
          "All",
          "Has Additional Info",
          "No Info",
        ],
        sort: savedFilters?.sort ? savedFilters.sort : "Reference A-Z",
        sortOptions: [
          "Reference A-Z",
          "Reference Z-A",
          "Newest First",
          "Oldest First",
        ],
      },
    };
  },
  async mounted() {
    if (!this.isJamie()) {
      this.$router.push("/");
    }
    var pData = this.platformData;

    this.organisations = pData?.organisations ?? [];
    this.allNominators = pData?.nominators ?? [];

    await this.getFamilyData();

    this.loading = false;
  },
};
/* eslint-enable no-console */
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
