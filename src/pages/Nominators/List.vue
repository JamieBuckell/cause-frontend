<template>
  <div class="row nominators-list">
    <div class="col-12" v-if="messages && messages.length">
      <l-alert type="danger" v-for="(m, idx) in messages" :key="idx">
        <span> {{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="nominators"
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
          <div class="col-12 col-md-3">
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
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2">Type</span>
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.nomType),
                },
              ]"
              v-model="filters.nomType"
              @change="filtersChanged()"
              placeholder="Type"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.nomTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>

          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2">Approved</span>
            <el-select
              class="select-default w-100"
              :class="[
                {
                  'filter-active': isFilterActive(filters.approved),
                },
              ]"
              v-model="filters.approved"
              @change="filtersChanged()"
              placeholder="Approved"
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
        </template>
      </ListingsPage>

      <el-dialog
        center
        :visible.sync="editNominator"
        width="80%"
        style="max-width: 1000px; margin: 0 auto"
      >
        <ValidationObserver v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(handleNominatorEditSubmit)">
            <div>
              <div class="row" v-if="editMessages.length">
                <div class="col-12">
                  <l-alert type="danger" v-for="m in editMessages" :key="m">
                    <span v-html="m" />
                  </l-alert>
                </div>
              </div>
              <div class="row">
                <div class="col-12 col-md-6">
                  <ValidationProvider
                    name="firstname"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your First name"
                      :error="
                        failed ? 'The First name field is required' : null
                      "
                      :hasSuccess="passed"
                      label="First name"
                      name="firstname"
                      v-model="nominatorData.firstName"
                    ></fg-input>
                  </ValidationProvider>
                </div>
                <div class="col-12 col-md-6">
                  <ValidationProvider
                    name="lastname"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      placeholder="Your Last name"
                      :error="failed ? 'The Last name field is required' : null"
                      :hasSuccess="passed"
                      label="Last name"
                      name="lastname"
                      v-model="nominatorData.lastName"
                    ></fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <ValidationProvider
                    name="email"
                    rules="required|email"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="email"
                      placeholder="Your Email address"
                      :error="failed ? 'The Email field is required' : null"
                      :hasSuccess="passed"
                      label="Email address"
                      name="email"
                      v-model="nominatorData.emailAddress"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="col-12">
                  <ValidationProvider
                    name="telephone"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="telephone"
                      placeholder="Your Contact number"
                      :error="
                        failed ? 'The Contact number field is required' : null
                      "
                      :hasSuccess="passed"
                      label="Contact number"
                      name="telephone"
                      v-model="nominatorData.telephoneNumber"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
            </div>
            <div class="text-center">
              <button
                type="submit"
                class="btn btn-fill btn-info btn-round btn-wd"
              >
                Save
              </button>
            </div>
          </form>
        </ValidationObserver>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Select, Option } from "element-ui";
