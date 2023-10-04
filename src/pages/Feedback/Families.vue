<template>
  <div class="row feedback-list">
    <div class="col-12" v-if="messages && messages.length">
      <l-alert type="danger" v-for="m in messages" :key="m">
        <span> {{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="feedback"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
        @downloadCSV="downloadCSV"
        @updateSearch="updateSearch"
      >
        <template v-slot:header>
          {{ heading }} ({{ listingsData.length }})
          <p class="small" v-if="getSubHeading" v-html="getSubHeading" />
        </template>
        <template v-slot:filters>
          <div class="col-12 col-md-3"></div>
          <div class="col-12 col-md-3">
            <!--
            <span class="text-muted small d-block py-1 px-2">Family Size</span>
            <el-select
              class="select-default w-100"
              v-model="filters.familySize"
              @change="filtersChanged()"
              placeholder="familySize"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.familySizeOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            -->
          </div>
          <div class="col-12 col-md-3">
            <!-- 
            <span class="text-muted small d-block py-1 px-2"
              >Additional Information Supplied</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.hasAdditionalInformation"
              @change="filtersChanged()"
              placeholder="hasAdditionalInformation"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.hasAdditionalInformationOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          --></div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2">Sort By</span>
            <el-select
              class="select-default w-100"
              v-model="filters.sort"
              @change="filtersChanged()"
              placeholder="Sort By"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.sortOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <!-- --
            <span class="text-muted small d-block py-1 px-2"
              >Allocation Status</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.allocationStatus"
              @change="filtersChanged()"
              placeholder="allocationStatus"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.allocationStatusOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            -->
          </div>
          <div class="col-12 col-md-3" v-if="allNominators.length > 1">
            <span class="text-muted small d-block py-1 px-2">Nominator</span>
            <el-select
              class="select-default w-100"
              v-model="filters.nominatorId"
              @change="filtersChanged()"
              placeholder="Nominator"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="nominator in allNominators"
                :key="nominator.requestId"
                :label="nominator.fullName"
                :value="nominator.requestId"
              >
              </el-option>
            </el-select>
          </div>
        </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Dialog, MessageBox, Select, Option } from "element-ui";
import { getHamperFeedback } from "@/api/feedback.api";

import ListingsPage from "@/components/Cards/ListingsPage.vue";
import LAlert from "src/components/Alert";
import Swal from "sweetalert2";

Vue.prototype.$confirm = MessageBox.confirm;

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    LAlert,
    ListingsPage,
  },
  props: {
    listKey: {
      type: String,
      default: "",
    },
    heading: {
      type: String,
      default: "Hamper Feedback",
    },
    subHeading: {
      type: String,
      default: "",
    },
    data: {
      type: Array || null,
      default: null,
    },
    organisationId: {
      type: String,
      default: "",
    },
    organisation: {
      type: Object,
      default: () => ({}),
    },
    nominator: {
      type: Object,
      default: () => ({}),
    },
    allNominators: {
      type: Array,
      default: () => [],
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
    searchKeys: {
      type: Array,
      default: () => ["hamper-feedback"],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: false,
        delete: false,
        download: false,
        authorise: false,
        resetReferences: false,
        splitFamily: false,
        showDonor: true,
        highlight: {
          unauthorised: false,
          admin: false,
        },
      }),
    },
    customActions: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    data(newVal) {
      this.tableData = newVal;
    },
    allNominators(newVal) {
      this.allNominatorsData = newVal;
    },
  },
  data() {
    const tableColumns = [
      {
        prop: "feedback",
        label: "Feedback",
        minWidth: 400,
      },
      {
        prop: "feedbackRecieved",
        label: "Date Recieved",
        minWidth: 60,
      },
    ];
    const savedFilters = this.$store.getters.getGenericData(
      `familiesFilters${this.listKey}`
    );
    return {
      searchResults: [],
      isLoading: true,
      createKey: 0,
      messages: [],
      modals: {
        create: false,
        update: false,
        split: false,
      },
      editFamilyData: [],
      tableData: [],
      allNominatorsData: [],
      allDonorsData: [],
      familyMemberData: [],
      duplicateReferences: [],
      familyData: {},
      currentNominator: {},
      fallBackSubHeading: "",
      pagination: {
        perPage: this.paginateOptions.perPage ?? 50,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
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
          : "Allocated - Confirmed",
        allocationStatusOptions: [
          "All",
          "Allocated",
          "Allocated - Confirmed",
          "Allocated - Unconfirmed",
          "Unallocated",
        ],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        hasAdditionalInformationOptions: [
          "All",
          "Has Additional Info",
          "No Info",
        ],
        sort: savedFilters?.sort
          ? savedFilters.sort
          : "Date Recieved - Newest First",
        sortOptions: [
          "Date Recieved - Newest First",
          "Date Recieved - Oldest First",
        ],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        create: this.options?.create ? this.options.create : false,
        edit: this.options?.update ? this.options.update : false,
        delete: this.options?.delete ? this.options.delete : false,
        download: this.options?.download ? this.options.download : false,
        authorise: this.options?.authorise ? this.options.authorise : false,
        highlight: this.options?.highlight ? this.options.update : {},
        search: this.options?.search ? this.options.search : true,
      },
      orgFamiliesTotal: this.organisation?.familiesTotal
        ? this.organisation.familiesTotal
        : 0,
    };
  },
  computed: {
    unauthorisedNominators() {
      return Object.values(this.model.nominators)
        .filter((n) => n.status != "Approved")
        .map((n) => n.requestId);
    },
    getAllNominators() {
      return this.allNominatorsData;
    },
    orgRef() {
      return `${this.organisation?.reference}`;
    },
    nominatorRef() {
      let nominatorReference = "";
      if (this.currentNominator?.userReference) {
        nominatorReference = this.currentNominator?.userReference;
      } else {
        if (this.allNominatorsData.length) {
          const nominator = this.allNominatorsData.find(
            (n) => n.requestId === this.familyData.nominatorId
          );
          if (nominator?.userReference) {
            nominatorReference = nominator.userReference;
          }
        }
      }
      return `${nominatorReference}`;
    },
    hamperRef() {
      return `${this.orgRef}${this.nominatorRef}`;
    },
    maxFamilysCheck() {
      return (
        this.userInGroup("admin") ||
        this.organisation.familiesLimit <= 0 ||
        this.orgFamiliesTotal < this.organisation.familiesLimit
      );
    },
    familyCount() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.currentNominator?.requestId
      ).length;
    },
    nominatorsFamilies() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.currentNominator?.requestId
      );
    },
    getSubHeading() {
      if (this.subHeading) {
        return this.subHeading;
      }
      return this.fallBackSubHeading;
    },
    listingsData() {
      let result = this?.tableData ? this.tableData : [];

      if (
        this.filters.sort &&
        this.filters.sort === "Date Recieved - Newest First"
      ) {
        result.sort((a, b) =>
          b.feedbackRecieved > a.feedbackRecieved
            ? 1
            : a.feedbackRecieved > b.feedbackRecieved
            ? -1
            : 0
        );
      } else {
        result.sort((a, b) =>
          a.feedbackRecieved > b.feedbackRecieved
            ? 1
            : b.feedbackRecieved > a.feedbackRecieved
            ? -1
            : 0
        );
      }

      return result;
    },
    getCustomActions() {
      const propCustomActions = this.customActions;
      /* *
      if (!this.organisationId) {
        propCustomActions.push({
          emit: 'viewOrganisation',
          type: 'icon',
          icon: 'nc-icon nc-istanbul',
          class: 'btn-primary',
          text: 'View Organisation',
        })
      }
      /* */
      return propCustomActions;
    },
  },
  methods: {
    updateSearch(results) {
      this.searchResults = results;
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: `familiesFilters${this.listKey}`,
        data: this.filters,
      });
    },
    openModal(name) {
      this.modals[name] = true;
    },
    closeModal(name) {
      this.modals[name] = false;
    },
    downloadCSV() {
      const downloadData = this.searchResults.length
        ? this.searchResults
        : this.listingsData;

      const header = [
        "Family Reference",
        "Nominated By",
        "Dynamic",
        "Total Family Unit",
        "Received Status",
        "Bags Received",
      ];

      if (this.options.showDonor) {
        header.push("Allocated Donor");
        header.push("Donor Email");
        header.push("Allocation Confirmed");
      }

      let rows = [header];

      const data = downloadData.map((f) => {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = f.familyDetail;
        const familyDetail = (tmp.textContent || tmp.innerText || "")
          .replace(/\n+/g, ",")
          .replace(/\s\s+/g, "")
          .replace(/,,+/g, ",")
          .replace(/^[,]+/g, "")
          .replace(/[,]+$/g, "")
          .replace(/,+/g, ", ");

        let nominatorName = f.nominatorDetail
          .match(/<strong>(.*?)<\/strong>/g)
          .map(function (val) {
            return val.replace(/<\/?r>/g, "");
          });
        tmp = document.createElement("DIV");
        tmp.innerHTML = nominatorName[0];
        nominatorName = tmp.textContent || tmp.innerText || "";

        let donorDetail = "";
        let donorEmail = "";
        if (this.options.showDonor) {
          donorDetail = "Not Allocated";
          if (f.allocatedTo) {
            const familyDonor = this.allDonorsData.find(
              (d) => d.requestId == f.allocatedTo
            );
            if (familyDonor?.requestId) {
              donorDetail = `${familyDonor.firstName} ${familyDonor.lastName}`;
              donorEmail = `${familyDonor.email ? familyDonor.email : ""}`;
            }
          }
        }
        let allocationStatus = "Unallocated";

        switch (f.status) {
          case "allocated-sent":
          case "allocated-unconfirmed":
            allocationStatus = "Allocated - Unconfirmed";
            break;
          case "allocated-confirmed":
            allocationStatus = "Allocated - Confirmed";
            break;
          case "allocated-unconfirmed":
            allocationStatus = "Allocated - Unconfirmed";
            break;
          case "unallocated":
          default:
            allocationStatus = "Unallocated";
            break;
        }

        const returnRow = [
          `"${f.reference}"`,
          `"${nominatorName}"`,
          `"${familyDetail}"`,
          `"${f.totalUnit}"`,
          `"${f.receiveStatus}"`,
          `"${f.bagsReceived}"`,
        ];

        if (this.options.showDonor) {
          returnRow.push(`"${donorDetail}"`);
          returnRow.push(`"${donorEmail}"`);
          returnRow.push(`"${allocationStatus}"`);
        }

        return returnRow;
      });
      rows.push(...data);

      let csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

      var encodedUri = encodeURI(csvContent);
      // window.open(encodedUri);
      /* */
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${
          this.organisation.reference ? this.organisation.reference + "-" : ""
        }families-list.csv`
      );
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    async handleEdit(i, r) {
      // console.log(i, r)
    },
    async handleDelete(i, r) {
      // console.log(i, r)
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "viewOrganisation":
          this.$router.push(`/organisations/view/${r.organisationId}`);
          break;
        default:
          this.$emit(k, i, r);
          break;
      }
    },
    handleEventBusEvent(requestId) {
      const nominator = this.tableData.find((n) => n?.requestId === requestId);

      if (nominator?.requestId) {
        // this.approveNom(nominator);
      }
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }

    this.allNominatorsData = this.allNominators;
    this.currentNominator = this.nominator;

    let res = {};
    if (!this.data || typeof this.data != "object") {
      res = await getHamperFeedback();
      this.tableData = Object.values(res?.data);
    } else {
      this.tableData = this.data;
    }

    this.isLoading = false;

    var valueArr = this.tableData.map(function (item) {
      return item.reference;
    });
    valueArr.some((item, idx) => {
      if (valueArr.indexOf(item) != idx) {
        this.duplicateReferences.push(valueArr[valueArr.indexOf(item)]);
      }
      return false;
    });

    EventBus.$on("$EventBusEvent", this.handleEventBusEvent);
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
