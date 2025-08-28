import http from "..";
import mockQualityResponse from "/@/mock/qualityResponse.json";
import mockDataMetrics from "/@/mock/dataMetrics.json";
import {
  QualityMetrics,
  SecondaryMetrics,
} from "/@/views/preparation/create/hooks/useQualityAssessment";

/**
 * 获取数据质量评估指标
 * @param taskId 任务ID
 * @returns 质量评估指标
 */
export const getQualityMetrics = async (taskId: string) => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    if (taskId === 'internet') {
      const data = {
        primaryMetrics: mockDataMetrics.qualityPrimaryMetrics["internet"],
        secondaryMetrics: mockDataMetrics.originalMetrics["internet"],
      };
      return Promise.resolve({ data });
    } else if (taskId === 'energy') {
      const data = {
        primaryMetrics: mockDataMetrics.qualityPrimaryMetrics["energy"],
        secondaryMetrics: mockDataMetrics.originalMetrics["energy"],
      };
      return Promise.resolve({ data });
    } else {
      const data = {
        primaryMetrics: mockDataMetrics.qualityPrimaryMetrics["internet"],
        secondaryMetrics: mockDataMetrics.originalMetrics["internet"],
      };
      return Promise.resolve({ data });
    }
  }
  // 实际环境中调用真实接口
  return http.get(`/quality/metrics/${taskId}`);
};

/**
 * 获取质量评估详细说明
 * @param taskType 任务类型，默认为"Internet"
 * @returns 质量评估说明
 */
export const getQualityExplanations = async (taskType: "internet" | "energy" = "internet") => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: mockDataMetrics.explanations[taskType] });
  }
  // 实际环境中调用真实接口
  return http.get(`/quality/explanations/${taskType}`);
};
