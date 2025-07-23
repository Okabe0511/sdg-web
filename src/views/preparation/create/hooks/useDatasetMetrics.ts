import { ref, reactive } from "vue";
import { useRoute } from "vue-router";
import datasetMetricsData from '/@/mock/datasetMetrics.json';

// 定义数据集指标接口
export interface DatasetMetrics {
  dataPairs: number;
  dataPairsGrowth: number;
  imageCount: number;
  imageCountGrowth: number;
  codeCount: number;
  codeCountGrowth: number;
}

export const useDatasetMetrics = () => {
  const route = useRoute();
  const taskId = ref(route.params.id as string);

  // 初始化指标数据
  const getInitialData = (): DatasetMetrics => {
    if (taskId.value === "1") {
      return { ...datasetMetricsData.DatasetMetrics1 };
    }
    if (taskId.value === "2") {
      return { ...datasetMetricsData.DatasetMetrics2 };
    }
    return { ...datasetMetricsData.DatasetMetricsDefault };
  };

  const metrics = reactive<DatasetMetrics>(getInitialData());

  // 上一次的指标数据，用于计算增长率
  const previousMetrics = reactive({
    ...datasetMetricsData.PreviousMetricsDefault
  });

  // 更新指标数据
  const updateMetrics = (operatorDatasetSize: {
    dataPairs: number;
    imageCount: number;
    codeCount: number;
  }) => {
    // 计算增长率
    metrics.dataPairsGrowth = calculateGrowthRate(
      previousMetrics.dataPairs,
      operatorDatasetSize.dataPairs
    );
    metrics.imageCountGrowth = calculateGrowthRate(
      previousMetrics.imageCount,
      operatorDatasetSize.imageCount
    );
    metrics.codeCountGrowth = calculateGrowthRate(
      previousMetrics.codeCount,
      operatorDatasetSize.codeCount
    );

    // 保存当前值作为前一次值
    previousMetrics.dataPairs = metrics.dataPairs;
    previousMetrics.imageCount = metrics.imageCount;
    previousMetrics.codeCount = metrics.codeCount;

    // 更新当前值
    metrics.dataPairs = operatorDatasetSize.dataPairs;
    metrics.imageCount = operatorDatasetSize.imageCount;
    metrics.codeCount = operatorDatasetSize.codeCount;
  };

  // 计算增长率（百分比）
  const calculateGrowthRate = (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  return {
    metrics,
    updateMetrics,
  };
};