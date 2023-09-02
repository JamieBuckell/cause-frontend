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
          <div class="col-md-9">
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
            @click.prevent="doCreate"
          >
            Create Organisation
          </button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </card>
</template>
<script>
import { createOrganisation, checkReference } from "@/api/organisations.api";
import LAlert from "src/components/Alert";

export default {
  components: {
    LAlert,
  },
  data() {
    return {
      isLoading: true,
      organisation: {
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
      },
      messages: [],
    };
  },
  async mounted() {
    this.isLoading = false;
  },
  methods: {
    async updateRef() {
      if (!this.organisation.referenceSet) {
        var matches = this.organisation.name.match(/\b(\w)/g);
        var acronym = matches.join("").toUpperCase();

        const checker = await checkReference(acronym);
        this.organisation.reference = checker.data.reference;
      } else if (this.organisation.name == "") {
        this.organisation.referenceSet = false;
        this.organisation.reference = "";
      }
    },
    async manualRef() {
      this.organisation.referenceSet = true;
      const checker = await checkReference(this.organisation.reference);
      this.organisation.reference = checker.data.reference;
    },
    async doCreate() {
      this.isLoading = true;

      const res = await createOrganisation(JSON.stringify(this.organisation));
      if (res?.status != 200 && res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      } else if(res.data.registrationId) {
        this.$router.push(`/organisations/view/${res.registrationId}`);
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
