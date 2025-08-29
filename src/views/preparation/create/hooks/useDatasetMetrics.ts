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
  dataPairsGrowth?: number;
  imageCountGrowth?: number;
  codeCountGrowth?: number;
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
      dataPairsGrowth: 0,
      imageCountGrowth: 0,
      codeCountGrowth: 0
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
    codeCount: metrics.codeCount
  });

  // 更新指标数据
  const updateMetrics = (operatorDatasetSize: {
    dataPairs: number;
    imageCount: number;
    codeCount: number;
  }) => {
    // 更新当前值
    metrics.dataPairs = operatorDatasetSize.dataPairs;
    metrics.imageCount = operatorDatasetSize.imageCount;
    metrics.codeCount = operatorDatasetSize.codeCount;

    // 计算相对于原始数据的增长率
    metrics.dataPairsGrowth = calculateGrowthRate(originalMetrics.dataPairs, metrics.dataPairs);
    metrics.imageCountGrowth = calculateGrowthRate(originalMetrics.imageCount, metrics.imageCount);
    metrics.codeCountGrowth = calculateGrowthRate(originalMetrics.codeCount, metrics.codeCount);
  };

  // 可在组件中直接使用 dataPairsGrowth、imageCountGrowth、codeCountGrowth 展示相对于原始数据的增长率

  return {
    metrics,
    updateMetrics,
    getCurrentValue,
  };
};