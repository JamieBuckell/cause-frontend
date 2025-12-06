<template>
  <div>
    <div class="row">
      <div class="col-lg-12">
        Date:
        <el-select
          class="select-default mb-0"
          v-model="dateChosen"
          placeholder="Dates"
          filterable
          default-first-option
        >
          <el-option
            class="select-default"
            v-for="dateOpt in dateOptions"
            :key="dateOpt"
            :label="`${dateOpt != '' ? dateOpt : 'All'}`"
            :value="dateOpt"
          >
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-3">
        <h3>Bags Dropped Off: {{ totalBagsDropped ?? 0 }}</h3>
      </div>
      <div class="col-lg-3">
        <h3>Hampers Dropped Off: {{ totalHampersDropped ?? 0 }}</h3>
      </div>
    </div>
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
    dateOptions() {
      switch (this.$store.getters.getActiveCampaign) {
        case "CH25":
          return ["", "20251204", "20251205", "20251206", "20251207"];
        case "CH24":
          return ["", "20241206", "20241207", "20241208"];
        default:
          return ["", "20231201", "20231202", "20231203"];
      }
    },
  },
  data() {
    return {
      dateChosen: "",
      $Chartist: null,
      bagsChartData: {
        labels: [],
        series: [],
      },
      hampersChartData: {
        labels: [],
        series: [],
      },
      totalBagsDropped: 0,
      totalHampersDropped: 0,
      isLoading: true,
      familiesData: [],
    };
  },
  watch: {
    async dateChosen() {
      // When the date changes, rebuild charts + totals
      this.isLoading = true;
      await this.initCharts();
      this.isLoading = false;
    },
    activeCampaign() {
      this.updateReportData();
    },
  },
  methods: {
    async getFamiliesData() {
      const familiesResult = await listFamilies(
        this.$store.getters.getActiveCampaign
      );

      this.familiesData = familiesResult?.data ?? [];
    },
    getSelectedDateString() {
      if (!this.dateChosen) return null;
      // dateChosen is in form "20251205" -> convert to "2025-12-05"
      const y = this.dateChosen.slice(0, 4);
      const m = this.dateChosen.slice(4, 6);
      const d = this.dateChosen.slice(6, 8);
      return `${y}-${m}-${d}`;
    },

    async initBagsChart() {
      let orgs = this.$store.getters.getPlatformData?.organisations ?? [];

      // Attach families to orgs for the chart
      orgs = orgs
        .map((o) => ({
          ...o,
          families: this.familiesData.filter((f) => f.GSI3PK == o.GSI1PK),
        }))
        .filter((o) => o.families.length);

      const allFamiliesWithBags = this.familiesData.filter(
        (f) => f.bagsReceived
      );

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

      const selectedDate = this.getSelectedDateString();

      const familiesForTotal = this.familiesData.filter((f) => {
        if (!f?.bagsReceived) return false;

        // If no date chosen, count all received
        if (!selectedDate) return true;

        // If date chosen, require receivedDate and matching date
        if (!f?.receivedDate) return false;

        const receivedDateStr = String(f.receivedDate).slice(0, 10); // "YYYY-MM-DD"
        return receivedDateStr === selectedDate;
      });

      this.totalBagsDropped = familiesForTotal.reduce(
        (sum, family) => sum + Number(family?.bagsReceived ?? 0),
        0
      );

      this.bagsChartData = {
        labels: orgs.map((item) => item.SK),
        series: [bagsDroppedByOrg, bagsRemainingByOrg],
      };
    },

    async initHampersChart() {
      let orgs = this.$store.getters.getPlatformData?.organisations ?? [];

      orgs = orgs
        .map((o) => ({
          ...o,
          families: this.familiesData.filter((f) => f.GSI3PK == o.GSI1PK),
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

      const selectedDate = this.getSelectedDateString();

      const familiesForTotal = this.familiesData.filter((f) => {
        if (!f?.bagsReceived) return false;

        if (!selectedDate) return true;

        if (!f?.receivedDate) return false;

        const receivedDateStr = String(f.receivedDate).slice(0, 10);
        return receivedDateStr === selectedDate;
      });

      this.totalHampersDropped = familiesForTotal.length;

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
      await this.initCharts();
    },
  },
  async mounted() {
    const isAdmin = await this.userInGroup("admin");
    if (!isAdmin) {
      this.$router.push("/organisations/me");
    } else {
      await this.getFamiliesData();

      const chartist = await import("chartist");
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
