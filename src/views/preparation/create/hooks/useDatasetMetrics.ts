import { ref, reactive, watch } from "vue";

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
  // 初始化指标数据
  const metrics = reactive<DatasetMetrics>({
    dataPairs: 640,
    dataPairsGrowth: 0,
    imageCount: 580,
    imageCountGrowth: 0,
    codeCount: 592,
    codeCountGrowth: 0,
  });

  // 上一次的指标数据，用于计算增长率
  const previousMetrics = reactive({
    dataPairs: 640,
    imageCount: 580,
    codeCount: 592,
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
