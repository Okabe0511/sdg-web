import http from "..";
import mockTargetAnalysisResponse from "/@/mock/targetAnalysisResponse.json";
import { useRoute } from 'vue-router';

/**
 * 获取靶点分析数据
 * @returns 靶点分析数据
 */
export const getTargetAnalysis = async () => {
  const route = useRoute();
  let id = String(route.params.key || "internet");
  if (id === "internet") id = "internet";
  if (id === "energy") id = "energy";

  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    // 根据id返回对应的数据集
    const responseData = mockTargetAnalysisResponse[id as keyof typeof mockTargetAnalysisResponse] 
      || mockTargetAnalysisResponse["internet"];
    return Promise.resolve({ data: responseData });
  }

  // 实际环境中调用真实接口（带id参数）
  return http.get(`/target/analysis/${id}`);
};