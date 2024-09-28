<template>
  <div class="row subscribers-list">
    <div class="col-12" v-if="messages && messages.length">
      <l-alert type="danger" v-for="(m, idx) in messages" :key="idx">
        <span> {{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div class="col-12">
      <el-dialog center title="Create Subscriber" :visible.sync="modals.create">
        <SubscriberAdd :key="createKey" @success="modals.create = false" />
      </el-dialog>

      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="subscribers"
        @createItem="handleCreate"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        @downloadCSV="downloadCSV"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
        :dataLoading="isLoading"
      >
        <template v-slot:header>
          {{ heading }} ({{ listingsData.length }})
          <p class="small" v-if="getSubHeading" v-html="getSubHeading" />
        </template>
        <template v-slot:filters>
          <div class="col-12 col-md-2">
            <span class="text-muted small d-block py-1 px-2">Subscribed</span>
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.subscribed),
                },
              ]"
              v-model="filters.subscribed"
              @change="filtersChanged()"
              placeholder="Subscribed"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.genericOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-2">
            <span class="text-muted small d-block py-1 px-2"
              >Email Verified</span
            >
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.verified),
                },
              ]"
              v-model="filters.verified"
              @change="filtersChanged()"
              placeholder="Verified"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.genericOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>

          <div class="col-12 col-md-2">
            <span class="text-muted small d-block py-1 px-2"
              >Email Bounced</span
            >
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.bounced),
                },
              ]"
              v-model="filters.bounced"
              @change="filtersChanged()"
              placeholder="Bounced"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.genericOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>

          <div class="col-12 col-md-2">
            <span class="text-muted small d-block py-1 px-2">How Heard</span>
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.howHeard),
                },
              ]"
              v-model="filters.howHeard"
              @change="filtersChanged()"
              placeholder="How Heard"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in howHeardOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>

          <div class="col-12 col-md-2">
            <span class="text-muted small d-block py-1 px-2">Company</span>
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.company),
                },
              ]"
              v-model="filters.company"
              @change="filtersChanged()"
              placeholder="Company"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in companyOptions"
                :key="item"
                :label="item"
                :value="item"
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

