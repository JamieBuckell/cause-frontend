<template>
  <div>
    <div class="row" v-if="messages.length">
      <div class="col-12">
        <l-alert type="danger" v-for="(m, i) in messages" :key="i">
          <span> {{ getErrorMessage(m) }}</span>
        </l-alert>
      </div>
    </div>
    <div class="container" v-if="hasTelephone">
      <div class="row" v-if="nominationsClosed">
        <div class="col-12">
          <l-alert type="danger">
            <span>
              The Nomination period has now closed. Please contact
              <a href="mailto:hampers@cause-foundation.org.uk"
                >hampers@cause-foundation.org.uk</a
              >
              for more information.</span
            >
          </l-alert>
        </div>
      </div>
      <div class="row">
        <div class="col-12" :class="checkRole('teamlead') ? ' col-md-6' : ''">
          <card>
            <div
              class="spinner-border text-muted"
              role="status"
              v-if="isLoading.organisation"
            >
              <span class="sr-only">Loading...</span>
            </div>
            <div slot="header" v-if="!isLoading.organisation">
              <h4 class="title m-0">
                {{ organisation.reference }} - {{ organisation.name }}
              </h4>
            </div>
            <div v-if="organisation.urlHash && checkRole('teamlead')">
              <p>
                As a Team Lead for your team/organisation, you have the ability
                to create families yourself and/or authorise registered
                nominators.<br />
                Nominators can register themselves via the link below and
                immediately start nominating families.
              </p>
              <p>
                <strong>Registration URL:</strong><br />
                <span class="url-display text-monospace text-muted">{{
                  getURL()
                }}</span>
                -
                <a
                  href="#"
                  @click.stop="copyURL()"
                  class="btn btn-info btn-fill"
                  >Copy URL</a
                >
                <Transition
                  ><i
                    v-if="urlCopied"
                    class="nc-icon nc-check-2 copy-success"
                  ></i
                ></Transition>
              </p>
              <p>
                <strong
                  >You must authorise nominators for their families to be
                  valid!</strong
                >
              </p>
            </div>
          </card>
        </div>
        <div class="col-12 col-md-6" v-if="checkRole('teamlead')">
          <NominatorsList
            v-if="organisationId"
            :organisationId="organisationId"
            :paginateOptions="nominatorPagination"
            :searchKeys="[]"
            :options="nominatorListOptions"
            @resultData.once="setModelData"
          />
        </div>
      </div>
      <div class="row" v-if="checkRole('teamlead') || checkRole('nominator')">
        <div class="col-12">
          <FamiliesList
            v-if="organisation.requestId"
            heading="Families"
            subHeading=" "
            :organisation="organisation"
            :organisationId="organisationId"
            :nominator="nominator"
            :options="familyListOptions"
            :allNominators="allNominators"
            :paginateOptions="familiesPagination"
          />
        </div>
      </div>
    </div>
    <div class="container" v-else>
      <div class="row">
        <div class="col-12">
          <card>
            <div slot="header">
              <h4 class="title m-0">Missing Telephone</h4>
            </div>
            <div>
              <p>
                It looks like your contact telephone number is either missing or
                invalid. Please correct it below to continue.
              </p>
              <fg-input
                label="telephone"
                type="text"
                placeholder="Enter your telephone number"
                v-model="nominatorData.telephone"
              >
              </fg-input>
              <button
                type="submit"
                class="btn btn-fill btn-info"
                @click.prevent="updateTelephone"
              >
                Save
              </button>
            </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Dialog, Table, TableColumn, Select, Option } from "element-ui";

