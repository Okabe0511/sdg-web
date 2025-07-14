import http from "..";
import mockTargetAnalysisResponse from "/@/mock/targetAnalysisResponse.json";
import { useRoute } from 'vue-router';

/**
 * 获取靶点分析数据
 * @returns 靶点分析数据
 */
export const getTargetAnalysis = async () => {
  const route = useRoute();
  const taskId = route.params.id; // 从路由参数获取taskId

  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    // 根据taskId返回对应的数据集
    const responseData = mockTargetAnalysisResponse[taskId as keyof typeof mockTargetAnalysisResponse] 
      || mockTargetAnalysisResponse.default;
    
    return Promise.resolve({ data: responseData });
  }
  
  // 实际环境中调用真实接口（带taskId参数）
  return http.get(`/target/analysis/${taskId}`);
};