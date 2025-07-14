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
      const datasetInfo: DatasetInfo[] = response.data;

      datasets.clear();

      datasetInfo.forEach((item, idx) => {
        datasets.set(String(idx), item);
      });

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
        datasets.clear();

        // 这里以 mock 数据结构为例，取 default
        const datasetInfo: DatasetInfo[] = response.data.datasets.default;
        datasetInfo.forEach((item, idx) => {
          datasets.set(String(idx), item);
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
