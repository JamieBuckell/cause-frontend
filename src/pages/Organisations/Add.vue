<template>
  <card>
    <div slot="header">
      <h4 class="title">Organisation</h4>
    </div>
    <div v-if="messages.length">
      <l-alert type="danger" v-for="m in messages" :key="m">
        <span>{{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div>
      <div class="spinner-border text-muted" role="status" v-if="isLoading">
        <span class="sr-only">Loading...</span>
      </div>
      <form v-if="!isLoading">
        <div class="row">
          <div class="col-md-6">
            <fg-input
              type="text"
              label="Name"
              placeholder="CAUSE Social Care Team 1"
              v-model="organisation.name"
              @change="updateRef()"
            >
            </fg-input>
          </div>
          <div class="col-md-3">
            <fg-input
              type="text"
              label="Reference"
              placeholder="CSCT1"
              v-model="organisation.reference"
              @change="manualRef()"
            >
            </fg-input>
          </div>
          <div class="col-md-3">
            <span class="text-muted small d-block py-1 px-2">Type</span>
            <el-select
              class="select-default w-100"
              label="Reference"
              v-model="organisation.type"
              placeholder="Organisation Type"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.orgTypes"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <!--
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
        -->

        <div class="text-right">
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd"
            @click.prevent="doCreate"
          >
            Create & Edit Organisation
          </button>
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd ml-4"
            @click.prevent="doCreate(false)"
          >
            Create Organisation Only
          </button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </card>
</template>
<script>
import { createOrganisation, checkReference } from "@/api/organisations.api";
import { Select, Option } from "element-ui";
import LAlert from "src/components/Alert";

export default {
  components: {
    LAlert,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      isLoading: true,
      organisation: {},
      filters: {
        orgTypes: ["charity", "local-authority", "school"],
      },
      messages: [],
    };
  },
  async mounted() {
    await this.initOrg();
    this.isLoading = false;
  },
  methods: {
    async initOrg() {
      this.organisation = {
        name: "",
        reference: "",
        referenceSet: false,
        campaignId: this.$store.getters.getActiveCampaign,
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
      };
    },
    async updateRef() {
      if (!this.organisation.referenceSet) {
        var matches = this.organisation.name.match(/\b(\w)/g);
        var acronym = matches.join("").toUpperCase();

        const checker = await checkReference(
          acronym,
          this.$store.getters.getActiveCampaign
        );
        this.organisation.reference = checker.data.reference;
      } else if (this.organisation.name == "") {
        this.organisation.referenceSet = false;
        this.organisation.reference = "";
      }
    },
    async manualRef() {
      this.organisation.referenceSet = true;
      const checker = await checkReference(
        this.organisation.reference,
        this.$store.getters.getActiveCampaign
      );
      this.organisation.reference = checker.data.reference;
    },
    async doCreate(redirect = true) {
      this.isLoading = true;

      const res = await createOrganisation(JSON.stringify(this.organisation));
      if (res?.status != 200 && res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      } else if (res?.data?.organisation?.GSI2PK) {
        var pData = this.$store.getters.getPlatformData;
        await this.$store.dispatch("setPlatformData", {
          pData,
        });

        if (redirect) {
          this.$router.push(
            `/organisations/view/${res.data.organisation.GSI2PK}`
          );
        } else {
          await this.initOrg();
        }
      }

      this.isLoading = false;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
};
</script>
<style></style>
