import { reactive } from "vue";
import { createDataset, getDatasetInfo } from "/@/serve/api/dataset";

export interface DatasetInfo {
  dataType: string;
  dataAmount: string;
  dataSize: string;
}

export const useDatasets = () => {
  // 数据集信息
  const datasets = reactive<Map<string, DatasetInfo>>(new Map());

  // 加载数据集信息
  const loadDatasets = async (taskId: number) => {
    try {
      const response = await getDatasetInfo(taskId);
      const datasetInfo = response.data;

      // 清空当前数据集
      datasets.clear();

      // 填充数据集信息 - 处理数组格式的mock数据
      if (Array.isArray(datasetInfo)) {
        datasetInfo.forEach((item: any, index: number) => {
          if (item.dataType) {
            datasets.set(item.dataType, {
              dataType: item.dataType,
              dataAmount: item.previousValue?.toString() || '0',
              dataSize: item.dataSize || '未知'
            });
          }
        });
      } else {
        // 兼容原有的对象格式
        Object.keys(datasetInfo).forEach((key) => {
          datasets.set(key, datasetInfo[key]);
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 提交数据集配置
  const submitDatasetConfig = async (config: any) => {
    try {
      const response = await createDataset(config);

      if (response.data.success) {
        // 清空当前数据集
        datasets.clear();

        // 填充返回的数据集信息
        const datasetInfo = response.data.datasets;
        Object.keys(datasetInfo).forEach((key) => {
          datasets.set(key, datasetInfo[key]);
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // 清空数据集
  const clearDatasets = () => {
    datasets.clear();
  };

  return {
    datasets,
    loadDatasets,
    submitDatasetConfig,
    clearDatasets,
  };
};
