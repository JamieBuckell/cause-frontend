<template>
  <card>
    <div slot="header">
      <h4 class="title">Organisation</h4>
    </div>
    <div v-if="messages.length">
      <l-alert type="danger" v-for="(m, idx) in messages" :key="idx">
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
            <label>Type</label>
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
                v-for="(item, idx) in filters.orgTypes"
                :key="idx"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <form>
          <div class="row">
            <div class="col">
              <div class="row" v-for="(tl, i) in teamLeads" :key="i">
                <div class="col-md-2">
                  <fg-input
                    type="text"
                    label="Firstname"
                    v-model="tl.firstName"
                  >
                  </fg-input>
                </div>
                <div class="col-md-2">
                  <fg-input type="text" label="Lastname" v-model="tl.lastName">
                  </fg-input>
                </div>
                <div class="col col-md-3">
                  <fg-input type="text" label="Email" v-model="tl.email">
                  </fg-input>
                </div>
                <div class="col-md-3">
                  <fg-input
                    type="text"
                    label="Telephone"
                    v-model="tl.telephone"
                  >
                  </fg-input>
                </div>
                <div class="col-md-2">
                  <label>Send Welcome Email</label>

                  <el-select
                    class="select-default w-100"
                    v-model="tl.sendEmail"
                    autocomplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  >
                    <el-option
                      class="select-default"
                      key="yes"
                      label="Yes"
                      value="yes"
                    />
                    <el-option key="no" label="No" value="no" />
                  </el-select>
                </div>
              </div>
            </div>
            <div class="col-md-1">
              <button
                class="btn btn-outline btn-fill btn-round btn-icon d-none d-lg-block mx-auto mt-4"
                @click.prevent="addTeamLead"
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </form>

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
import { createNominator } from "@/api/nominators.api";
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
      teamLeads: [],
    };
  },
  async mounted() {
    await this.initOrg();
    this.isLoading = false;
  },
  methods: {
    async addTeamLead() {
      this.teamLeads.push({
        firstName: "",
        lastName: "",
        telephone: "",
        email: "",
        sendEmail: "no",
      });
    },
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
      this.teamLeads = [];
      this.addTeamLead();
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

      /* */
      const res = await createOrganisation(JSON.stringify(this.organisation));

      if (res.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      }
      if (res.status == 200 && res?.data?.organisation?.GSI2PK) {
        var pData = this.$store.getters.getPlatformData;

        const tlPromises = [];
        for (const tl of this.teamLeads) {
          if (tl?.email) {
            tlPromises.push(
              createNominator({
                campaign: this.$store.getters.getActiveCampaign,
                organisationId: res?.data?.organisation?.GSI2PK,
                email: tl.email,
                telephone: tl?.telephone ?? "",
                firstname: tl?.firstName ?? "",
                lastname: tl?.lastName ?? "",
                type: "team-lead",
                sendEmail: tl?.sendEmail === "yes" ?? false,
              })
            );
          }
        }

        await Promise.all(tlPromises).then((users) => {
          if (users.length) {
            for (const tl of users) {
              console.log("tl promise", tl, tl?.data, tl?.data?.nominator);
              if (tl?.data?.nominator) {
                pData.nominators.push(tl.data.nominator);
              }
            }
          }
          console.log(users);
        });

        pData.organisations.push(res?.data?.organisation);
        await this.$store.dispatch("setPlatformData", {
          ...pData,
        });

        if (redirect) {
          this.$router.push(
            `/organisations/view/${res.data.organisation.GSI2PK}`
          );
        } else {
          await this.initOrg();
        }
      }
      /* */

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
