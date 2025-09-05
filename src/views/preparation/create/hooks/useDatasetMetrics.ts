import datasetInfo from '/@/mock/datasetInfo.json';
import operatorsData from '/@/mock/operatorsData.json';
import radarData from '/@/mock/radarData.json';
import { ref, reactive } from "vue";
import { useRoute } from "vue-router";

// 定义数据集指标接口
export interface DatasetMetrics {
  dataPairs: number;
  imageCount: number;
  codeCount: number;
  textCount: number;
  audioCount: number;
  relationCount: number;
  adaptiveCount: number;
  graphCount: number;
  dataPairsGrowth?: number;
  imageCountGrowth?: number;
  codeCountGrowth?: number;
  textCountGrowth?: number;
  audioCountGrowth?: number;
  relationCountGrowth?: number;
  adaptiveCountGrowth?: number;
  graphCountGrowth?: number;
}

export const useDatasetMetrics = () => {
  const route = useRoute();
  const taskId = ref(route.params.key as string);

  // 只从 mock 文件读取基础数据，增长率本地动态计算
  const getInitialData = (): DatasetMetrics => {
    const type = taskId.value === "energy" ? "energy" : "internet";
    const baseData = (datasetInfo as Record<string, any[]>)[type];
    return {
      dataPairs: baseData.find((item: any) => item.key === "dataPairs")?.previousValue ?? 0,
      imageCount: baseData.find((item: any) => item.key === "imageCount")?.previousValue ?? 0,
      codeCount: baseData.find((item: any) => item.key === "codeCount")?.previousValue ?? 0,
      textCount: baseData.find((item: any) => item.key === "textCount")?.previousValue ?? 0,
      audioCount: baseData.find((item: any) => item.key === "audioCount")?.previousValue ?? 0,
      relationCount: baseData.find((item: any) => item.key === "relationCount")?.previousValue ?? 0,
      adaptiveCount: baseData.find((item: any) => item.key === "adaptiveCount")?.previousValue ?? 0,
      graphCount: baseData.find((item: any) => item.key === "graphCount")?.previousValue ?? 0,
      dataPairsGrowth: 0,
      imageCountGrowth: 0,
      codeCountGrowth: 0,
      textCountGrowth: 0,
      audioCountGrowth: 0,
      relationCountGrowth: 0,
      adaptiveCountGrowth: 0,
      graphCountGrowth: 0
    };
  };

  const metrics = reactive<DatasetMetrics>(getInitialData());

  // 获取推荐算子最后一个的codeCount作为当前value
  const getCurrentValue = (key: string): number => {
    const type = taskId.value === "energy" ? "energy" : "internet";
    const recommendWorkflows = (radarData as any).recommendWorkflows[type];
    if (recommendWorkflows && recommendWorkflows.length > 0) {
      const lastOperatorId = recommendWorkflows[recommendWorkflows.length - 1];
      const lastOperator = operatorsData.operators.find(op => op.id === lastOperatorId);
      if (lastOperator && lastOperator.datasetSize) {
        return (lastOperator.datasetSize as any)[key] || 0;
      }
    }
    return 0;
  };

  // 计算增长率方法
  function calculateGrowthRate(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }
  
  // 保存原始数据作为基准值
  const originalMetrics = reactive({
    dataPairs: metrics.dataPairs,
    imageCount: metrics.imageCount,
    codeCount: metrics.codeCount,
    textCount: metrics.textCount,
    audioCount: metrics.audioCount,
    relationCount: metrics.relationCount,
    adaptiveCount: metrics.adaptiveCount,
    graphCount: metrics.graphCount
  });

  // 更新指标数据
  const updateMetrics = (operatorDatasetSize: {
    dataPairs?: number;
    imageCount?: number;
    codeCount?: number;
    textCount?: number;
    audioCount?: number;
    relationCount?: number;
    adaptiveCount?: number;
    graphCount?: number;
  }) => {
    // 更新当前值
    if (operatorDatasetSize.dataPairs !== undefined) metrics.dataPairs = operatorDatasetSize.dataPairs;
    if (operatorDatasetSize.imageCount !== undefined) metrics.imageCount = operatorDatasetSize.imageCount;
    if (operatorDatasetSize.codeCount !== undefined) metrics.codeCount = operatorDatasetSize.codeCount;
    if (operatorDatasetSize.textCount !== undefined) metrics.textCount = operatorDatasetSize.textCount;
    if (operatorDatasetSize.audioCount !== undefined) metrics.audioCount = operatorDatasetSize.audioCount;
    if (operatorDatasetSize.relationCount !== undefined) metrics.relationCount = operatorDatasetSize.relationCount;
    if (operatorDatasetSize.adaptiveCount !== undefined) metrics.adaptiveCount = operatorDatasetSize.adaptiveCount;
    if (operatorDatasetSize.graphCount !== undefined) metrics.graphCount = operatorDatasetSize.graphCount;

    // 计算相对于原始数据的增长率
    metrics.dataPairsGrowth = calculateGrowthRate(originalMetrics.dataPairs, metrics.dataPairs);
    metrics.imageCountGrowth = calculateGrowthRate(originalMetrics.imageCount, metrics.imageCount);
    metrics.codeCountGrowth = calculateGrowthRate(originalMetrics.codeCount, metrics.codeCount);
    metrics.textCountGrowth = calculateGrowthRate(originalMetrics.textCount, metrics.textCount);
    metrics.audioCountGrowth = calculateGrowthRate(originalMetrics.audioCount, metrics.audioCount);
    metrics.relationCountGrowth = calculateGrowthRate(originalMetrics.relationCount, metrics.relationCount);
    metrics.adaptiveCountGrowth = calculateGrowthRate(originalMetrics.adaptiveCount, metrics.adaptiveCount);
    metrics.graphCountGrowth = calculateGrowthRate(originalMetrics.graphCount, metrics.graphCount);
  };

  // 可在组件中直接使用 dataPairsGrowth、imageCountGrowth、codeCountGrowth 展示相对于原始数据的增长率

  return {
    metrics,
    updateMetrics,
    getCurrentValue,
  };
};