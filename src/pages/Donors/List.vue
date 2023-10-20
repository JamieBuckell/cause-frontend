<template>
  <div class="row donors-list">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="donors"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        @downloadCSV="downloadCSV"
      >
        <template v-slot:header> All Donors </template>
        <template v-slot:filters>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Email Verified</span
            >
            <el-select
              class="select-default w-100"
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
        </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Select, Option } from "element-ui";
import { deleteDonor, resendVerification } from "@/api/donors.api";
import { getByCampaign } from "@/api/campaign.api";
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
        component: "DonorDetail",
        label: "Donor Details",
        html: true,
        minWidth: 450,
      },
      {
        prop: "pledgeDetail",
        label: "Pledged",
        html: true,
        minWidth: 450,
        align: "center",
      },
      {
        prop: "dateAdded",
        label: "Date Pledged",
        minWidth: 160,
        align: "center",
      },
    ];
    const savedFilters = this.$store.getters.getGenericData("donorsFilters");
    return {
      tableData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 50,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        verified: savedFilters?.verified ? savedFilters.verified : "Yes",
        bounced: savedFilters?.bounced ? savedFilters.bounced : "All",
        pledged: savedFilters?.pledged ? savedFilters.pledged : "All",
        pledgedOptions: ["All", "1", "2", "3", "4", "5+"],
        allocated: savedFilters?.allocated ? savedFilters.allocated : "All",
        allocatedOptions: [
          "All",
          "Not Allocated",
          "Part Allocated",
          "Fully Allocated",
        ],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        isSubscribed: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        genericOptions: ["All", "Yes", "No"],
        sort: savedFilters?.sort ? savedFilters.sort : "Newest First",
        sortOptions: ["Newest First", "Oldest First"],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        modalMessages: {
          delete: {
            message: "If you delete this donor, the process cannot be undone.",
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
        if (this.filters.verified && this.filters.verified != "All") {
          const v = this.filters.verified === "Yes";
          result = result.filter(
            (d) =>
              d?.emailVerification?.verified === v ||
              (!d?.emailVerification?.verified && !v)
          );
        }
        if (this.filters.bounced && this.filters.bounced != "All") {
          const b = this.filters.bounced === "Yes";
          result = result.filter(
            (d) =>
              d.emailVerification?.bounced === b ||
              (!d?.emailVerification?.bounced && !b)
          );
        }
        if (this.filters.pledged && this.filters.pledged != "All") {
          result = result.filter((d) => {
            const p = d?.familyDetails?.request
              ? d.familyDetails.request.reduce(
                  (a, b) => a + b.numberOfFamilies,
                  0
                )
              : 0;
            return this.filters.pledged != "5+"
              ? p == this.filters.pledged
              : p >= 5;
          });
        }
        if (this.filters.allocated && this.filters.allocated != "All") {
          result = result.filter((d) => {
            const numberOfFamilies = d?.familyDetails?.request
              ? d.familyDetails.request.reduce(
                  (a, b) => a + b.numberOfFamilies,
                  0
                )
              : 0;
            const allocationOfFamilies = d?.familyDetails?.request
              ? d.familyDetails.request.reduce(
                  (a, b) => a + (b?.allocation ? b.allocation.length : 0),
                  0
                )
              : 0;
            switch (this.filters.allocated.toLowerCase()) {
              case "not allocated":
                return numberOfFamilies > 0 && allocationOfFamilies === 0;
              case "part allocated":
                return (
                  numberOfFamilies > 0 &&
                  allocationOfFamilies > 0 &&
                  allocationOfFamilies < numberOfFamilies
                );
              case "fully allocated":
                return (
                  numberOfFamilies > 0 &&
                  allocationOfFamilies === numberOfFamilies
                );
              default:
                return true;
            }
          });
        }

        if (
          this.filters.hasAdditionalInformation &&
          this.filters.hasAdditionalInformation != "All"
        ) {
          result = result.filter((d) => {
            const aI = d?.familyDetails?.request
              ? d.familyDetails.request.reduce(
                  (a, b) => a + b.additionalInfo,
                  ""
                )
              : "";
            return this.filters.hasAdditionalInformation === "Yes"
              ? aI !== ""
              : aI === "";
          });
        }

        if (this.filters.isSubscribed && this.filters.isSubscribed != "All") {
          var pData = this.$store.getters.getPlatformData;

          result = result.filter((d) => {
            const isSubscriber = pData.subscribers.find((s) => {
              return s?.PK === d?.GSI3PK && s?.subscribed;
            });

            // console.log(isSubscriber, d);

            return this.filters.isSubscribed === "Yes"
              ? isSubscriber?.PK
              : !isSubscriber?.PK;
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
      let rows = [
        [
          "Donor Name",
          "Email Address",
          "Telephone",
          "Company",
          "Families Pledged",
          "Family Detail",
          "Additional Information",
          "Source",
          "Verified",
          "Date Pledged",
        ],
      ];

      const data = this.tableData.map((donor) => {
        const aI = donor?.familyDetails?.request
          ? donor.familyDetails.request.reduce(
              (a, b) => a + b.additionalInfo,
              ""
            )
          : "";

        const numberofFamilies = donor?.familyDetails?.request
          ? donor.familyDetails.request.reduce(
              (a, b) => a + b.numberOfFamilies,
              0
            )
          : 0;
        return [
          `"${donor.firstName} ${donor.lastName}"`,
          `"${donor.GSI3PK ? donor.GSI3PK : ""}"`,
          `"${
            donor.donorDetails.telephone ? donor.donorDetails.telephone : ""
          }"`,
          `"${donor.donorDetails.company ? donor.donorDetails.company : ""}"`,
          `"${numberofFamilies ?? ""}"`,
          `"${
            donor.familyDetail ? JSON.parse(donor.familyDetail).join(", ") : ""
          }"`,
          `"${aI ?? ""}"`,
          `"${donor.donorDetails.howHeard ?? ""}"`,
          `"${donor.emailVerification?.verified ?? ""}"`,
          `"${donor.dateAdded ? donor.dateAdded : ""}"`,
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
      link.setAttribute("download", `all-donors-list.csv`);
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: "donorsFilters",
        data: this.filters,
      });
    },
    async handleEdit(i, r) {
      this.$router.push(`/donors/view/${r.GSI2PK}`);
    },
    async handleDelete(i, r) {
      const updateRes = await deleteDonor({
        campaign: this.$store.getters.getActiveCampaign,
        donorId: r?.GSI2PK ?? "UNKNOWN",
      });
      if (updateRes?.status != 200 && updateRes?.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      } else {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.GSI2PK === r.GSI2PK
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
      }
      /* */
    },
    async handleEventBusEvent(GSI2PK) {
      const donor = this.tableData.find((n) => n.GSI2PK === GSI2PK);

      if (donor.GSI2PK) {
        const sent = await resendVerification({ donorId: donor.GSI2PK });
        if (sent.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Welcome email sent successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
    },
    getPreferenceDetail(p) {
      switch (p.toLowerCase()) {
        case "single":
          return "Single Person";
        case "small":
          return "Small Family - 2 - 3 family members";
        case "medium":
          return "Medium Family - 4 - 5 family members";
        case "large":
          return "Large Family - 6 - 7 family members";
        case "extralarge":
          return "Extra Large Family - 8+ family members";
        default:
          return "No Preference";
      }
    },
    setPledgeDetail(donor) {
      const numberofFamilies = donor?.familyDetails?.request
        ? donor.familyDetails.request.reduce(
            (a, b) => a + b.numberOfFamilies,
            0
          )
        : 0;
      let donorDetail = `
              <div>
                  <div class="row">
                    <div class="col-12">
                      <span class="donorName">
                        <strong>
                          ${numberofFamilies}
                        </strong> Famil${numberofFamilies > 1 ? "ies" : "y"}`;
      donorDetail += `
                      </span>`;
      if (donor.familyDetails.request && donor.familyDetails.request.length) {
        for (const familyRequest of donor.familyDetails.request) {
          try {
            const familyDetail = familyRequest?.familyDetail
              ? typeof familyRequest?.familyDetail === "string"
                ? JSON.parse(familyRequest.familyDetail)
                : familyRequest.familyDetail
              : [];
            for (const preference of familyDetail) {
              donorDetail += `
                        - ${this.getPreferenceDetail(preference)}<br />`;
            }
          } catch (e) {
            /* eslint-disable no-console */
            console.log(e, familyRequest);
            /* eslint-enable no-console */
          }
        }
      }

      const aI = donor?.familyDetails?.request
        ? donor.familyDetails.request.reduce(
            (a, b) => a + b.additionalInfo + (b.additionalInfo ? "<br />" : ""),
            ""
          )
        : "";
      if (aI.length) {
        donorDetail += `
                      <span class="donorAdditional">
                        <strong>Additional Info:</strong> ${aI}
                      </span>`;
      }
      donorDetail += `
                    </div>
                  </div>`;
      donorDetail += `
              </div>
              `;
      return donorDetail;
    },
    async getDonorData() {
      var pData = this.$store.getters.getPlatformData;
      if (!pData?.donors) {
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

      this.tableData = Object.values(pData?.donors ?? []);

      this.tableData.map((o) => {
        o.firstName = o.donorDetails.firstName;
        o.lastName = o.donorDetails.lastName;
        o.fullName = `${o.donorDetails.firstName} ${o.donorDetails.lastName}`;
        o.email = o.GSI3PK;
        o.company = o.donorDetails.company;
        o.telephone = o.donorDetails.telephone;
        o.additionalInfo = o?.familyDetails?.request
          ? o.familyDetails.request.reduce(
              (a, b) =>
                a + b.additionalInfo + (b.additionalInfo ? "<br />" : ""),
              ""
            )
          : "";
        o.pledgeDetail = this.setPledgeDetail(o);
        o.dateAddedSort = moment(o.dateAdded).format("YYYYMMDDHHmmss");
        return true;
      });
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.userInGroup("teamlead")) {
      this.$router.push("/");
    }
    await this.getDonorData();

    EventBus.$on("$EventBusEvent", this.handleEventBusEvent);
  },
  watch: {
    async platformData() {
      await this.getDonorData();
    },
  },
};
</script>
