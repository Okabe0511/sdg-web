import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import heatmapData from "/@/mock/heatmapData.json"; // 导入JSON数据

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  HeatmapChart,
  CanvasRenderer,
]);

export const useHeatmapChart = () => {
  // 用于存储 ECharts 实例的引用
  let chartInstance: echarts.ECharts | null = null;
  const chartLoaded = ref(false);

  // 初始化热力图
  const initHeatmap = (containerId: string = "main") => {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;

    chartInstance = echarts.init(chartDom);

    // 创建热力图选项
    const option = {
      xAxis: {
        type: "category",
        show: true,
      },
      yAxis: {
        type: "category",
        data: [
          "语法检测",
          "配置项完整性检测",
          "渲染一致性检测",
          "配置项多样性",
          "代码重复",
          "图像重复",
          "缺失率",
        ],
        show: true,
        axisLabel: {
          formatter: function (params: any) {
            if (params === "配置项多样性") {
              // 返回加粗的配置多样性
              return "{specialStyle|" + params + "}";
            }
            return params;
          },
          rich: {
            specialStyle: {
              fontWeight: "bold",
              backgroundColor: "rgb(192, 0, 0)", // 特殊标签的背景色
              padding: [2, 4], // 内边距 [上下, 左右]
              borderRadius: 2, // 圆角
              color: "#fff", // 文字颜色
            },
          },
        },
      },
      visualMap: {
        precision: 2,
        min: 0,
        max: 100,
        calculable: true,
        realtime: false,
        right: 0,
        inRange: {
          color: ["#313695", "#4575b4", "#74add1", "#abd9e9"],
        },
        outOfRange: {
          color: "#a50026", // 高亮大于选定数值的部分
        },
      },
      series: [
        {
          name: "热力图",
          type: "heatmap",
          data: heatmapData.data, // 使用导入的JSON数据
          emphasis: {
            itemStyle: {
              borderColor: "#333",
              borderWidth: 1,
            },
          },
          progressive: 1000,
          animation: false,
        },
      ],
    };

    // 设置图表选项
    chartInstance.setOption(option);
    chartLoaded.value = true;

    return chartInstance;
  };

  // 处理窗口大小变化
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  // 清理图表资源
  const disposeChart = () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  };

  // 重新渲染图表
  const resizeChart = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  // 组件卸载时清理资源
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    disposeChart();
  });

  return {
    chartLoaded,
    initHeatmap,
    disposeChart,
    resizeChart,
    handleResize,
  };
};