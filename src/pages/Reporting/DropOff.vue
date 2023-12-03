<template>
  <div>
    <div class="row">
      <div class="col-lg-12">
        Date:
        <el-select
          class="select-default mb-0"
          v-model="dateChosen"
          placeholder="Who"
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
        <card title="Drop Off Times" subTitle="Peaks of Drop Off Times">
          <div id="chartDropOffs" class="ct-chart"></div>
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
import { getDropOffsReport } from "@/api/reports.api";
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
    platformFamilies() {
      return this.$store.getters.getPlatformFamilies;
    },
  },
  data() {
    return {
      $Chartist: null,
      dateOptions: ["20231201", "20231202", "20231203"],
      dateChosen: "20231201",
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
      await this.initCharts();
    },
    activeCampaign(newQuestion, oldQuestion) {
      this.updateReportData();
    },
  },
  methods: {
    async initDropOffsChart() {
      const optionsDropOffs = {
        showPoint: false,
        lineSmooth: true,
        axisX: {
          showGrid: false,
          showLabel: true,
        },
        axisY: {
          offset: 40,
        },
        low: 0,
        high: 16,
        height: "250px",
      };

      const dataDropOffs = {
        labels: [
          "8:00",
          "8:30",
          "9:00",
          "9:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
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
        dataDropOffs.series = [[...reportRes?.data?.timeData]];
      }

      this.$Chartist.Line("#chartDropOffs", dataDropOffs, optionsDropOffs);
    },
    initActivityChart() {
      const data = {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
          [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695],
        ],
      };

      const options = {
        seriesBarDistance: 10,
        axisX: {
          showGrid: false,
        },
        height: "250px",
      };

      const responsiveOptions = [
        [
          "screen and (max-width: 640px)",
          {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          },
        ],
      ];

      this.$Chartist.Bar("#chartActivity", data, options, responsiveOptions);
    },
    initStockChart() {
      const dataStock = {
        labels: ["'07", "'08", "'09", "'10", "'11", "'12", "'13", "'14", "'15"],
        series: [
          [22.2, 34.9, 42.28, 51.93, 62.21, 80.23, 62.21, 82.12, 102.5, 107.23],
        ],
      };
      const optionsStock = {
        lineSmooth: false,
        axisY: {
          offset: 40,
          labelInterpolationFnc(value) {
            return `$${value}`;
          },
        },
        low: 10,
        height: "250px",
        high: 110,
        classNames: {
          point: "ct-point ct-green",
          line: "ct-line ct-green",
        },
      };
      this.$Chartist.Line("#chartStock", dataStock, optionsStock);
    },
    initViewsChart() {
      const dataViews = {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        series: [[542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]],
      };
      const optionsViews = {
        seriesBarDistance: 10,
        classNames: {
          bar: "ct-bar",
        },
        axisX: {
          showGrid: false,
        },
        height: "250px",
      };
      const responsiveOptionsViews = [
        [
          "screen and (max-width: 640px)",
          {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          },
        ],
      ];
      this.$Chartist.Bar(
        "#chartViews",
        dataViews,
        optionsViews,
        responsiveOptionsViews
      );
    },
    async initCharts() {
      await this.initDropOffsChart();
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
      this.$router.push("/organisations/me");
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
