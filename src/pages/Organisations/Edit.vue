<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <div
            class="spinner-border text-muted"
            role="status"
            v-if="isLoading.organisation"
          >
            <span class="sr-only">Loading...</span>
          </div>
          <div slot="header" v-if="!isLoading.organisation">
            <h4 class="title mt-0">
              {{ organisation.reference }} - {{ organisation.name }}
              <button
                v-if="!orgEditMode"
                type="submit"
                class="btn btn-info btn-fill btn-wd pull-right"
                @click.prevent="switchOrgEdit"
              >
                Edit Organisation Data
              </button>
            </h4>
            <div v-if="organisation.urlHash" class="pt-4">
              <p>
                As an admin, you can add & remove Team Leads for this
                team/organisation, you also have the ability to manage the
                families and nominators for this team/organisation.<br />A copy
                of the registration URL for this team/organisation is shown
                below should you require it.
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
            </div>
          </div>
          <div v-if="!isLoading.organisation">
            <form v-if="orgEditMode">
              <div class="row">
                <div class="col-md-9">
                  <fg-input
                    type="text"
                    label="Name"
                    placeholder="CAUSE Social Care Team 1"
                    v-model="organisation.name"
                  >
                  </fg-input>
                </div>
                <div class="col-md-3">
                  <fg-input
                    type="text"
                    label="Reference"
                    placeholder="CSCT1"
                    disabled="true"
                    v-model="organisation.reference"
                  >
                  </fg-input>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Lead Contact Name"
                    v-model="organisation.contacts.lead.name"
                  >
                  </fg-input>
                </div>
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Contact number"
                    v-model="organisation.contacts.lead.number"
                  >
                  </fg-input>
                </div>
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Email"
                    v-model="organisation.contacts.lead.email"
                  >
                  </fg-input>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Secondary Contact Name"
                    v-model="organisation.contacts.secondary.name"
                  >
                  </fg-input>
                </div>
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Contact number"
                    v-model="organisation.contacts.secondary.number"
                  >
                  </fg-input>
                </div>
                <div class="col-md-4">
                  <fg-input
                    type="text"
                    label="Email"
                    v-model="organisation.contacts.secondary.email"
                  >
                  </fg-input>
                </div>
              </div>

              <div class="text-center">
                <button
                  type="submit"
                  class="btn btn-info btn-fill btn-wd"
                  @click.prevent="doUpdate"
                >
                  Update Organisation
                </button>
                <button
                  class="btn btn-fill btn-wd ml-3"
                  @click.prevent="switchOrgEdit"
                >
                  Cancel
                </button>
              </div>
              <div class="clearfix"></div>
            </form>
            <div v-if="!orgEditMode">
              <div class="row">
                <div class="col col-6" v-if="organisation.contacts.lead.name">
                  <h5>Lead Contact</h5>
                  <p>{{ organisation.contacts.lead.name }}</p>
                  <p>
                    {{ organisation.contacts.lead.email }}<br />
                    {{ organisation.contacts.lead.telephone }}
                  </p>
                </div>
                <div
                  class="col col-6"
                  v-if="organisation.contacts.secondary.name"
                >
                  <h5>Secondary Contact</h5>
                  <p>{{ organisation.contacts.secondary.name }}</p>
                  <p>
                    {{ organisation.contacts.secondary.email }}<br />
                    {{ organisation.contacts.secondary.telephone }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
    <div class="row" v-if="nominatorMessages.length">
      <div class="col-12">
        <l-alert type="danger" v-for="m in nominatorMessages" :key="m">
          <span> {{ getErrorMessage(m) }}</span>
        </l-alert>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6">
        <TeamLeadsList
          v-if="organisationId"
          :organisationId="organisationId"
          :paginate="false"
          :allowSearch="false"
          @resultData.once="setModelData"
        />
      </div>
      <div class="col-12 col-md-6">
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
    <div class="row">
      <div class="col-12">
        <FamiliesList
          v-if="organisation.requestId"
          :organisation="organisation"
          heading="Families"
          subHeading=" "
          :options="familyOptions"
          :allNominators="allNominators"
          :paginateOptions="familiesPagination"
          @resultData.once="setModelData"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import {
  getOrganisationByRequest,
  updateOrganisation,
  createOrganisationAdmin,
} from "@/api/organisations.api";
import { getNominators, resetNominatorPassword } from "@/api/nominators.api";
import { getFamilyByOrganisation } from "@/api/families.api";
import Fuse from "fuse.js";
import TeamLeadsList from "@/components/Cards/TeamLeadsList.vue";
import NominatorsList from "@/pages/Nominators/List.vue";
import FamiliesList from "@/pages/Families/List.vue";
import { MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    TeamLeadsList,
    NominatorsList,
    FamiliesList,
  },
  data() {
    return {
      urlCopied: false,
      organisationId: "",
      familyOptions: {
        create: true,
        update: true,
        delete: true,
        download: true,
        resetReferences: this.isJamie(),
        splitFamily: true,
      },
      nominatorListOptions: {
        create: false,
        update: true,
        delete: true,
        download: false,
        authorise: true,
        search: false,
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
        nominators: true,
        families: true,
      },
      orgEditMode: false,
      orgAdmin: {
        email: "",
        telephone: "",
        firstName: "",
        lastName: "",
      },
      baseUrl: this.$hostname,
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
      nominatorPagination: {
        perPage: false,
      },
      familiesPagination: {
        perPage: false,
      },
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: [
        "companyName",
        "firstName",
        "lastName",
        "email",
        "families",
      ],
      tableColumns: [
        {
          prop: "firstName",
          label: "First Name",
          minWidth: 75,
        },
        {
          prop: "lastName",
          label: "Last Name",
          minWidth: 75,
        },
        {
          prop: "emailAddress",
          label: "Email",
          minWidth: 250,
        },
        {
          prop: "telephoneNumber",
          label: "Telephone",
          minWidth: 200,
        },
        {
          prop: "authorised",
          label: "Authorised",
          minWidth: 100,
        },
        /*{
          prop: "families",
          label: "Families",
          minWidth: 80,
        },*/
      ],
      tableColumnsAdmin: [
        {
          prop: "firstName",
          label: "Firstname",
          minWidth: 75,
        },
        {
          prop: "lastName",
          label: "Lastname",
          minWidth: 75,
        },
        {
          prop: "emailAddress",
          label: "Email",
          minWidth: 250,
        },
      ],
      tableData: [],
      tableDataAdmin: [],
      fuseSearch: null,
      nominatorMessages: [], //[{ error: "There has been an error!" }]
    };
  },
  computed: {
    allNominators() {
      return Object.values(this.model.nominators);
    },
    allFamilies() {
      return Object.values(this.model.families);
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
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "") {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }
      // Todo: Delete when data is available
      result.map((o) => {
        o.families = Math.floor(Math.random() * (16 - 0 + 1) + 0);
        o.authorised = o.status = "authorised" ? "Yes" : "No";
        return true;
      });
      return result.length ? result.slice(this.from, this.to) : result;
    },
    queriedDataAdmin() {
      let result = this.tableDataAdmin;

      // console.log(this.tableData);
      // Todo: Delete when data is available
      result.map((o) => {
        o.hasRegistered = this.tableData.find(
          (n) => n.emailAddress === o.emailAddress
        )
          ? "Yes"
          : "No";
        return true;
      });
      return result;
    },
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
      this.paginationTotal(this.tableData.length);
      return this.tableData.length;
    },
    unauthorisedNominators() {
      return Object.values(this.model.nominators)
        .filter((n) => n.status != "Approved")
        .map((n) => n.requestId);
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
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
    async doUpdate() {
      const res = await updateOrganisation(this.organisation);
      if (res.data.success) {
        this.switchOrgEdit();
      } else {
        //Handle Error
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    getURL() {
      return `${this.baseUrl}/register/${this.organisation.requestId}/${this.organisation.urlHash}`;
    },
    switchOrgEdit() {
      this.orgEditMode = !this.orgEditMode;
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
    if (!this.$route.params?.requestId) {
      this.$router.push("/");
    }
    this.organisationId = this.$route.params.requestId;

    this.fuseSearch = new Fuse(this.tableData, { keys: ["name", "email"] });

    const organisationData = await this.platformData.organisations.find(
      (o) => o.GSI2PK === this.organisationId
    );

    this.organisation = {
      requestId: organisationData?.GSI2PK ?? "",
      urlHash: organisationData?.urlHash ?? "",
      name: organisationData?.organisation?.name ?? "",
      reference: organisationData?.SK ?? "",
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
    this.isLoading.organisation = false;

    const familiesData = {}; //await getFamilyByOrganisation(this.organisationId);

    this.families = familiesData.data?.families;
    this.isLoading.organisation = false;
  },
};
</script>
