import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
import * as echarts from "echarts";
import { message } from "ant-design-vue";
import { useRoute } from 'vue-router';
import dataMetrics from '/@/mock/dataMetrics.json';
import datasetInfo from '/@/mock/datasetInfo.json';
import operatorsData from '/@/mock/operatorsData.json';
import radarData from '/@/mock/radarData.json';

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
  const taskId = route.params.key as string;
  
  // 获取数据指标
  const getMetrics = (id: string) => {
    const baseMetrics = datasetInfo[id as keyof typeof datasetInfo];
    if (!baseMetrics) return [];
    
    // 获取推荐算子最后一个的数据作为当前value
    const recommendWorkflows = operatorsData.recommendWorkflows[id as keyof typeof operatorsData.recommendWorkflows];
    const getValueFromLastOperator = (key: string): number => {
      if (recommendWorkflows && recommendWorkflows.length > 0) {
        const lastOperatorId = recommendWorkflows[recommendWorkflows.length - 1];
        const lastOperator = operatorsData.operators.find(op => op.id === lastOperatorId);
        if (lastOperator && lastOperator.datasetSize) {
          return (lastOperator.datasetSize as any)[key] || 0;
        }
      }
      return 0;
    };
    
    // 为每个指标添加value字段
    return baseMetrics.map((metric: any) => ({
      ...metric,
      value: getValueFromLastOperator(metric.key)
    }));
  };

  // 获取原始指标
  const getOriginalMetrics = (id: string) => {
    return dataMetrics.originalMetrics[id as keyof typeof dataMetrics.originalMetrics];
  };
  // 获取制备后指标（从 radarData.json 获取每个任务的最后一组数据）
  const getPreparedMetrics = (id: string) => {
    const secondaryData = radarData[`${id}_secondary` as keyof typeof radarData];
    if (!secondaryData || !Array.isArray(secondaryData) || secondaryData.length === 0) {
      return {};
    }
    // 返回最后一组数据
    return secondaryData[secondaryData.length - 1];
  };

  // 获取图表数据
  const getChartSeriesData = (id: string) => {
    const primaryKey = `${id}_primary` as keyof typeof radarData;
    const primaryData = radarData[primaryKey];
    
    if (!primaryData || !Array.isArray(primaryData) || primaryData.length === 0) {
      return [];
    }
    
    // 原始数据（第一组）
    const originalData = primaryData[0];
    // 制备后数据（最后一组）
    const preparedData = primaryData[primaryData.length - 1];
    
    // 转换对象数据为数组格式 [dataVolume, dataAlignment, dataRedundancy, diversityBalance, codeQuality]
    const convertToArray = (dataObj: any) => [
      dataObj.dataVolume ?? 0,
      dataObj.dataAlignment ?? 0, 
      dataObj.dataRedundancy ?? 0,
      dataObj.diversityBalance ?? 0,
      dataObj.codeQuality ?? 0
    ];
    
    const seriesData = [
      {
        name: "原始数据",
        value: convertToArray(originalData)
      },
      {
        name: "制备后数据", 
        value: convertToArray(preparedData)
      }
    ];
    
    // 硬编码颜色设置
    return seriesData.map((item: any, index: number) => ({
      ...item,
      itemStyle: index === 0 
        ? { color: "rgba(0, 155, 164, 0.8)" }
        : { color: "#f56c6c" },
      lineStyle: index === 0 
        ? { color: "rgba(0, 155, 164, 0.8)" }
        : { color: "#f56c6c" },
      areaStyle: index === 0 
        ? { color: "rgba(0, 155, 164, 0.2)" }
        : { color: "rgba(245, 108, 108, 0.2)" }
    }));
  };

  // 原始指标数据
  const originalMetrics = reactive(getOriginalMetrics(taskId));
  // 制备后指标数据
  const preparedMetrics = reactive(getPreparedMetrics(taskId));
  
  // 数据量指标
  const volumeMetrics = reactive<VolumeMetric[]>(getMetrics(taskId));
  
  // 初始化计算增长率（全部与最初原始数据比较）
  const initVolumeMetrics = () => {
    // 获取原始数据（即 recommendWorkflows 的第一个算子或 dataMetrics.json 的 previousValue）
    volumeMetrics.forEach((metric) => {
      // 以 previousValue 作为原始基准
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
  // 默认对比 originalMetrics 和 preparedMetrics
  const getImprovementRate = (key: string, currentMetrics?: DataMetrics) => {
    const original = originalMetrics[key as keyof typeof originalMetrics] || 0;
    // 如果传入 currentMetrics，则用其，否则默认用 preparedMetrics
    const current = currentMetrics
      ? currentMetrics[key as keyof typeof currentMetrics] || 0
      : (preparedMetrics[key as keyof typeof preparedMetrics] || 0);
    if (original === 0) return 0;
    return ((current - original) / original) * 100;
  };

  // 格式化提升率
  const formatImprovement = (value: number) => {
    if (value === 0) return "-";
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  // 获取指标名称（现在直接使用中文名称）
  const getMetricName = (key: string): string => {
    return key; // 直接返回键名，因为现在使用中文
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
    preparedMetrics,
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