import { getOrganisationByRequest } from "@/api/organisations.api";
import { updateNominator } from "@/api/nominators.api";
import { getMeData } from "@/api/users.api";
import NominatorsList from "@/pages/Nominators/List.vue";
import FamiliesList from "@/pages/Families/List.vue";
import LAlert from "src/components/Alert";
import moment from "moment";

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    NominatorsList,
    FamiliesList,
    LAlert,
  },
  watch: {
    nominationsClosed(newVal) {
      this.familyListOptions.create = !newVal;
    },
    async platformData() {
      this.isLoading = true;

      await this.getNominatorData();
      await this.getOrganisationData();
      this.isLoading = false;
    },
  },
  data() {
    return {
      hasTelephone: true,
      nominatorData: {},
      urlCopied: false,
      familyListOptions: {
        create: true,
        update: false,
        delete: true,
        download: true,
        search: false,
        showDonor: false,
      },
      nominatorListOptions: {
        create: false,
        update: true,
        delete: true,
        download: true,
        authorise: true,
        highlight: {
          unauthorised: true,
          admin: true,
        },
      },
      model: {
        teamLeads: [],
        nominators: [],
        families: [],
      },
      isLoading: {
        organisation: true,
        teamLeads: true,
        nominators: true,
        families: true,
      },
      modals: {
        families: false,
      },
      organisationId: "",
      orgAdminEmail: "",
      baseUrl: this.$hostname,
      nominator: {
        requestId: "",
        userReference: "",
      },
      nominatorPagination: {
        perPage: false,
      },
      familiesPagination: {
        perPage: false,
      },
      organisation: {
        requestId: "",
        urlHash: "",
        name: "",
        reference: "",
        referenceSet: false,
        contacts: {
          lead: {
            name: "",
            number: "",
            email: "",
          },
          secondary: {
            name: "",
            number: "",
            email: "",
          },
        },
        familiesLimit: 0,
        familiesTotal: 0,
        status: "",
      },
      tableColumns: [
        {
          prop: "nominatorDetail",
          label: "Nominator Details",
        },
      ],
      tableColumnsFamilies: [
        {
          prop: "reference",
          label: "Hamper ID",
          minWidth: 75,
        },
        {
          prop: "totalUnit",
          label: "Family Members",
        },
        {
          prop: "status",
          label: "Status",
          minWidth: 75,
        },
      ],
      tableData: [],
      tableDataFamilies: [],
      messages: [], //[{ error: "There has been an error!" }]
    };
  },
  computed: {
    nominationsClosed() {
      const currentCampaign = this.$store.getters.getAllCampaigns.find(
        (c) => c.campaignId === this.$store.getters.getActiveCampaign
      );
      const closingDate = moment(
        currentCampaign?.campaignDetails?.nominationsClosed
      );

      return (
        !this.organisation?.alwaysNominate && moment().isAfter(closingDate)
      );
    },
    queriedData() {
      let result = this.tableData;

      result.map((o) => {
        o.families = Math.floor(Math.random() * (16 - 0 + 1) + 0);
        o.authorised = o.status == "Approved" ? true : false;
        return true;
      });
      return result;
    },
    queriedDataFamilies() {
      let result = this.tableDataFamilies;
      result.map((o) => {
        o.status = o.status && o.status != "" ? o.status : "Unassigned";
        return true;
      });
      result.sort((a, b) =>
        b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
      );
      return result;
    },
    unauthorisedNominators() {
      return Object.values(this.model.nominators)
        .filter((n) => n.status != "Approved")
        .map((n) => n.requestId);
    },
    allNominators() {
      return this?.model?.nominators.length
        ? Object.values(this.model.nominators)
        : [this.nominator];
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    async updateTelephone() {
      const regex = new RegExp(
        /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/
      );
      if (!regex.test(this.nominatorData.telephone)) {
        this.messages = [{ error: "Please enter a valid phone number." }];
      } else {
        const res = await updateNominator({
          requestId: this.nominatorData.GSI2PK,
          telephone: this.nominatorData.telephone,
          campaignId: this.$store.getters.getActiveCampaign,
        });

        if (res.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }

        if (res.status !== 200) {
        } else {
          this.hasTelephone = true;

          const pData = this.$store.getters.getPlatformData;
          const indexToReplace = pData.nominators.findIndex(
            (d) => d?.GSI2PK === this.nominatorData.GSI2PK
          );
          if (indexToReplace >= 0) {
            pData.nominators[indexToReplace] = res.data.nominator;

            await this.$store.dispatch("setPlatformData", {
              ...pData,
            });
          }
        }
      }
    },
    copyURL() {
      navigator.clipboard.writeText(this.getURL());
      this.urlCopied = true;
      setTimeout(() => {
        this.urlCopied = false;
      }, 3000);
    },
    setModelData(type, data) {
      this.model[type] = data;
    },
    saveFamilies(families) {
      this.tableDataFamilies = [...this.tableDataFamilies, ...families];
      this.closeModal("families");
    },
    cellValueRenderer(row, column, cellValue, index) {
      let value = cellValue;
      if (typeof row[column.property] === "boolean") {
        value = cellValue ? "Yes" : "No";
      }
      return value;
    },
    openModal(name) {
      this.modals[name] = true;
    },
    closeModal(name) {
      this.modals[name] = false;
    },
    checkRole(role) {
      return this.userInGroup(role);
    },
    updateRef() {
      if (!this.organisation.referenceSet) {
        var matches = this.organisation.name.match(/\b(\w)/g);
        var acronym = matches.join("").toUpperCase();

        this.organisation.reference = acronym;
      } else if (this.organisation.name == "") {
        this.organisation.referenceSet = false;
        this.organisation.reference = "";
      }
    },
    manualRef() {
      this.organisation.referenceSet = true;
    },
    getURL() {
      return `${this.baseUrl}/register/${this.organisation.requestId}/${this.organisation.urlHash}`;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    async getNominatorData() {
      var pData = this.$store.getters.getPlatformData;

      const nominatorData =
        pData?.nominators &&
        pData.nominators.find(
          (n) => n?.nominatorDetails?.email === this.$store?.getters?.usersEmail
        );

      if (nominatorData) {
        this.organisationId = nominatorData?.GSI3PK;
        this.nominator = nominatorData;

        this.nominatorData = nominatorData;
        this.hasTelephone = nominatorData?.nominatorDetails?.telephone.length;
      }
    },
    async getOrganisationData() {
      var pData = this.$store.getters.getPlatformData;

      const organisationData =
        pData?.organisations && pData.organisations.length
          ? pData.organisations[0]
          : {};

      this.organisation = {
        requestId: organisationData?.GSI2PK ?? "",
        campaign: organisationData?.PK ?? "",
        urlHash: organisationData?.urlHash ?? "",
        name: organisationData?.organisation?.name ?? "",
        reference: organisationData?.SK ?? "",
        alwaysNominate:
          organisationData?.organisation?.ignoreNominationEndDate ?? false,
        referenceSet: organisationData?.SK !== "",
        contacts: {
          lead: {
            name: organisationData?.organisation?.leadContactName,
            number: organisationData?.organisation?.leadContactNumber,
            email: organisationData?.organisation?.leadContactEmail,
          },
          secondary: {
            name: organisationData?.organisation?.secondaryContactName,
            number: organisationData?.organisation?.secondaryContactNumber,
            email: organisationData?.organisation?.secondaryContactEmail,
          },
        },
        familiesLimit: organisationData?.organisation?.familiesLimit ?? null,
        familiesTotal: organisationData?.organisation?.totalFamilies ?? 0,
        status: organisationData?.status ?? "",
      };
    },
  },
  async mounted() {
    if (!this.userInGroup("teamlead") && !this.userInGroup("nominator")) {
      this.$router.push("/");
    }

    await this.getNominatorData();

    if (!this.organisationId) {
      // this.$router.push("/");
    }

    await this.getOrganisationData();

    this.isLoading.organisation = false;
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
.el-table__row {
  &.unauthorised {
    & > td {
      & > div {
        &:not(.always-show) {
          opacity: 0.3;
        }
      }
    }
  }
}
.url-display {
  font-size: 0.8rem;
  font-weight: 700;
  line-break: anywhere;
}
.copy-url {
  font-weight: 700;
}
</style>
