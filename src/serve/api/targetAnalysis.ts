import http from "..";
import mockTargetAnalysisResponse from "/@/mock/targetAnalysisResponse.json";

/**
 * 获取靶点分析数据
 * @returns 靶点分析数据
 */
export const getTargetAnalysis = async () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: mockTargetAnalysisResponse });
  }
  // 实际环境中调用真实接口
  return http.get("/target/analysis");
};
