<template>
  <div class="row campaigns-list">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="campaigns"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        @downloadCSV="downloadCSV"
      >
        <template v-slot:header>
          All Campaigns

          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd pull-right"
            @click.prevent="handleCreate"
          >
            Add Campaign
          </button>
        </template>
        <template v-slot:filters>
          <!-- -->
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Active Campaigns</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.active"
              @change="filtersChanged()"
              placeholder="Active"
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
          <!--
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Number Pledged</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.pledged"
              @change="filtersChanged()"
              placeholder="Pledged"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.pledgedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Allocation Status</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.allocated"
              @change="filtersChanged()"
              placeholder="Allocated"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.allocatedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          -->
          <div class="d-none d-md-block col-md-6"></div>
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
          <!--
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Email Bounced</span
            >
            <el-select
              class="select-default w-100"
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
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Additional Information Supplied</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.hasAdditionalInformation"
              @change="filtersChanged()"
              placeholder="Has additional information"
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
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Subscribed to Mailing List?</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.isSubscribed"
              @change="filtersChanged()"
              placeholder="Subscribed to Mailing List?"
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
          -->
        </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Select, Option } from "element-ui";
import { deleteCampaign } from "@/api/campaign.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import moment from "moment";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

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
      default: () => [
        "email",
        "firstName",
        "lastName",
        "company",
        "telephone",
        "additionalInfo",
      ],
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
        prop: "name",
        label: "Campaign Name",
        html: true,
        minWidth: 260,
      },
      {
        prop: "campaignData",
        label: "Campaign",
        html: true,
        minWidth: 260,
      },
      {
        prop: "registratioData",
        label: "Registrations",
        html: true,
        minWidth: 260,
      },
      {
        prop: "nominationData",
        label: "Nominations",
        html: true,
        minWidth: 260,
      },
    ];
    const savedFilters = this.$store.getters.getGenericData("campaignsFilters");
    return {
      tableData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 50,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        active: savedFilters?.active ? savedFilters.active : "All",
        genericOptions: ["All", "Yes", "No"],
        sort: savedFilters?.sort ? savedFilters.sort : "Newest First",
        sortOptions: ["Newest First", "Oldest First"],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        modalMessages: {
          delete: {
            message:
              "If you delete this campaign, the process cannot be undone.",
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
    listingsData() {
      let result = this?.tableData ?? [];
      if (result.length) {
        if (this.filters.active && this.filters.active != "All") {
          result = result.filter((c) => {
            const campaignStart = moment(c.campaignDetails.campaignStart);
            const campaignEnd = moment(c.campaignDetails.campaignEnd);

            switch (this.filters.active.toLowerCase()) {
              case "yes":
                return moment().isBetween(campaignStart, campaignEnd);
              case "no":
                return !moment().isBetween(campaignStart, campaignEnd);
              default:
                return true;
            }
          });
        }
      }

      if (this.filters.sort && this.filters.sort === "Oldest First") {
        result.sort((a, b) =>
          a.dateAddedSort > b.dateAddedSort
            ? 1
            : b.dateAddedSort > a.dateAddedSort
            ? -1
            : 0
        );
      } else {
        result.sort((a, b) =>
          a.dateAddedSort < b.dateAddedSort
            ? 1
            : b.dateAddedSort < a.dateAddedSort
            ? -1
            : 0
        );
      }

      return result;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    downloadCSV() {
      let rows = [["Campaign Name", "Campaign Data", "Date Added"]];

      const data = this.tableData.map((campaign) => {
        return [
          `"${campaign?.name}"`,
          `""`,
          `"${campaign?.dateAdded ? campaign.dateAdded : ""}"`,
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
      link.setAttribute("download", `all-campaigns-list.csv`);
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: "campaignsFilters",
        data: this.filters,
      });
    },
    async handleCreate(i, r) {
      this.$router.push(`/campaigns/add`);
    },
    async handleEdit(i, r) {
      this.$router.push(`/campaigns/view/${r.campaignId}`);
    },
    async handleDelete(i, r) {
      const updateRes = await deleteCampaign(r.campaignId);

      if (updateRes.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      }
      if (updateRes.status == 200) {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.campaignId === r.campaignId
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
        const existingCampaigns = this.$store.getters.getAllCampaigns;

        indexToDelete = existingCampaigns.findIndex(
          (c) => c?.campaignId === r?.campaignId
        );
        if (indexToDelete >= 0) {
          existingCampaigns.splice(indexToDelete, 1);
          await this.$store.dispatch("setCampaignData", [...existingCampaigns]);
        }
      }
      /* */
    },
    setNominationData(campaign) {
      let campaignDetail = `
              <div>
                  <div class="row">
                    <div class="col-3">
                      <strong>Open:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(campaign.campaignDetails.nominationsOpen).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-3">
                      <strong>Close:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(
                        campaign.campaignDetails.nominationsClosed
                      ).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
              </div>
              `;
      return campaignDetail;
    },
    setRegistrationData(campaign) {
      let campaignDetail = `
              <div>
                  <div class="row">
                    <div class="col-3">
                      <strong>Open:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(
                        campaign.campaignDetails.registrationOpen
                      ).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-3">
                      <strong>Close:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(
                        campaign.campaignDetails.registrationClosed
                      ).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
              </div>
              `;
      return campaignDetail;
    },
    setCampaignData(campaign) {
      let campaignDetail = `
              <div>
                  <div class="row">
                    <div class="col-3">
                      <strong>Start:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(campaign.campaignDetails.campaignStart).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-3">
                      <strong>End:</strong>
                    </div>
                    <div class="col-9">
                      ${moment(campaign.campaignDetails.campaignEnd).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
              </div>
              `;
      return campaignDetail;
    },
    async getCampaignData() {
      var allCampaigns = this.$store.getters.getAllCampaigns;
      if (allCampaigns) {
        this.tableData = Object.values(allCampaigns);

        this.tableData.map((o) => {
          o.campaignData = this.setCampaignData(o);
          o.registratioData = this.setRegistrationData(o);
          o.nominationData = this.setNominationData(o);
          o.dateAddedSort = moment(o.campaignDetails.campaignStart).format(
            "YYYYMMDDHHmmss"
          );
          return true;
        });
      }
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.userInGroup("teamlead")) {
      this.$router.push("/");
    }
    await this.getCampaignData();
  },
  watch: {
    async platformData() {
      await this.getCampaignData();
    },
  },
};
</script>
<style lang="scss">
.campaigns-list {
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
