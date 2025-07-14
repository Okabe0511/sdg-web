import http from "..";
import mockQualityResponse from "/@/mock/qualityResponse.json";
import {
  QualityMetrics,
  SecondaryMetrics,
} from "/@/views/preparation/create/hooks/useQualityAssessment";

/**
 * 获取数据质量评估指标
 * @param taskId 任务ID
 * @returns 质量评估指标
 */
export const getQualityMetrics = async (taskId: number) => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    
    
    if (taskId === 1) {
      const data = {
        primaryMetrics: mockQualityResponse.metrics[1].primaryMetrics,
        secondaryMetrics: mockQualityResponse.metrics[1].secondaryMetrics,
      };
      return Promise.resolve({ data });
    } else if (taskId === 2) {
      const data = {
        primaryMetrics: mockQualityResponse.metrics[2].primaryMetrics,
        secondaryMetrics: mockQualityResponse.metrics[2].secondaryMetrics,
      };
      return Promise.resolve({ data });
    } else {
      const data = {
        primaryMetrics: mockQualityResponse.metrics.default.primaryMetrics,
        secondaryMetrics: mockQualityResponse.metrics.default.secondaryMetrics,
      };
      return Promise.resolve({ data });
    }
  
    
  }
   console.log(taskId);
  // 实际环境中调用真实接口
  return http.get(`/quality/metrics/${taskId}`);
};

/**
 * 获取质量评估详细说明
 * @returns 质量评估说明
 */
export const getQualityExplanations = async () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: mockQualityResponse.metrics[1].explanations });
  }
  // 实际环境中调用真实接口
  return http.get("/quality/explanations");
};
