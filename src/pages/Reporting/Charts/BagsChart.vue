<template>
  <div class="chart-container">
    <div
      :id="chartId"
      class="ct-chart ct-major-twelfth"
      :style="`min-width: ${mWidth ?? '1000px'}; `"
    ></div>
  </div>
</template>

<script>
import Chartist from "chartist";
import "chartist-plugin-tooltips";
import "chartist/dist/chartist.min.css";
import "chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css";

export default {
  name: "BagsChart",
  props: {
    mWidth: {
      type: String,
      required: false,
    },
    chartId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const { labels, series } = this.data;

      new Chartist.Bar(
        `#${this.chartId}`,
        {
          labels: labels,
          series: series,
        },
        {
          stackBars: true,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value.length > 10 ? value.slice(0, 10) + "…" : value;
            },
          },
          axisY: {
            onlyInteger: true,
          },
          chartPadding: {
            right: 40,
          },
          plugins: [
            Chartist.plugins.tooltip({
              anchorToPoint: true, // Tooltip anchors to the closest point
              appendToBody: false, // Tooltip within chart container
            }),
          ],
        }
      ).on("draw", (data) => {
        if (data.type === "bar") {
          data.element.attr({
            style: "stroke-width: 30px",
          });
        }
      });
    },
  },
};
</script>

<style>
/* Scrollable container */
.chart-container {
  overflow-x: auto; /* Enable horizontal scrolling */
  width: 100%; /* Parent container width */
  height: 600px;
}

/* Adjust the chart width */
.ct-chart {
  height: 600px;
  margin-top: 65px;
}
.ct-series-a .ct-bar {
  stroke: #009642 !important;
}
.ct-series-b .ct-bar {
  stroke: #ffa534 !important;
}
</style>