import {
  approveNominator,
  updateNominator,
  resetNominatorPassword,
} from "@/api/nominators.api";
import { deleteUser } from "@/api/users.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import LAlert from "src/components/Alert";
import Swal from "sweetalert2";
import { Dialog, MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    ListingsPage,
    [Dialog.name]: Dialog,
    LAlert,
  },
  props: {
    heading: {
      type: String,
      default: "All Nominators",
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
        prop: "userReference",
        label: "Ref",
        minWidth: 70,
      },
      {
        component: "NominatorDetail",
        label: "User Details",
        html: true,
        minWidth: 250,
      },
    ];
    const savedFilters =
      this.$store.getters.getGenericData("nominatorsFilters");
    return {
      isLoading: true,
      editMessages: [],
      messages: [],
      editNominator: false,
      tableData: [],
      fallBackSubHeading: "",
      nominatorData: {},
      pagination: {
        perPage: this.paginateOptions.perPage ?? 25,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        hidden: savedFilters?.hidden ? savedFilters.hidden : "No",
        verified: savedFilters?.verified ? savedFilters.verified : "All",
        bounced: savedFilters?.bounced ? savedFilters.bounced : "All",
        approved: savedFilters?.approved ? savedFilters.approved : "All",
        nomType: savedFilters?.nomType ? savedFilters.nomType : "All",
        nomTypeOptions: ["Team Lead", "Nominator", "All"],
        allocated: savedFilters?.allocated ? savedFilters.allocated : "All",
        allocatedOptions: [
          "All",
          "Not Allocated",
          "Part Allocated",
          "Fully Allocated",
          "Over Allocated",
        ],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        isSubscribed: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : "All",
        genericOptions: ["All", "Yes", "No"],
        sort: savedFilters?.sort ? savedFilters.sort : "Newest First",
        sortOptions: ["Newest First", "User Reference (Desc)"],
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
        if (this.filters.hidden && this.filters.hidden != "All") {
          const v = this.filters.hidden === "Yes";
          result = result.filter(
            (d) =>
              d?.donorDetails?.hidden === v || (!d?.donorDetails?.hidden && !v)
          );
        }
        if (this.filters.verified && this.filters.verified != "All") {
          const v = this.filters.verified === "Yes";
          result = result.filter(
            (d) => d?.verified === v || (!d?.verified && !v)
          );
        }
        if (this.filters.bounced && this.filters.bounced != "All") {
          const b = this.filters.bounced === "Yes";
          console.log(result);
          result = result.filter(
            (d) => d?.bounced === b || (!d?.bounced && !b)
          );
        }
        if (this.filters.approved && this.filters.approved != "All") {
          const b = this.filters.approved === "Yes";
          console.log(result);
          result = result.filter(
            (d) => d?.approved === b || (!d?.approved && !b)
          );
        }

        if (this.filters.nomType && this.filters.nomType != "All") {
          result = result.filter(
            (d) =>
              d?.type ===
              (this.filters.nomType == "Team Lead" ? "team-lead" : "nominator")
          );
          console.log(result.length);
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
                  allocationOfFamilies >= numberOfFamilies
                );
              case "over allocated":
                return (
                  numberOfFamilies > 0 &&
                  allocationOfFamilies > numberOfFamilies
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
      if (this.userInGroup("admin")) {
        propCustomActions.push({
          emit: "resetPassword",
          type: "icon",
          icon: "nc-icon nc-lock-circle-open",
          class: "btn-info",
          text: "Reset Password",
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
    async handleNominatorEditSubmit() {
      try {
        const newNomData = this?.tableData ? this.tableData.slice(0) : [];
        const res = await updateNominator(this.nominatorData);
        if (res.data.success) {
          newNomData.find((n, i) => {
            if (n.requestId === this.nominatorData.requestId) {
              this.nominatorData = { ...res.data.nominator };
              this.nominatorData.fullName = `${this.nominatorData.firstName} ${this.nominatorData.lastName}`;

              newNomData[i] = this.nominatorData;
              return true; // stop searching
            }
          });
          this.tableData = newNomData;
          this.editNominator = false;
        } else {
          this.editMessages = [];
          if (res.data.editMessages) {
            this.editMessages = res.data.messages;
          }
        }
      } catch (e) {
        if (e.message) {
          this.editMessages = [];
          this.editMessages.push(e.message);
        }
      }
    },
    async handleEdit(i, r) {
      this.editNominator = true;
      this.nominatorData = r;
      this.nominatorData.originalEmail = r.emailAddress;
    },
    async handleDelete(i, r) {
      const updateRes = await deleteUser(this.organisationId, r.emailAddress);

      if (updateRes.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }));
      }

      if (updateRes.status === 200) {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.requestId === r.requestId
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }

        const pData = this.$store.getters.getPlatformData;
        indexToDelete = pData.nominators.findIndex(
          (d) =>
            d?.SK === `EMAIL#${r.emailAddress}` &&
            d?.GSI3PK === this.organisationId
        );
        if (indexToDelete >= 0) {
          pData.nominators.splice(indexToDelete, 1);

          await this.$store.dispatch("setPlatformData", {
            ...pData,
          });
        }
      }
    },
    async approveNom(nominator) {
      const resApprove = await approveNominator(
        nominator.requestId,
        this.organisationId != ""
          ? this.organisationId
          : nominator.organisationId
      );
      if (resApprove.status == 200 && this.tableData) {
        nominator.status = "Approved";
        var foundIndex = this.tableData.findIndex(
          (n) => n.requestId == nominator.requestId
        );
        const updatedData = structuredClone(this.tableData);
        updatedData[foundIndex] = nominator;

        this.tableData = updatedData;

        const pData = this.$store.getters.getPlatformData;
        const indexToReplace = pData.nominators.findIndex(
          (d) =>
            d?.GSI2PK === nominator.requestId &&
            d?.GSI3PK === this.organisationId
        );
        if (indexToReplace >= 0) {
          const nom = { ...pData.nominators[indexToReplace] };
          nom.status = "Approved";
          pData.nominators[indexToReplace] = nom;

          await this.$store.dispatch("setPlatformData", {
            ...pData,
          });
        }
      }
      /* */
    },
    async doResetPassword(i, n) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you reset this password, the user will be emailed a new password and their old logins will cease to work.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          /* */
          const updateRes = await resetNominatorPassword(n.requestId);

          if (updateRes.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          }
          if (updateRes.status == 200) {
            Swal.fire({
              title: "Success",
              text: "Password reset was succesful.",
              timer: 3000,
              showConfirmButton: false,
            });
          }
          /* */
        }
      });
    },
    downloadCSV() {
      let rows = [
        ["Nominator Name", "Email Address", "Organisation", "Telephone"],
      ];

      if (this.tableData) {
        const data = this.tableData.map((nominator) => {
          const userOrg =
            this.organisationData && this.organisationData.length
              ? this.organisationData.find(
                  (o) =>
                    nominator.organisationId &&
                    o.requestId === nominator.organisationId
                )
              : {};

          return [
            `"${nominator.firstName} ${nominator.lastName}"`,
            `"${nominator.emailAddress ? nominator.emailAddress : ""}"`,
            `"${userOrg?.name}"`,
            `"${nominator.telephoneNumber ? nominator.telephoneNumber : ""}"`,
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
      link.setAttribute("download", `all-nominators-list.csv`);
      document.body.appendChild(link); // Required for FF

      link.click();
      link.remove();
      /* */
    },
    filtersChanged() {
      this.$store.dispatch("setGenericData", {
        key: "nominatorsFilters",
        data: this.filters,
      });
    },
    handleCustomAction(i, k, r) {
      switch (k) {
        case "viewOrganisation":
          this.$router.push(`/organisations/view/${r.organisationId}`);
          break;
        case "approve":
          this.approveNom(r);
          break;
        case "resetPassword":
          this.doResetPassword(i, r);
          break;
        default:
          this.$emit(k, i, r);
          break;
      }
    },
    async getListData() {
      if (this.platformData?.nominators) {
        console.log(this.platformData?.nominators);
        this.tableData = this.platformData?.nominators
          .filter(
            (n) =>
              (!this.organisationId || n?.GSI3PK === this.organisationId) &&
              (n?.type === "nominator" || n?.type === "team-lead")
          )
          .map((n) => ({
            requestId: n?.GSI2PK ?? "",
            userReference: n?.nominatorDetails?.reference ?? "",
            emailAddress: n?.nominatorDetails?.email ?? "",
            fullName: `${n?.nominatorDetails?.firstName ?? ""} ${
              n?.nominatorDetails?.lastName ?? ""
            }`,
            firstName: `${n?.nominatorDetails?.firstName ?? ""}`,
            lastName: `${n?.nominatorDetails?.lastName ?? ""}`,
            telephoneNumber: `${n?.nominatorDetails?.telephoneNumber ?? ""}`,
            organisationId: `${n?.GSI3PK ?? ""}`,
            status: `${n?.status ?? ""}`,
            type: `${n?.type ?? ""}`,
            verified:
              n?.emailVerification?.verified?.toLowerCase?.() === "true",
            bounced: n?.emailVerification?.bounced?.toLowerCase?.() === "true",
            approved:
              n?.emailVerification?.status?.toLowerCase?.() === "approved",
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
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.userInGroup("teamlead")) {
      this.$router.push("/");
    }
    if (!this.data || typeof this.data != "object") {
      await this.getListData();
    } else {
      this.tableData = this.data;
    }

    this.$emit("resultData", "nominators", this.tableData);
    this.isLoading = false;
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
.team-lead {
  font-weight: bold;
}
</style>
