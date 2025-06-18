<template>
  <div class="line-chart-container" ref="chartContainer"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "LineChart",
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.createChart();
    window.addEventListener("resize", this.resizeChart);
  },
  methods: {
    createChart() {
      // 初始化 ECharts 实例
      this.chart = echarts.init(this.$refs.chartContainer);

      // 设置图表配置
      this.updateChart();
    },
    updateChart() {
      if (!this.chart) return;

      // 转换 Chart.js 数据格式为 ECharts 格式
      const series = this.chartData.datasets.map((dataset) => {
        return {
          name: dataset.label,
          type: "line",
          data: dataset.data,
          lineStyle: {
            color: dataset.borderColor,
          },
          itemStyle: {
            color: dataset.borderColor,
          },
          smooth: false, // 改为非弧线
          symbol: "none",
        };
      });

      // 创建 ECharts 配置
      const option = {
        title: {
          text: this.chartOptions.plugins?.title?.text || "",
          show: this.chartOptions.plugins?.title?.display || false,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.chartData.datasets.map((dataset) => dataset.label),
          bottom:
            this.chartOptions.plugins?.legend?.position === "bottom" ? 0 : null,
          top: this.chartOptions.plugins?.legend?.position === "top" ? 0 : null,
          left: "center",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "15%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.chartData.labels,
          name: this.chartOptions.scales?.x?.title?.text || "",
          nameLocation: "middle",
          nameGap: 25,
          nameTextStyle: {
            fontWeight: "bold",
          },
          axisLabel: {
            show: true,
          },
        },
        yAxis: {
          type: "value",
          name: this.chartOptions.scales?.y?.title?.text || "",
          nameLocation: "middle",
          nameGap: 40,
          nameTextStyle: {
            fontWeight: "bold",
          },
          min: this.chartOptions.scales?.y?.min,
          max: this.chartOptions.scales?.y?.max,
          axisLabel: {
            formatter: "{value}",
          },
        },
        series: series,
      };

      // 设置图表选项
      this.chart.setOption(option);
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize();
      }
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.updateChart();
      },
    },
    chartOptions: {
      deep: true,
      handler() {
        this.updateChart();
      },
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeChart);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
};
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
