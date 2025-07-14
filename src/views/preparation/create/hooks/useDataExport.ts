import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
import * as echarts from "echarts";
import { message } from "ant-design-vue";

export interface DataMetrics {
  [key: string]: number;
}

export interface VolumeMetric {
  label: string;
  key: string;
  value: number;
  previousValue: number;
  growthRate: number;
}

/**
 * 数据导出结果相关钩子
 * @returns 数据导出相关的状态和方法
 */
export const useDataExport = () => {
  // 图表引用和实例
  const qualityChartRef = ref<HTMLElement | null>(null);
  let qualityChart: echarts.ECharts | null = null;

  // 原始指标数据
  const originalMetrics = {
    syntaxDetection: 8.53,
    configCompleteness: 9.74,
    sampleCount: 4.44,
    imageRenderMatch: 8.6,
    missingRate: 7,
    chartTypeBalance: 6.65,
    configDiversity: 0.4,
    codeRedundancy: 0,
    imageRedundancy: 7,
  };

  // 数据量指标
  const volumeMetrics = reactive<VolumeMetric[]>([
    {
      label: "数据对数量",
      key: "dataPairs",
      value: 1305,
      previousValue: 640,
      growthRate: 0,
    },
    {
      label: "图像数量",
      key: "imageCount",
      value: 1302,
      previousValue: 580,
      growthRate: 0,
    },
    {
      label: "程序代码数量",
      key: "codeCount",
      value: 1305,
      previousValue: 592,
      growthRate: 0,
    },
  ]);

  // 初始化计算增长率
  const initVolumeMetrics = () => {
    volumeMetrics.forEach((metric) => {
      metric.growthRate = calculateGrowthRate(
        metric.previousValue,
        metric.value
      );
    });
  };

  // 计算增长率
  const calculateGrowthRate = (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  // 格式化百分比
  const formatPercent = (value: number) => {
    return value ? value.toFixed(2) : "0.00";
  };

  // 计算提升率
  const getImprovementRate = (key: string, secondaryMetrics: DataMetrics) => {
    const original = originalMetrics[key as keyof typeof originalMetrics] || 0;
    const current = secondaryMetrics[key] || 0;

    if (original === 0) return 0;
    return ((current - original) / original) * 100;
  };

  // 格式化提升率
  const formatImprovement = (value: number) => {
    if (value === 0) return "-";
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  // 获取指标名称
  const getMetricName = (key: string): string => {
    const nameMap: Record<string, string> = {
      syntaxDetection: "语法检测通过率",
      configCompleteness: "配置项完整性",
      sampleCount: "样本数量",
      imageRenderMatch: "图像与渲染截图匹配度",
      missingRate: "缺失率",
      chartTypeBalance: "图表类型均衡性",
      configDiversity: "配置项多样性",
      codeRedundancy: "代码重复性",
      imageRedundancy: "图像重复性",
    };

    return nameMap[key] || key;
  };

  // 初始化雷达图
  const initQualityChart = (secondaryMetrics: DataMetrics) => {
    if (!qualityChartRef.value) return;

    if (!qualityChart) {
      qualityChart = echarts.init(qualityChartRef.value);
    }

    const option = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        data: ["原始数据", "制备后数据"],
        bottom: 0,
        left: "center",
        selectedMode: false,
      },
      radar: {
        indicator: [
          { name: "数据量", max: 100 },
          { name: "数据表示质量", max: 100 },
          { name: "数据冗余", max: 100 },
          { name: "数据上下文质量", max: 100 },
          { name: "数据内在质量", max: 100 },
        ],
        center: ["50%", "50%"],
        radius: "60%",
      },
      series: [
        {
          name: "数据质量评估",
          type: "radar",
          data: [
            {
              name: "原始数据",
              value: [40.44, 78.8, 70, 33.55, 89.13],
              itemStyle: { color: "rgba(0, 155, 164, 0.8)" },
              lineStyle: { color: "rgba(0, 155, 164, 0.8)" },
              areaStyle: { color: "rgba(0, 155, 164, 0.2)" },
            },
            {
              name: "制备后数据",
              value: [100.0, 65.11, 71.28, 61.68, 93.77],
              itemStyle: { color: "#f56c6c" },
              lineStyle: { color: "#f56c6c" },
              areaStyle: { color: "rgba(245, 108, 108, 0.2)" },
            },
          ],
        },
      ],
    };

    qualityChart.setOption(option);
  };

  // 处理下载
  const handleDownload = () => {
    message.success("开始下载数据集");
    // 在实际项目中，这里应该调用API下载数据集
  };

  // 处理复制链接
  const handleCopyLink = () => {
    const link =
      "https://dataset-server.example.com/download/echarts-multimodal-dataset-v2";
    navigator.clipboard
      .writeText(link)
      .then(() => message.success("链接已复制到剪贴板"))
      .catch(() => message.error("复制失败，请手动复制"));
  };

  // 处理窗口大小变化
  const handleResize = () => {
    qualityChart?.resize();
  };

  // 组件卸载前清理资源
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    if (qualityChart) {
      qualityChart.dispose();
      qualityChart = null;
    }
  });

  // 初始化图表及添加窗口大小监听
  const initChart = (secondaryMetrics: DataMetrics) => {
    initQualityChart(secondaryMetrics);
    window.addEventListener("resize", handleResize);
  };

  // 初始化钩子函数时计算增长率
  initVolumeMetrics();

  return {
    qualityChartRef,
    originalMetrics,
    volumeMetrics,
    initChart,
    formatPercent,
    formatImprovement,
    getImprovementRate,
    getMetricName,
    handleDownload,
    handleCopyLink,
    calculateGrowthRate,
  };
};
