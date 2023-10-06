<template>
  <card>
    <div slot="header">
      <h4 class="title">Campaign</h4>
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
          <div class="col-md-8">
            <fg-input
              type="text"
              label="Name"
              placeholder="Christmas Hamper Campaign 2023"
              v-model="campaign.name"
              @change="updateRef()"
            >
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input
              type="text"
              label="Reference"
              placeholder="CH1"
              :disabled="true"
              v-model="campaign.reference"
              @change="manualRef()"
            >
            </fg-input>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <fg-input>
              <label>Campaign Dates</label>
              <el-date-picker
                v-model="campaign.dates.campaign"
                type="datetimerange"
                placeholder="Datetime picker here"
                :picker-options="pickerOptions1"
              >
              </el-date-picker>
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input>
              <label>Nomination Dates</label>
              <el-date-picker
                v-model="campaign.dates.nominations"
                type="datetimerange"
                placeholder="Datetime picker here"
                :picker-options="pickerOptions1"
              >
              </el-date-picker>
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input>
              <label>Doner Registration Dates</label>
              <el-date-picker
                v-model="campaign.dates.registration"
                type="datetimerange"
                placeholder="Datetime picker here"
                :picker-options="pickerOptions1"
              >
              </el-date-picker>
            </fg-input>
          </div>
        </div>

        <div class="text-right">
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd ml-4"
            @click.prevent="doUpdate(false)"
          >
            Update Campaign
          </button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </card>
</template>
<script>
import { updateCampaign } from "@/api/campaign.api";
import { Select, Option, DatePicker } from "element-ui";
import LAlert from "src/components/Alert";
import moment from "moment";

export default {
  components: {
    LAlert,
    [Select.name]: Select,
    [Option.name]: Option,
    [DatePicker.name]: DatePicker,
  },
  data() {
    return {
      isLoading: true,
      campaign: {},
      filters: {
        orgTypes: ["charity", "local-authority", "school"],
      },
      messages: [],
      pickerOptions1: {
        shortcuts: [
          {
            text: "Today",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "Yesterday",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "A week ago",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
    };
  },
  computed: {
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    async initCampaign() {
      this.campaign = {
        name: "",
        reference: "",
        referenceSet: false,
        dates: {
          campaign: "",
          nominations: "",
          registration: "",
        },
      };
    },
    async checkReference(ref) {
      let returnReference = ref.toUpperCase();
      const existingRef = this.$store.getters.getAllCampaigns.find(
        (c) => c.campaignId === returnReference
      );
      if (existingRef) {
        const splitRef = returnReference.match(/(\d+)(?!.*\d)/);
        const increment = splitRef[0] ? parseInt(splitRef[0]) + 1 : 1;
        returnReference = this.checkReference(
          returnReference.replace(/(.*)(\d+)(?!.*\d)/, `$1${increment}`)
        );
      }

      return returnReference;
    },
    async updateRef() {
      if (!this.campaign.referenceSet) {
        var matches = this.campaign.name.match(/\b(\w)/g);
        var acronym = matches.join("").toUpperCase();

        const checkedReference = await this.checkReference(acronym);
        this.campaign.reference = checkedReference;
      } else if (this.campaign.name == "") {
        this.campaign.referenceSet = false;
        this.campaign.reference = "";
      }
    },
    async manualRef() {
      this.campaign.referenceSet = true;
      const checkedReference = await this.checkReference(
        this.campaign.reference
      );
      this.campaign.reference = checkedReference;
    },
    async doUpdate() {
      this.isLoading = true;

      if (this.campaign?.dates?.campaign?.length) {
        this.campaign.dates.campaignStart = moment(
          this.campaign.dates?.campaign[0]
        ).toISOString();
        this.campaign.dates.campaignEnd = moment(
          this.campaign.dates?.campaign[1]
        ).toISOString();
        delete this.campaign.dates.campaign;
      }

      if (this.campaign.dates?.nominations?.length) {
        this.campaign.dates.nominationsOpen = moment(
          this.campaign.dates?.nominations[0]
        ).toISOString();
        this.campaign.dates.nominationsClosed = moment(
          this.campaign.dates?.nominations[1]
        ).toISOString();
        delete this.campaign.dates.nominations;
      }

      if (this.campaign.dates?.registration?.length) {
        this.campaign.dates.registrationOpen = moment(
          this.campaign.dates?.registration[0]
        ).toISOString();
        this.campaign.dates.registrationClosed = moment(
          this.campaign.dates?.registration[1]
        ).toISOString();
        delete this.campaign.dates.registration;
      }

      /* */
      const res = await updateCampaign(JSON.stringify(this.campaign));

      if (res.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      }
      if (res.status == 200 && res.data.campaign?.PK) {
        const existingCampaigns = [...this.$store.getters.getAllCampaigns];

        const indexToUpdate = existingCampaigns.findIndex(
          (c) => c?.campaignId === this.campaign.reference
        );
        if (indexToUpdate >= 0) {
          existingCampaigns[indexToUpdate] = {
            campaignId: res.data.campaign.PK,
            name: res.data.campaign.campaignName,
            campaignDetails: res.data.campaign.campaignDetails,
            sort: res.data.campaign.campaignDetails.campaignStart,
          };
          await this.$store.dispatch("setCampaignData", [...existingCampaigns]);
        }

        this.$router.push("/campaigns/list");
      }

      this.isLoading = false;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    async getCampaignData() {
      var allCampaigns = this.$store.getters.getAllCampaigns;
      if (allCampaigns?.length) {
        this.campaign = allCampaigns.find(
          (c) => c.campaignId === this.$route.params.campaignId
        );
        if (!this.campaign) {
          this.$router.push("/campaigns");
        } else {
          this.campaign.reference = this.$route.params.campaignId;
          this.campaign.referenceSet = true;
          this.campaign.dates = {
            campaign: [
              this.campaign?.campaignDetails?.campaignStart,
              this.campaign?.campaignDetails?.campaignEnd,
            ],
            nominations: [
              this.campaign?.campaignDetails?.nominationsOpen,
              this.campaign?.campaignDetails?.nominationsClosed,
            ],
            registration: [
              this.campaign?.campaignDetails?.registrationOpen,
              this.campaign?.campaignDetails?.registrationClosed,
            ],
          };
        }
      }
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    await this.getCampaignData();
    this.isLoading = false;
  },
  watch: {
    async platformData() {
      await this.getCampaignData();
    },
  },
};
</script>
<style></style>
