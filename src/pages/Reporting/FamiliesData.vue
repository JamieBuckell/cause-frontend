<template>
  <div>
    <div class="row">
      <div class="col-lg-12">
        <strong>Families in Need</strong>
        <ul>
          <li>
            Demographics Overview:
            <ul>
              <li>
                Bar Chart: Count of each role (Mam, Dad, Boy, Girl, etc.) across
                all families.
              </li>
              <li>
                Age Distribution: Histogram of ages (grouped by years or
                months), highlighting ranges like infants, children, adults, and
                seniors.
              </li>
              <li>
                Special Needs/Dietary Overview:
                <ul>
                  <li>
                    Word Cloud: Most common keywords from free-text dietary and
                    special needs data.
                  </li>
                  <li>
                    Table or Pie Chart: Proportion of families with specific
                    dietary or special needs.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            Family Size Insights:
            <ul>
              <li>
                Pie Chart: Proportion of families by size categories (e.g.,
                Single, Small, Medium, etc.).
              </li>
              <li>
                Geographic Map: If the system collects location data, show the
                distribution of families by region/area.
              </li>
            </ul>
          </li>
        </ul>
      </div>
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
          title="Drop Off Times"
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
import { getDropOffsReport, getAllDropOffsReport } from "@/api/reports.api";
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
    async dateChosen(newVal) {
      await this.initDropOffsChart();
    },
    activeCampaign(newQuestion, oldQuestion) {
      this.updateReportData();
    },
  },
  methods: {
    async initDropOffsChart() {
      const dataDropOffs = {
        labels: [
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
        ],
        series: [],
      };

      const reportRes = await getDropOffsReport(
        this.$store.getters.getActiveCampaign,
        this.dateChosen
      );

      if (reportRes.data?.messages) {
        this.messages = Object.keys(reportRes?.data?.messages).map((k) => ({
          error: reportRes?.data?.messages[k],
        }));
      }
      if (reportRes.status == 200) {
        dataDropOffs.series = [reportRes.data.timeData];
      }

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

      this.$Chartist.Line("#chartDropOffs", dataDropOffs, optionsDropOffs);
    },
    async initAllDropOffsChart() {
      const dataAllDropOffs = {
        labels: [
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
        ],
        series: [],
      };

      const reportRes = await getAllDropOffsReport(
        this.$store.getters.getActiveCampaign
      );

      if (reportRes.data?.messages) {
        this.messages = Object.keys(reportRes?.data?.messages).map((k) => ({
          error: reportRes?.data?.messages[k],
        }));
      }
      if (reportRes.status == 200) {
        dataAllDropOffs.series = reportRes.data.allDropOffsData;
      }

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
      await this.initDropOffsChart();
      await this.initAllDropOffsChart();
      // this.initStockChart();
      // this.initViewsChart();
      // this.initActivityChart();
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