import { deleteSubscriber } from "@/api/subscribers.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import LAlert from "src/components/Alert";
import SubscriberAdd from "@/components/Modals/SubscriberAdd.vue";
import Fuse from "fuse.js";
import {
  Dialog,
  Table,
  TableColumn,
  Select,
  Option,
  MessageBox,
} from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    ListingsPage,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    SubscriberAdd,
    LAlert,
  },
  props: {
    heading: {
      type: String,
      default: "All Subscribers",
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
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 50,
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
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: false,
        delete: true,
        download: true,
        authorise: false,
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
    async platformData() {
      if (this.userInGroup("admin") || this.userInGroup("teamlead")) {
        await this.getListData();
      }
    },
    async organisationId() {
      this.isLoading = true;
      await this.getListData();
      this.isLoading = false;
    },
  },
  data() {
    const tableColumns = [
      {
        prop: "emailAddress",
        label: "Email Address",
        minWidth: 300,
      },
      {
        prop: "firstName",
        label: "First Name",
        minWidth: 150,
      },
      {
        prop: "lastName",
        label: "Last Name",
        minWidth: 150,
      },
      {
        prop: "company",
        label: "Company",
        minWidth: 200,
      },
    ];
    const savedFilters =
      this.$store.getters.getGenericData("subscribersFilters");

    return {
      isLoading: true,
      messages: [],
      tableData: [],
      fallBackSubHeading: "",
      subscriberData: {},
      createKey: 0,
      modals: {
        create: false,
      },
      pagination: {
        perPage: this.paginateOptions.perPage ?? 25,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        hidden: savedFilters?.hidden ? savedFilters.hidden : "No",
        verified: savedFilters?.verified ? savedFilters.verified : "All",
        subscribed: savedFilters?.subscribed ? savedFilters.subscribed : "Yes",
        bounced: savedFilters?.bounced ? savedFilters.bounced : "All",
        howHeard: savedFilters?.howHeard ? savedFilters.howHeard : "All",
        company: savedFilters?.company ? savedFilters.company : "All",
        genericOptions: ["All", "Yes", "No"],
        sort: savedFilters?.sort ? savedFilters.sort : "Newest First",
        sortOptions: ["Newest First", "User Reference (Desc)"],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        create: this.options?.create ? this.options.create : true,
        edit: this.options?.update ? this.options.update : true,
        delete: this.options?.delete ? this.options.delete : false,
        download: this.options?.download ? this.options.download : false,
        authorise: this.options?.authorise ? this.options.authorise : false,
        highlight: this.options?.highlight ? this.options.update : {},
        search: this.options?.search ? this.options.search : true,
      },
      searchQuery: "",
      propsToSearch: ["emailAddress", "firstName", "lastName", "company"],
      tableColumns,
      fuseSearch: null,
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
      let result = this?.tableData ?? [];

      if (result.length) {
        if (this.filters.verified && this.filters.verified != "All") {
          const v = this.filters.verified === "Yes";
          result = result.filter(
            (s) => s?.verified === v || (!s?.verified && !v)
          );
        }
        if (this.filters.subscribed && this.filters.subscribed != "All") {
          const b = this.filters.subscribed === "Yes";
          result = result.filter(
            (s) => s?.subscribed === b || (!s?.subscribed && !b)
          );
        }
        if (this.filters.bounced && this.filters.bounced != "All") {
          const b = this.filters.bounced === "Yes";
          result = result.filter(
            (s) => s?.bounced === b || (!s?.bounced && !b)
          );
        }
        if (this.filters.howHeard && this.filters.howHeard != "All") {
          result = result.filter((s) => s?.howHeard === this.filters.howHeard);
        }
        if (this.filters.company && this.filters.company != "All") {
          result = result.filter((s) => s?.company === this.filters.company);
        }
      }

      if (this.filters.sort && this.filters.sort === "User Reference (Desc)") {
        result.sort((a, b) =>
          a.userReference > b.userReference
            ? 1
            : b.userReference > a.userReference
            ? -1
            : 0
        );
      } else {
        result.sort((a, b) =>
          b.firstName < a.firstName ? 1 : a.firstName < b.firstName ? -1 : 0
        );
      }

      return result;
    },
    howHeardOptions() {
      const unique = [
        ...new Set(
          this.tableData.map((item) =>
            item?.howHeard && item.howHeard != "" ? item?.howHeard : false
          )
        ),
      ].sort();
      const index = unique.indexOf(false);
      unique.splice(index, 1);

      return ["All"].concat(unique);
    },
    companyOptions() {
      const unique = [
        ...new Set(
          this.tableData.map((item) =>
            item?.company && item.company != "" ? item?.company : false
          )
        ),
      ].sort();
      const index = unique.indexOf(false);
      unique.splice(index, 1);

      return ["All"].concat(unique);
    },
    pagedData() {
      return this.tableData.length
        ? this.tableData.slice(this.from, this.to)
        : this.tableData;
    },
    /***
     * Searches through table data and returns a paginated array.
     * Note that this should not be used for table with a lot of data as it might be slow!
     * Do the search and the pagination on the server and display the data retrieved from server instead.
     * @returns {computed.pagedData}
     */

    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      // this.paginationTotal(this.tableData.length);
      return this.pagination.total;
    },

    getCustomActions() {
      const propCustomActions = this.customActions;
      if (!this.organisationId) {
        propCustomActions.push({
          emit: "viewPledge",
          type: "icon",
          icon: "fa fa-gift",
          class: "btn-primary",
          text: "View Donor Profile",
        });
      }
      return propCustomActions;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    isFilterActive(value) {
      return value !== "All" && value != "";
    },
    /*
    async handleEdit(i, r) {
      this.editsubscriber = true;
      this.subscriberData = r;
      this.subscriberData.originalEmail = r.emailAddress;
    },
    */
    handleCreate(index, row) {
      this.openModal("create");
    },
    handleEdit(index, row) {
      this.$router.push(`/subscribers/view/${row.emailAddress}`);
    },
    async handleDelete(index, row) {
      const updateRes = await deleteSubscriber(row.emailAddress);
      /* */
      if (updateRes?.status == 200) {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.emailAddress === row.emailAddress
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
        const pData = this.$store.getters.getPlatformData;
        indexToDelete = pData.subscribers.findIndex(
          (s) => s?.PK === row.emailAddress
        );
        if (indexToDelete >= 0) {
          pData.subscribers.splice(indexToDelete, 1);

          await this.$store.dispatch("setPlatformData", {
            ...pData,
          });
        }
      }
      if (updateRes?.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      }
    },
    openModal(name) {
      this.modals[name] = true;
    },
    closeModal(name) {
      this.modals[name] = false;
    },
    cellValueRenderer(row, column, cellValue, index) {
      let value = cellValue;
      if (typeof row[column.property] === "boolean") {
        value = cellValue ? "Yes" : "No";
      }
      return value;
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    downloadCSV() {
      let rows = [
        ["Subscriber Name", "Email Address", "Organisation", "Telephone"],
      ];

      if (this.tableData) {
        const data = this.tableData.map((subscriber) => {
          return [
            `"${subscriber.firstName} ${subscriber.lastName}"`,
            `"${subscriber?.emailAddress ?? ""}"`,
            `"${subscriber?.company ?? ""}"`,
            `"${subscriber?.telephone ?? ""}"`,
          ];
        });
        rows.push(...data);
      }

      let csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

      var encodedUri = encodeURI(csvContent);
      // window.open(encodedUri);
      /* */
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `all-subscribers-list.csv`);
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: "subscribersFilters",
        data: this.filters,
      });
    },
    handleCustomAction(i, k, r) {
      switch (k) {
        case "viewPledge":
          this.$router.push(`/donors/view/${r.emailAddress}`);
          break;
        default:
          this.$emit(k, i, r);
          break;
      }
    },
    async getListData() {
      if (this.platformData?.subscribers) {
        this.tableData = this.platformData?.subscribers.map((s) => ({
          emailAddress: s?.PK,
          firstName: s?.firstName,
          lastName: s?.lastName,
          company: s?.company,
          telephone: s?.telephone,
          howHeard: s?.howHeard ?? "",
          verified: s?.verified,
          subscribed: s?.subscribed,
          bounced: s?.bounced,
        }));
      }

      this.organisationData =
        this.organisationId && this?.platformData?.organisations
          ? await this.platformData.organisations.find(
              (o) => o.GSI2PK === this.organisationId
            )
          : {};
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    async getSubscriberData() {
      var pData = this.$store.getters.getPlatformData;
      if (!pData?.subscribers) {
        const platformData = await getByCampaign(
          this.$store.getters.getActiveCampaign
        );

        if (platformData?.data) {
          await this.$store.dispatch("setPlatformData", {
            ...platformData.data,
          });
          pData = platformData?.data;
        }
      }

      this.tableData = Object.values(pData?.subscribers ?? []).map((s) => ({
        emailAddress: s?.PK,
        firstName: s?.firstName,
        lastName: s?.lastName,
        company: s?.company,
      }));

      this.fuseSearch = new Fuse(this.tableData, {
        keys: ["PK", "firstName", "lastName", "company"],
        includeScore: true,
      });
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    await this.getSubscriberData();
    if (!this.data || typeof this.data != "object") {
      await this.getListData();
    } else {
      this.tableData = this.data;
    }

    EventBus.$on("$EventBusEvent", this.handleEventBusEvent);

    this.$emit("resultData", "subscribers", this.tableData);
    this.isLoading = false;
  },
};
</script>
<style lang="scss"></style>
