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
            :label="`${dateOpt}`"
            :value="dateOpt"
          >
          </el-option>
        </el-select>
        <card
          :title="'Drop Off Times (' + totalHampers + ' Hampers)'"
          subTitle="Peaks of Drop Off Times by single day"
        >
          <div id="chartDropOffs" class="ct-chart"></div>
        </card>
      </div>
      <div class="col-lg-12">
        <card
          title="All Drop Off Times"
          subTitle="Peaks of Drop Off Times Combined Days"
        >
          <div id="chartAllDropOffs" class="ct-chart"></div>
        </card>
      </div>
      <!--
      <div class="col-lg-6">
        <card title="NASDAQ: AAPL" subTitle="Line Chart with Points">
          <div id="chartStock" class="ct-chart"></div>
        </card>
      </div>
      <div class="col-lg-6">
        <card title="Views" subTitle="Bar Chart">
          <div id="chartViews" class="ct-chart"></div>
        </card>
      </div>
      <div class="col-lg-6">
        <card title="Activity" subTitle="Multiple Bars Chart">
          <div id="chartActivity" class="ct-chart"></div>
        </card>
      </div>
    --></div>
  </div>
</template>
<script>
import { listFamilies } from "@/api/families.api";
import { Select, Option } from "element-ui";

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  computed: {
    activeCampaign() {
      return this.$store.getters.getActiveCampaign;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
    dateOptions() {
      switch (this.$store.getters.getActiveCampaign) {
        case "CH25":
          return ["20251204", "20251205", "20251206", "20251207"];
        case "CH24":
          return ["20241206", "20241207", "20241208"];
        default:
          return ["20231201", "20231202", "20231203"];
      }
    },
  },
  data() {
    return {
      $Chartist: null,
      dateChosen: "",
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",
      totalHampers: 0,
      familiesData: [],
      messages: [],
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
        },
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
    async dateChosen() {
      await this.initDropOffsChart();
    },
    async activeCampaign() {
      await this.updateReportData();
    },
  },
  methods: {
    getSelectedDateString() {
      if (!this.dateChosen) return null;
      const y = this.dateChosen.slice(0, 4);
      const m = this.dateChosen.slice(4, 6);
      const d = this.dateChosen.slice(6, 8);
      return `${y}-${m}-${d}`;
    },

    buildEmptyTimeSeries() {
      const series = [];
      const startMinutes = 8 * 60; // 08:00
      const endMinutes = 18 * 60 + 30; // 18:30
      for (let t = startMinutes; t <= endMinutes; t += 15) {
        series.push(0);
      }
      return series;
    },

    buildDropoffLabels() {
      return [
        "0800",
        "",
        "0830",
        "",
        "0900",
        "",
        "0930",
        "",
        "1000",
        "",
        "1030",
        "",
        "1100",
        "",
        "1130",
        "",
        "1200",
        "",
        "1230",
        "",
        "1300",
        "",
        "1330",
        "",
        "1400",
        "",
        "1430",
        "",
        "1500",
        "",
        "1530",
        "",
        "1600",
        "",
        "1630",
        "",
        "1700",
        "",
        "1730",
        "",
        "1800",
        "",
        "1830",
      ];
    },

    async fetchFamilies(force = false) {
      if (!force && this.familiesData && this.familiesData.length) {
        return;
      }
      const res = await listFamilies(this.$store.getters.getActiveCampaign);
      if (res?.data?.messages) {
        this.messages = Object.keys(res.data.messages).map((k) => ({
          error: res.data.messages[k],
        }));
      }
      this.familiesData = res?.data ?? [];
    },

    async initDropOffsChart() {
      await this.fetchFamilies();

      const dataDropOffs = {
        labels: this.buildDropoffLabels(),
        series: [],
      };

      const optionsDropOffs = {
        height: "250px",
        showPoint: false,
        lineSmooth: true,
        axisX: {
          showGrid: true,
          showLabel: true,
        },
        axisY: {
          high: 45,
        },
      };

      const selectedDate = this.getSelectedDateString();

      // no date chosen yet → just empty chart
      if (!selectedDate) {
        this.totalHampers = 0;
        this.$Chartist.Line("#chartDropOffs", dataDropOffs, optionsDropOffs);
        return;
      }

      const seriesValues = this.buildEmptyTimeSeries();
      const startMinutes = 8 * 60;

      this.familiesData.forEach((f) => {
        const received = f?.receivedDate;
        if (!received) return;

        // receivedDate: "2025-12-05 19:11:01"
        const dateStr = String(received).slice(0, 10); // "YYYY-MM-DD"
        if (dateStr !== selectedDate) return;

        const timePart = String(received).slice(11, 16); // "HH:MM"
        const [hStr, mStr] = timePart.split(":");
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return;

        // floor to nearest 15-minute slot
        const quarterMinutes = Math.floor(m / 15) * 15;
        const totalMinutes = h * 60 + quarterMinutes;
        const index = Math.floor((totalMinutes - startMinutes) / 15);

        if (index < 0 || index >= seriesValues.length) return;

        // count 1 hamper per family with a receivedDate in that slot
        seriesValues[index] += 1;
      });

      this.totalHampers = seriesValues.reduce((sum, v) => sum + v, 0);
      dataDropOffs.series = [seriesValues];

      this.$Chartist.Line("#chartDropOffs", dataDropOffs, optionsDropOffs);
    },

    async initAllDropOffsChart() {
      await this.fetchFamilies();

      const dataAllDropOffs = {
        labels: this.buildDropoffLabels(),
        series: [],
      };

      const startMinutes = 8 * 60;
      const perDate = {}; // { 'YYYY-MM-DD': [counts per slot] }

      this.familiesData.forEach((f) => {
        const received = f?.receivedDate;
        if (!received) return;

        const dateStr = String(received).slice(0, 10); // "YYYY-MM-DD"
        if (!perDate[dateStr]) {
          perDate[dateStr] = this.buildEmptyTimeSeries();
        }

        const timePart = String(received).slice(11, 16); // "HH:MM"
        const [hStr, mStr] = timePart.split(":");
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return;

        const quarterMinutes = Math.floor(m / 15) * 15;
        const totalMinutes = h * 60 + quarterMinutes;
        const index = Math.floor((totalMinutes - startMinutes) / 15);

        if (index < 0 || index >= perDate[dateStr].length) return;

        perDate[dateStr][index] += 1;
      });

      // one line per day, so you’ll see overlapping lines for each date
      dataAllDropOffs.series = Object.keys(perDate)
        .sort()
        .map((d) => perDate[d]);

      const optionsAllDropOffs = {
        height: "250px",
        showPoint: false,
        lineSmooth: true,
        axisX: {
          showGrid: true,
          showLabel: true,
        },
        axisY: {
          high: 45,
        },
      };

      this.$Chartist.Line(
        "#chartAllDropOffs",
        dataAllDropOffs,
        optionsAllDropOffs
      );
    },

    async initCharts() {
      await this.fetchFamilies(true); // force refresh for current campaign
      await this.initDropOffsChart();
      await this.initAllDropOffsChart();
    },

    async updateReportData() {
      if (!this.activeCampaign) {
        return;
      }
      this.isLoading = true;
      this.familiesData = [];
      await this.initCharts();
      this.isLoading = false;
    },
  },
  async mounted() {
    const isAdmin = await this.userInGroup("admin");
    if (!isAdmin) {
      // this.$router.push("/organisations/me");
    } else {
      const chartist = await import("chartist");
      this.$Chartist = chartist.default ? chartist.default : chartist;

      this.dateChosen = this.dateOptions[0]; // pick first date by default
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
