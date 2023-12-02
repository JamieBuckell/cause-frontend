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
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Dropoff Status</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.dropoffStatus"
              @change="filtersChanged()"
              placeholder="allocationStatus"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.dropoffStatusOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
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
import {
  getFamilyByOrganisation,
  getFamilies,
  deleteFamily,
  markDirectHamper,
} from "@/api/families.api";
import { fixReferences } from "@/api/users.api";
import { getPlatformData } from "@/services/campaignData";
import { getDonors } from "@/api/donors.api";

import ListingsPage from "@/components/Cards/ListingsPage.vue";
import LAlert from "src/components/Alert";
import Swal from "sweetalert2";

Vue.prototype.$confirm = MessageBox.confirm;
import moment from "moment";

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
      default: "Hampers",
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
      default: () => ["reference", "familyDetail", "nominatorDetail"],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
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
        label: "Family Unit Total",
        minWidth: 100,
      },
      {
        prop: "bagsReceived",
        label: "Bags Received",
        minWidth: 100,
      },
    ];
    if (this.options.showDonor && this.userInGroup("admin")) {
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
        dropoffStatusOptions: ["All", "Awaiting", "Dropped Off", "Direct"],
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
      if (this.currentNominator?.nominatorDetails?.reference) {
        nominatorReference = this.currentNominator.nominatorDetails.reference;
      } else {
        if (this.allNominatorsData.length) {
          const nominator = this.allNominatorsData.find(
            (n) => n.requestId === this.familyData.nominatorId
          );
          if (nominator?.nominatorDetails?.reference) {
            nominatorReference = nominator.nominatorDetails.reference;
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
        (f) => f.nominatorId == this?.currentNominator?.GSI2PK
      ).length;
    },
    nominatorsFamilies() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.currentNominator?.GSI2PK
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

      const pData = this.$store.getters.getPlatformData;

      result.map((f) => {
        f.authorised = pData?.nominators
          ? pData.nominators.find((n) => n?.GSI2PK === f?.nominatorId)
              ?.status === "Approved" ?? false
          : false;
        return f;
      });

      if (result.length) {
        result.map((d) => {
          d.bagsReceived = d.bagsReceived ?? 0;
          return true;
        });

        if (this.filters.dropoffStatus && this.filters.dropoffStatus != "All") {
          let allowedStatuses = [];
          switch (this.filters.dropoffStatus.toLowerCase()) {
            case "direct":
              allowedStatuses = ["direct-hamper"];
              break;
            case "dropped off":
              allowedStatuses = ["hamper-received"];
              break;
            case "awaiting":
            default:
              allowedStatuses = [""];
              break;
          }
          result = result.filter((d) => {
            return allowedStatuses.length
              ? allowedStatuses.includes(d?.receiveStatus)
              : false;
          });
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
      const propCustomActions = this.customActions;
      if (
        !this.organisationId &&
        !propCustomActions.find((ca) => ca.emit === "viewOrganisation")?.emit
      ) {
        propCustomActions.push({
          emit: "viewOrganisation",
          type: "icon",
          icon: "nc-icon nc-istanbul",
          class: "btn-primary",
          text: "View Organisation",
        });
      }
      if (this.userInGroup("admin")) {
        if (
          this.options.resetReferences &&
          !propCustomActions.find((ca) => ca.emit === "resetReferences")?.emit
        ) {
          propCustomActions.push({
            emit: "resetReferences",
            type: "icon",
            icon: "nc-icon nc-ruler-pencil",
            class: "btn-warning",
            text: "Reset References",
          });
        }
        if (
          this.options.splitFamily &&
          !propCustomActions.find((ca) => ca.emit === "splitFamily")?.emit
        ) {
          propCustomActions.push({
            emit: "splitFamily",
            type: "icon",
            icon: "nc-icon nc-vector",
            class: "btn-info",
            text: "Split Family",
          });
        }
        propCustomActions.push({
          emit: "directHamper",
          type: "icon",
          icon: "nc-icon nc-delivery-fast",
          class: "btn-primary",
          text: "Received Direct",
        });
      }
      return propCustomActions;
    },
    platformData() {
      return this.$store.getters?.getPlatformData ?? {};
    },
    platformFamilies() {
      return this.$store.getters?.getPlatformFamilies ?? [];
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

      switch (this.filters.dropoffStatus.toLowerCase()) {
        case "direct":
          this.fallBackSubHeading =
            "All hampers sent directly to the organisation";
          break;
        case "dropped off":
          this.fallBackSubHeading = "All hampers dropped off at the riverside";
          break;
        case "awaiting":
        default:
          this.fallBackSubHeading =
            "All hampers awaiting drop off at the riverside";
          break;
      }
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
            const familyDonor = this?.platformData?.donors
              ? this.platformData.donors.find((n) => n.GSI2PK === f.allocatedTo)
              : {};

            if (familyDonor?.GSI2PK) {
              donorDetail = `${familyDonor.donorDetails.firstName} ${familyDonor.donorDetails.lastName}`;
              donorEmail = `${familyDonor.GSI3PK ? familyDonor.GSI3PK : ""}`;
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
      this.currentNominator = this.platformData.nominators.find(
        (n) => n.GSI2PK === r.nominatorId
      );
      this.editFamilyData = r;
      this.openModal("update");
      // this.$router.push(`/donors/view/${r.requestId}`);
    },
    async handleDelete(i, r) {
      const updateRes = await deleteFamily(r.requestId);
      if (updateRes?.status != 200 && updateRes?.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      } else {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.requestId === r.requestId
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
      }
      /* */
    },

    async markDirectHamper(hamperReference) {
      const res = await markDirectHamper({
        hamperId: hamperReference,
        campaignId: this.$store.getters.getActiveCampaign,
      });
      if (res.data.success) {
        this.submitting = false;

        Swal.fire({
          title: "Hamper successfully received",
          timer: 2000,
          showConfirmButton: false,
        });
        return true;
      } else {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
        return false;
      }
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "viewOrganisation":
          this.$router.push(`/organisations/view/${r.organisationId}`);
          break;
        case "directHamper":
          const marked = this.markDirectHamper(r.reference);
          if (marked) {
            r.receiveStatus = "direct-hamper";
          }
          break;
        case "splitFamily":
        case "splitFamily":
          this.currentNominator = this.platformData.nominators.find(
            (n) => n.GSI2PK === r.nominatorId
          );
          if (this.currentNominator) {
            this.familyData = this.platformFamilies.find(
              (f) => f.GSI2PK === r.requestId
            );

            if (
              this.familyData.allocatedTo &&
              this.familyData.allocatedTo != "unallocated"
            ) {
              Swal.fire({
                title: "Error",
                text: "This family has already been allocated and cannot be split",
                timer: 3000,
                showConfirmButton: false,
              });
            } else if (
              !this.familyData.members ||
              this.familyData.members.length <= 1
            ) {
              Swal.fire({
                title: "Error",
                text: "There must be at least 2 members in the family to split",
                timer: 3000,
                showConfirmButton: false,
              });
            } else {
              this.openModal("split");
            }
          }
          break;
        case "resetReferences":
          /* */
          this.isLoading = true;
          if (r.nominatorId) {
            const res = await fixReferences({
              nominatorId: r.nominatorId,
              campaign: this.$store.getters.getActiveCampaign,
            });
            if (res?.data?.messages) {
              this.messages = Object.keys(res?.data?.messages).map((k) => ({
                error: res?.data?.messages[k],
              }));
            }
            if (res.status == 200) {
              Swal.fire({
                title: "Success",
                text: "Reference fix request recieved. Please wait 5 minutes and refresh the data to confirm.",
                timer: 3000,
                showConfirmButton: false,
              });
            }
          } else {
            this.messages.push({
              error: "An unexpected error has occurred.",
            });
          }
          this.isLoading = true;
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
    handleEventBusEvent(requestId) {
      const nominator = this.tableData.find((n) => n?.requestId === requestId);

      if (nominator?.requestId) {
        // this.approveNom(nominator);
      }
    },
    async doSplitFamilies() {
      Swal.fire({
        title: "Success",
        text: "This family was split successfully.",
        timer: 3000,
        showConfirmButton: false,
      });

      await this.$store.commit("setForceRefresh", true);

      this.closeModal("split");
    },
    async saveFamilies(families) {
      const familyData = families.map((f) => ({
        requestId: f?.GSI2PK ?? "",
        organisationId: f?.GSI3PK,
        nominatorId: f?.GSI3SK,
        reference: f?.SK ? f.GSI2SK.replace("SK#", "") : "",
        nominatorDetail: f?.nominatorDetail ?? "",
        familyDetail: f?.familyDetail ?? "",
        totalUnit: f?.totalUnit ?? 0,
        bagsReceived: f?.bagsReceived ?? 0,
        status: f?.status ?? "",
        receiveStatus: f?.receiveStatus ?? "",
        dateAddedSort: moment(f?.dateAdded).format("YYYYMMDDHHmmss"),
      }));
      this.tableData = [...familyData];

      //Update platform data...
      /* */
      const nominatorSpecific = !(
        this.userInGroup("admin") || this.userInGroup("teamlead")
      );

      const familiesToRemove = this.platformFamilies
        ? this.platformFamilies.filter(
            (f) =>
              f?.GSI3PK === this.organisationId &&
              (!nominatorSpecific ||
                f?.GSI3SK === this.currentNominator?.GSI2PK)
          )
        : [];
      for (const family of familiesToRemove) {
        const indexToDelete = this.platformFamilies
          ? this.platformFamilies.findIndex((f) => f?.GSI2PK === family?.GSI2PK)
          : null;
        if (indexToDelete >= 0) {
          this.platformFamilies.splice(indexToDelete, 1);
        }
      }

      await this.$store.dispatch("setPlatformFamilyData", [
        ...this.platformFamilies,
        ...families,
      ]);

      this.createKey = !this.createKey;

      Swal.fire({
        title: "Success",
        text: "Your family was saved successfully.",
        timer: 3000,
        showConfirmButton: false,
      });

      this.orgFamiliesTotal++;
      if (!this.maxFamilysCheck) {
        this.closeModal("create");
      }
    },
    updateFamilies({ families, update = false }) {
      /* *
      if (update) {
        const newTableData = [...this.tableData];
        for (const [k, f] of families.entries()) {
          var foundIndex = newTableData.findIndex(
            (td) => td.requestId === f.requestId
          );
          newTableData[foundIndex] = f;
        }
        this.tableData = [...newTableData];
      } else {
        this.tableData = [...this.tableData, ...families];
      }
      this.createKey = !this.createKey;

      Swal.fire({
        title: "Success",
        text: "Your family was saved successfully.",
        timer: 3000,
        showConfirmButton: false,
      });

      this.orgFamiliesTotal++;
      this.closeModal("update");
      /* */
    },
    splitFamilies(families) {
      this.tableData = [...this.tableData, ...families];
      this.createKey = !this.createKey;

      Swal.fire({
        title: "Success",
        text: "Your family was saved successfully.",
        timer: 3000,
        showConfirmButton: false,
      });

      this.orgFamiliesTotal++;
      if (!this.maxFamilysCheck) {
        this.closeModal("create");
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
    async getFamilyData() {
      let familiesData = [];
      if (this.data && typeof this.data === "object") {
        familiesData = this.data;
      } else {
        if (this.organisation.requestId) {
          familiesData = await this.platformFamilies.filter(
            (f) =>
              (this.userInGroup("admin") ||
                this.userInGroup("teamlead") ||
                f?.GSI3SK === this.currentNominator?.GSI2PK) &&
              f?.GSI3PK === this.organisation.requestId &&
              f?.type === "family"
          );

          this.familyMemberData = []; //Object.values(res?.data?.members);
        } else if (this.userInGroup("admin")) {
          familiesData = await this.platformFamilies.filter(
            (n) => n?.type === "family"
          );
        }
      }
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
        receiveStatus: f?.receiveStatus ?? "",
        dateAddedSort: moment(f?.dateAdded).format("YYYYMMDDHHmmss"),
      }));
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.userInGroup("teamlead")) {
      // this.$router.push("/");
    }

    this.allNominatorsData = this.allNominators;
    this.currentNominator = this.nominator;

    await this.getFamilyData();

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
