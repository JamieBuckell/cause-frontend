<template>
  <div class="row hampers-list">
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
        listingsType="hampers"
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
          <div class="col-12 col-md-3"></div>
          <div class="col-12 col-md-3"></div>
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
          <div class="col-12 col-md-3"></div>
          <div class="col-12 col-md-3"></div>
        </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Dialog, MessageBox, Select, Option } from "element-ui";
import { getUndelivereDonors } from "@/api/families.api";

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
      default: "Undelivered Hampers",
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
        perPage: 100,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
    searchKeys: {
      type: Array,
      default: () => ["reference", "donor", "pledged", "dynamics"],
    },
    options: {
      type: Object,
      default: () => ({
        update: true,
        delete: true,
        download: true,
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
        prop: "reference",
        label: "Hamper ID",
        minWidth: 125,
      },
      {
        prop: "donor",
        label: "Donator",
        html: true,
        minWidth: 250,
      },
      {
        prop: "dynamics",
        label: "Family Detail",
        html: true,
        minWidth: 150,
      },
      {
        prop: "totalUnit",
        label: "Unit Total",
        minWidth: 100,
      },
      {
        prop: "pledged",
        label: "Unit Pledge",
        minWidth: 100,
      },
      /*
      {
        prop: 'bagsReceived',
        label: 'Bags Received',
        minWidth: 100,
      },
      */
    ];
    const savedFilters = this.$store.getters.getGenericData(
      `undeliveredFilters${this.listKey}`
    );
    return {
      searchResults: [],
      isLoading: true,
      messages: [],
      tableData: [],
      allNominatorsData: [],
      allDonorsData: [],
      familyMemberData: [],
      duplicateReferences: [],
      familyData: {},
      currentNominator: {},
      fallBackSubHeading: "",
      pagination: {
        perPage: this.paginateOptions.perPage ?? 100,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [
          5, 10, 25, 50, 100,
        ],
        total: 0,
      },
      filters: {
        sort: savedFilters?.sort ? savedFilters.sort : "Reference A-Z",
        sortOptions: ["Reference A-Z", "Reference Z-A", "Pledged High - Low"],
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
    getSubHeading() {
      if (this.subHeading) {
        return this.subHeading;
      }
      return this.fallBackSubHeading;
    },
    listingsData() {
      let result = this?.tableData ? this.tableData : [];

      if (this.filters.sort && this.filters.sort === "Reference Z-A") {
        result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
        );
      } else if (
        this.filters.sort &&
        this.filters.sort === "Pledged High - Low"
      ) {
        result.sort((a, b) =>
          b.pledged > a.pledged ? 1 : a.pledged > b.pledged ? -1 : 0
        );
      } else {
        result.sort((a, b) =>
          b.reference < a.reference ? 1 : a.reference < b.reference ? -1 : 0
        );
      }

      return result;
    },
    getCustomActions() {
      const propCustomActions = this.customActions;
      if (!this.organisationId) {
        propCustomActions.push({
          emit: "viewOrganisation",
          type: "icon",
          icon: "nc-icon nc-istanbul",
          class: "btn-primary",
          text: "View Organisation",
        });
      }
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
    downloadCSV() {
      const downloadData = this.searchResults.length
        ? this.searchResults
        : this.listingsData;

      const header = ["Hamper ID", "Nominator", "Family Detail", "Unit Total"];
      let rows = [header];

      const data = downloadData.map((f) => {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = f.dynamics;
        const familyDetail = (tmp.textContent || tmp.innerText || "")
          .replace(/\n+/g, ",")
          .replace(/\s\s+/g, "")
          .replace(/,,+/g, ",")
          .replace(/^[,]+/g, "")
          .replace(/[,]+$/g, "")
          .replace(/,+/g, ", ");

        const returnRow = [
          `"${f.reference}"`,
          `"${f.donor}"`,
          `"${familyDetail}"`,
          `"${f.totalUnit}"`,
          `"${f.pledged}"`,
        ];

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
        }undelivered-hampers-list.csv`
      );
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
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

    const res = await getUndelivereDonors();
    this.tableData = Object.values(res?.data);

    this.$emit("resultData", "families", this.tableData);
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
