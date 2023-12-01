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
    platformFamilies() {
      return this.$store.getters.getPlatformFamilies;
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
    async platformFamilies() {
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

      const donors = [...(this.$store.getters.getPlatformData?.donors ?? [])];
      const families = [...(this.$store.getters.getPlatformFamilies ?? [])];
      const nominators = [
        ...(this.$store.getters.getPlatformData?.nominators ?? []),
      ];
      const organisations = [
        ...(this.$store.getters.getPlatformData?.organisations ?? []),
      ];
      const subscribers = [
        ...(this.$store.getters.getPlatformData?.subscribers ?? []),
      ];
      if (donors.length) {
        const verifiedDonors = donors.filter(
          (d) => d?.emailVerification?.verified === true
        );

        this.dashdata.donors.value = (donors.length ?? 0).toString();
        this.dashdata.donors.subvalue =
          (verifiedDonors.length ?? 0).toString() + " Verified";
        this.dashdata.families.value = (families.length ?? 0).toString();

        this.dashdata.families.subvalue =
          families
            .reduce((a, b) => parseInt(a) + parseInt(b?.totalUnit ?? 0), 0)
            .toString() + " Individuals";

        this.dashdata.hampersDropped.value = (
          families.length
            ? families.filter((f) => f?.receiveStatus === "hamper-received")
                .length
            : 0
        ).toString();

        this.dashdata.organisations.value = (
          organisations.length ?? 0
        ).toString();
        this.dashdata.nominators.value = (nominators.length ?? 0).toString();

        this.dashdata.pledged.value = donors.reduce((accumulator, d) => {
          return (
            accumulator +
            d.familyDetails.request.reduce((subAccumulator, r) => {
              return subAccumulator + parseInt(r?.numberOfFamilies ?? 0);
            }, 0)
          );
        }, 0);
        this.dashdata.pledged.subvalue =
          verifiedDonors.reduce((accumulator, d) => {
            return (
              accumulator +
              d.familyDetails.request.reduce((subAccumulator, r) => {
                return subAccumulator + parseInt(r?.numberOfFamilies ?? 0);
              }, 0)
            );
          }, 0) + " Verified";

        this.dashdata.allocated.value = donors.reduce((accumulator, d) => {
          return (
            accumulator +
            d?.familyDetails?.request.reduce((a2, r) => {
              // return a2 + r?.allocation ? parseInt(r.allocation.length) : 0;
              return (
                a2 +
                ([
                  "allocated-sent",
                  "allocated-unconfirmed",
                  "allocated-confirmed",
                ].includes(d.status)
                  ? parseInt(r.allocation.length)
                  : 0)
              );
            }, 0)
          );
        }, 0);
      }

      if (subscribers.length) {
        this.dashdata.subscribers.value =
          Object.values(subscribers).filter(
            (s) => s.subscribed === true && s.verified === true
          ).length ?? 0;
        this.dashdata.subscribers.subvalue =
          (Object.values(subscribers).filter(
            (s) => s.subscribed === false && s.verified === true
          ).length ?? 0) + " Unsubscribed";
      }
      return;
      // To Do: Update this!
      /* *
      this.dashdata.admins.value = (dashData.data.admins ?? 0).toString();
      this.dashdata.allocated.value = (dashData.data.allocated ?? 0).toString();
      this.dashdata.allocated.subvalue =
        (dashData.data.allocatedConfirmed ?? 0).toString() + " confirmed";


        this.dashdata.pledged.value = (dashData.data.pledged ?? 0).toString();
      this.dashdata.pledged.subvalue =
        (dashData.data.pledgedVerified ?? 0).toString() + " verified";
      this.dashdata.families.value = (dashData.data.families ?? 0).toString();
      this.dashdata.hampersDropped.value = (
        dashData.data.hampersDropped ?? 0
      ).toString();
      this.dashdata.hampersDropped.subvalue =
        (
          (dashData.data.allocatedConfirmed ?? 0) -
          (dashData.data.hampersDropped ?? 0)
        ).toString() + " awaiting";
      /* */
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
