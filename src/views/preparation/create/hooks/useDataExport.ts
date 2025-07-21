import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
import * as echarts from "echarts";
import { message } from "ant-design-vue";
import { useRoute } from 'vue-router';
import dataMetrics from '/@/mock/dataMetrics.json';

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
  const route = useRoute();
  const taskId = route.params.id as string;
  
  // 获取数据指标
  const getMetrics = (id: string) => {
    const metrics = dataMetrics.volumeMetrics[id as keyof typeof dataMetrics.volumeMetrics] || 
                   dataMetrics.volumeMetrics.default;
    return JSON.parse(JSON.stringify(metrics)); // 深拷贝避免污染原始数据
  };

  // 获取原始指标
  const getOriginalMetrics = (id: string) => {
    return dataMetrics.originalMetrics[id as keyof typeof dataMetrics.originalMetrics] || 
           dataMetrics.originalMetrics.default;
  };

  // 获取图表数据
  const getChartSeriesData = (id: string) => {
    return dataMetrics.chartSeriesData[id as keyof typeof dataMetrics.chartSeriesData] || 
           dataMetrics.chartSeriesData.default;
  };

  // 原始指标数据
  const originalMetrics = reactive(getOriginalMetrics(taskId));
  
  // 数据量指标
  const volumeMetrics = reactive<VolumeMetric[]>(getMetrics(taskId));
  
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
      series: [{
        name: "数据质量评估",
        type: "radar",
        data: getChartSeriesData(taskId)
      }]
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