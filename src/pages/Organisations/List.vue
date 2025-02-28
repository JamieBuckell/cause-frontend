<template>
  <div class="row">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="organisations"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        @downloadCSV="downloadCSV"
        :dataLoading="dataLoading"
      >
        <template v-slot:header>
          All Organisations

          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd pull-right"
            @click.prevent="handleCreate"
          >
            Add Organisation
          </button>
          <p class="small">Total Families: {{ totalFamiliesCount }}</p>
        </template>
        <template v-slot:filters>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Has Nominated?</span
            >
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.hasNominated),
                },
              ]"
              v-model="filters.hasNominated"
              @change="filtersChanged()"
              placeholder="hasNominated"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="(item, idx) in filters.hasNominatedOptions"
                :key="idx"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Organisation Type</span
            >
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.organisationType),
                },
              ]"
              v-model="filters.organisationType"
              @change="filtersChanged()"
              placeholder="organisationType"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="(item, idx) in filters.organisationTypeOptions"
                :key="idx"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
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
                v-for="(item, idx) in filters.sortOptions"
                :key="idx"
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
import { deleteOrganisation } from "@/api/organisations.api";
import { getByCampaign } from "@/api/campaign.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import { Select, Option } from "element-ui";

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    ListingsPage,
  },
  props: {
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
      default: () => ["reference", "name"],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: true,
        delete: true,
        download: true,
      }),
    },
  },
  data() {
    const tableColumns = [
      {
        prop: "reference",
        label: "Ref",
        minWidth: 120,
      },
      {
        prop: "name",
        label: "Name",
        minWidth: 300,
      },
      {
        prop: "totalNominators",
        label: "Nominators",
        minWidth: 80,
      },
      {
        prop: "totalFamilies",
        label: "Families",
        minWidth: 80,
      },
    ];
    const savedFilters = this.$store.getters.getGenericData(
      "organisationsFilters"
    );
    const dataLoading = false;
    return {
      dataLoading,
      tableData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 5,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        hasNominated: savedFilters?.hasNominated
          ? savedFilters.hasNominated
          : "All",
        hasNominatedOptions: ["All", "Yes", "No"],
        organisationType: savedFilters?.organisationType
          ? savedFilters.organisationType
          : "All",
        organisationTypeOptions: [
          "All",
          "Charity",
          "Local Authority",
          "School",
        ],
        sort: savedFilters?.sort ? savedFilters.sort : "Reference A-Z",
        sortOptions: [
          "Reference A-Z",
          "Reference Z-A",
          "Families (High - Low)",
          "Families (Low - High)",
        ],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        modalMessages: {
          delete: {
            message:
              "If you delete this organisation, the process cannot be undone.",
          },
        },
        create: this.options?.create ? this.options.create : false,
        edit: this.options?.update ? this.options.update : false,
        delete: this.options?.delete ? this.options.delete : false,
        download: this.options?.download ? this.options.download : false,
        search: this.options?.search ? this.options.search : true,
      },
    };
  },
  computed: {
    totalFamiliesCount() {
      const sum = this.listingsData.reduce((accumulator, org) => {
        return accumulator + parseInt(org.totalFamilies);
      }, 0);
      return sum ?? 0;
    },
    listingsData() {
      let result = this?.tableData ?? [];
      if (result.length) {
        if (this.filters.hasNominated && this.filters.hasNominated != "All") {
          result = result.filter((d) =>
            this.filters.hasNominated === "Yes"
              ? parseInt(d.totalFamilies) > 0
              : parseInt(d.totalFamilies) === 0
          );
        }
        if (
          this.filters.organisationType &&
          this.filters.organisationType != "All"
        ) {
          const orgType = this.filters.organisationType
            .toLowerCase()
            .replace(/\s/g, "-");
          result = result.filter((d) => d.organisation.type === orgType);
        }
      }

      if (this.filters.sort != "None") {
        switch (this.filters.sort) {
          case "Reference Z-A":
            result.sort((a, b) =>
              b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
            );
            break;
          case "Families (High - Low)":
            result.sort((a, b) =>
              b.totalFamilies > a.totalFamilies
                ? 1
                : a.totalFamilies > b.totalFamilies
                ? -1
                : 0
            );
            break;
          case "Families (Low - High)":
            result.sort((a, b) =>
              b.totalFamilies < a.totalFamilies
                ? 1
                : a.totalFamilies < b.totalFamilies
                ? -1
                : 0
            );
            break;
          case "Reference A-Z":
          default:
            result.sort((a, b) =>
              b.reference < a.reference ? 1 : a.reference < b.reference ? -1 : 0
            );
            break;
        }
        /*
        if (this.filters.sort && this.filters.sort === "Reference Z-A") {
          result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
          );
        } else {
          result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
          );
        }
        */
      }

      return result;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    isFilterActive(value) {
      return value !== "All" && value != "";
    },
    downloadCSV() {
      let rows = [["Ref", "Name", "Families"]];

      const data = this.listingsData.map((organisation) => {
        return [
          `"${organisation.reference}"`,
          `"${organisation.name ? organisation.name : ""}"`,
          `"${organisation.totalFamilies ? organisation.totalFamilies : 0}"`,
          ...this.platformData?.nominators
            .filter(
              (n) =>
                n?.GSI3PK === organisation.GSI2PK && n?.type === "team-lead"
            )
            .map((nominator) => [
              `"${nominator.nominatorDetails.firstName} ${nominator.nominatorDetails.lastName}"`,
              `"${nominator.nominatorDetails.email}"`,
              `"${nominator.nominatorDetails.telephone}"`,
            ])
            .flat(),
        ];
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
      link.setAttribute("download", `all-organisations-list.csv`);
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: "organisationsFilters",
        data: this.filters,
      });
    },
    async handleCreate(i, r) {
      this.$router.push(`/organisations/add`);
    },
    async handleEdit(i, r) {
      this.$router.push(`/organisations/view/${r.GSI2PK}`);
    },
    async handleDelete(i, r) {
      this.dataLoading = true;
      const updateRes = await deleteOrganisation(
        r.GSI2PK,
        this.$store.getters.getActiveCampaign
      );
      if (updateRes.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      }
      if (updateRes?.status === 200) {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.GSI2PK === r.GSI2PK
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
        const pData = this.$store.getters.getPlatformData;
        indexToDelete = pData.organisations.findIndex(
          (d) => d?.GSI2PK === r.GSI2PK
        );
        if (indexToDelete >= 0) {
          pData.organisations.splice(indexToDelete, 1);

          await this.$store.dispatch("setPlatformData", {
            ...pData,
          });
        }
      }
      this.dataLoading = false;
    },
    async getOrganisationsData() {
      var pData = this.$store.getters.getPlatformData;

      if (!pData?.organisations) {
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

      this.tableData = Object.values(pData?.organisations ?? []);

      this.tableData.map((o) => {
        o.reference = `${o.SK}`;
        o.name = `${o.organisation.name}`;
        o.totalFamilies = `${o.totalFamilies}`;
        o.totalNominators = `${
          this.platformData.nominators.filter((f) => f?.GSI3PK === o.GSI2PK)
            .length ?? 0
        }`;
        return true;
      });
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.organisationId) {
      this.$router.push("/");
    }
    await this.getOrganisationsData();
  },
  watch: {
    async platformData() {
      await this.getOrganisationsData();
    },
  },
};
</script>
