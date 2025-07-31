import http from "..";
import mockDataMetrics from "/@/mock/dataMetrics.json";
import { DatasetInfo } from "/@/views/preparation/create/hooks/useDatasets";

/**
 * 获取数据集描述信息
 * @param taskId 任务ID
 * @returns 数据集信息
 */
export const getDatasetInfo = async (taskId: any) => {
  if (import.meta.env.DEV) {
    let key = taskId.id;
    if (key === 1 || key === '1') key = 'Internet';
    else if (key === 2 || key === '2') key = 'energy';
    const data = (mockDataMetrics.datasets as any)[key];
    return Promise.resolve({ data });
  }
  return http.get(`/dataset/info/${taskId}`);
};

/**
 * 创建数据集
 * @param config 数据集配置参数
 * @returns 数据集创建结果
 */
export const createDataset = async (config: any) => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    // 模拟延迟响应
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.resolve({
      data: {
        success: true,
        datasets: mockDataMetrics.datasets,
      },
    });
  }
  // 实际环境中调用真实接口
  return http.post("/dataset/create", config);
};
