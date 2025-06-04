import http from "..";
import mockAnalysisData from "/@/mock/analysisData.json";

/**
 * 获取数据分析柱状图数据
 * @returns 柱状图数据
 */
export const getAnalysisHistogramData = async () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({
      data: mockAnalysisData,
    });
  }
  // 实际环境中调用真实接口
  return http.get("/analysis/histogram-data");
};
