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
    // 直接返回整个mock对象，包含primaryMetrics和secondaryMetrics
    return Promise.resolve({
      data: {
        primaryMetrics: mockQualityResponse.primaryMetrics,
        secondaryMetrics: mockQualityResponse.secondaryMetrics,
      },
    });
  }
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
    return Promise.resolve({ data: mockQualityResponse.explanations });
  }
  // 实际环境中调用真实接口
  return http.get("/quality/explanations");
};
