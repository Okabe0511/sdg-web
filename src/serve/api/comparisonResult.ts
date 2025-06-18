import http from "..";
import mockTrainingData from "/@/mock/comparisonResult.json";

/**
 * 获取模型训练对比数据
 * @returns 模型训练数据
 */
export const getData = async () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({
      data: mockTrainingData.trainingData,
    });
  }
  // 实际环境中调用真实接口
  return http.get("/training/comparison-data");
};
