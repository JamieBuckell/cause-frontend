<template>
  <div>
    <div class="row">
      <div class="col-lg-12">
        <h2>Bags Dropped Off</h2>
        <BagsChart
          v-if="!isLoading"
          :data="bagsChartData"
          chartId="bagsDropped"
          mWidth="8000px"
        />
      </div>
      <div class="col-lg-12">
        <h2>Hampers Dropped Off</h2>
        <BagsChart
          v-if="!isLoading"
          :data="hampersChartData"
          chartId="hampersDropped"
          mWidth="8000px"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { listFamilies } from "@/api/families.api";
import { Select, Option } from "element-ui";
import BagsChart from "./Charts/BagsChart.vue";
export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    BagsChart,
  },
  computed: {
    activeCampaign() {
      return this.$store.getters.getActiveCampaign;
    },
  },
  data() {
    return {
      $Chartist: null,
      bagsChartData: {
        labels: [],
        series: [],
      },
      hampersChartData: {
        labels: [],
        series: [],
      },
      isLoading: true,
    };
  },
  watch: {
    activeCampaign(newQuestion, oldQuestion) {
      this.updateReportData();
    },
  },
  methods: {
    async initBagsChart() {
      var orgs = this.$store.getters.getPlatformData?.organisations ?? [];

      const familiesResult = await listFamilies(
        this.$store.getters.getActiveCampaign
      );

      const familiesData = familiesResult?.data ?? [];
      orgs = orgs
        .map((o) => ({
          ...o,
          families: familiesData.filter((f) => f.GSI3PK == o.GSI1PK),
        }))
        .filter((o) => o.families.length);

      const allFamiliesWithBags = familiesData.filter((f) => f.bagsReceived);

      const totalWeightedBagsGlobal = allFamiliesWithBags.reduce(
        (sum, family) => sum + family.bagsReceived * (family?.totalUnit ?? 1),
        0
      );
      const totalUnitsGlobal = allFamiliesWithBags.reduce(
        (sum, family) => sum + (family?.totalUnit ?? 1),
        0
      );

      const globalWeightedAveragePerUnit =
        totalUnitsGlobal > 0 ? totalWeightedBagsGlobal / totalUnitsGlobal : 0;

      const results = orgs.map((item) => {
        const families = item?.families || [];

        const familiesWithBags = families.filter((f) => f.bagsReceived);
        const familiesWithoutBags = families.filter((f) => !f?.bagsReceived);

        const estimatedBags = familiesWithoutBags.reduce(
          (sum, family) =>
            sum + Number(family?.totalUnit ?? 1) * globalWeightedAveragePerUnit,
          0
        );

        const actualBagsReceived = familiesWithBags.reduce(
          (sum, family) => sum + Number(family?.bagsReceived ?? 0),
          0
        );

        return [
          {
            value: Math.round(actualBagsReceived).toFixed(0),
            meta: "Bags Recieved",
          },
          {
            value: Math.round(estimatedBags).toFixed(0),
            meta: "Estimated Bags Remaining",
          },
        ];
      });

      const bagsDroppedByOrg = results.map(([dropped]) => dropped);
      const bagsRemainingByOrg = results.map(([, remaining]) => remaining);

      this.bagsChartData = {
        labels: orgs.map((item) => item.SK),
        series: [bagsDroppedByOrg, bagsRemainingByOrg],
      };
    },
    async initHampersChart() {
      var orgs = this.$store.getters.getPlatformData?.organisations ?? [];

      const familiesResult = await listFamilies(
        this.$store.getters.getActiveCampaign
      );

      const familiesData = familiesResult?.data ?? [];
      orgs = orgs
        .map((o) => ({
          ...o,
          families: familiesData.filter((f) => f.GSI3PK == o.GSI1PK),
        }))
        .filter((o) => o.families.length);

      const results = orgs.map((item) => {
        const families = item?.families || [];

        const familiesWithBags = families.filter((f) => f.bagsReceived);
        const familiesWithoutBags = families.filter((f) => !f?.bagsReceived);

        return [
          {
            value: Math.round(familiesWithBags.length).toFixed(0),
            meta: "Hampers Recieved",
          },
          {
            value: Math.round(familiesWithoutBags.length).toFixed(0),
            meta: "Hampers Remaining",
          },
        ];
      });

      const familiesWithBagsByOrg = results.map(([dropped]) => dropped);
      const familiesWithoutBagsByOrg = results.map(
        ([, remaining]) => remaining
      );

      this.hampersChartData = {
        labels: orgs.map((item) => item.SK),
        series: [familiesWithBagsByOrg, familiesWithoutBagsByOrg],
      };
    },
    async initCharts() {
      await this.initBagsChart();
      await this.initHampersChart();
    },
    async updateReportData() {
      if (!this.activeCampaign) {
        return;
      }

      return;
    },
  },
  async mounted() {
    const isAdmin = await this.userInGroup("admin");
    if (!isAdmin) {
      // this.$router.push("/organisations/me");
    } else {
      let chartist = await import("chartist");
      this.$Chartist = chartist.default ? chartist.default : chartist;
      await this.initCharts();

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
