<template>
  <div>
    <div class="row">
      <template v-for="(stat, i) in dashdata">
        <div
          class="col-xl-3 col-md-6"
          v-if="stat.active"
          :key="i"
          :class="stat.class"
        >
          <router-link :to="stat.url">
            <stats-card>
              <div slot="header" class="icon-warning">
                <i class="nc-icon" :class="stat.icon"></i>
              </div>
              <template slot="content">
                <p class="card-category">Total {{ stat.title }}</p>
                <div
                  class="spinner-border text-muted"
                  role="status"
                  v-if="isLoading"
                >
                  <span class="sr-only">Loading...</span>
                </div>
                <div v-else>
                  <h4 class="card-title">{{ stat.value }}</h4>
                  <h4 class="card-subtitle" v-if="stat.subvalue">
                    {{ stat.subvalue }}
                  </h4>
                </div>
              </template>
              <template slot="footer">
                Click to view all {{ stat.title.toLowerCase() }}
              </template>
            </stats-card>
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { StatsCard } from "src/components/index";
import { getDashboard } from "@/api/campaign.api";

export default {
  components: {
    StatsCard,
  },
  computed: {
    activeCampaign() {
      return this.$store.getters.getActiveCampaign;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  data() {
    return {
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",
      pieChart: {
        data: {
          labels: ["40%", "20%", "40%"],
          series: [40, 20, 40],
        },
      },
      dashdata: {
        donors: {
          url: "/donors/list",
          icon: "nc-delivery-fast text-primary",
          class: "order-1",
          title: "Donors",
          value: "0",
          active: true,
        },
        families: {
          url: "/families/list",
          icon: "nc-satisfied text-info",
          class: "order-3 order-xl-2",
          title: "Families",
          value: "0",
          subvalue: "0 Individuals",
          active: true,
        },
        organisations: {
          url: "/organisations/list",
          icon: "nc-istanbul text-secondary",
          class: "order-5 order-xl-3",
          title: "Organisations",
          value: "0",
          active: true,
        },
        subscribers: {
          url: "/subscribers/list",
          icon: "nc-email-85 text-warning",
          class: "order-7 order-xl-4",
          title: "Subscribers",
          value: "0",
          active: true,
        },
        pledged: {
          url: "/donors/list",
          icon: "nc-app text-primary",
          class: "order-2 order-xl-5",
          title: "Pledged",
          value: "0",
          subvalue: "0 verified",
          active: true,
        },
        allocated: {
          url: "/families/list",
          icon: "nc-check-2 text-info",
          class: "order-4 order-xl-6",
          title: "Allocated Families",
          value: "0",
          // subvalue: "0 confirmed",
          active: true,
        },
        nominators: {
          url: "/nominators/list",
          icon: "nc-delivery-fast text-secondary",
          class: "order-6 order-xl-7",
          title: "Nominators",
          value: "0",
          active: true,
        } /*
        admins: {
          url: "/admin/users",
          icon: "nc-badge text-warning",
          class: "order-8 order-xl-8",
          title: "Admin Users",
          value: "0",
          active: true,
        },*/,
        hampersDropped: {
          url: "/hampers/list",
          icon: "nc-bag text-primary",
          class: "order-9 order-xl-9",
          title: "Hampers Dropped Off",
          value: "0",
          active: true,
        },
      },
      isLoading: true,
    };
  },
  watch: {
    activeCampaign(newQuestion, oldQuestion) {
      this.updateDashData();
    },
    async platformData() {
      this.isLoading = true;
      await this.updateDashData();
      this.isLoading = false;
    },
  },
  methods: {
    async updateDashData() {
      if (!this.activeCampaign) {
        return;
      }
      const dashData = await getDashboard(this.activeCampaign);

      this.dashdata.donors.value = (dashData.data.donors ?? 0).toString();
      this.dashdata.donors.subvalue =
        (dashData.data.verifiedDonors ?? 0).toString() + " Verified";
      this.dashdata.families.value = (dashData.data.families ?? 0).toString();
      this.dashdata.families.subvalue =
        (dashData.data.individuals ?? 0).toString() + " Individuals";
      this.dashdata.hampersDropped.value = (
        dashData.data.hampersDelivered ?? 0
      ).toString();
      this.dashdata.organisations.value = (
        dashData.data.organisations ?? 0
      ).toString();
      this.dashdata.nominators.value = (
        dashData.data.nominators ?? 0
      ).toString();
      this.dashdata.pledged.value = (dashData.data.pledged ?? 0).toString();
      this.dashdata.pledged.subvalue =
        (dashData.data.verifiedPledged ?? 0).toString() + " Verified";
      this.dashdata.allocated.value = (dashData.data.allocated ?? 0).toString();
      this.dashdata.subscribers.value = (
        dashData.data.subscribers ?? 0
      ).toString();
      this.dashdata.subscribers.subvalue =
        (dashData.data.unsubscribedSubscribers ?? 0).toString() +
        " Unsubscribed";
    },
  },
  async mounted() {
    const isAdmin = await this.userInGroup("admin");
    if (!isAdmin) {
      this.$router.push("/organisations/me");
    } else {
      await this.updateDashData();
      this.isLoading = false;
    }
  },
};
</script>
<style scoped>
.card-subtitle {
  font-size: 0.8rem;
  font-weight: bold;
}
</style>
