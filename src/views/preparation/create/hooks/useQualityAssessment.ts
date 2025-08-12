import { reactive, ref } from "vue";
import {
  getQualityMetrics,
  getQualityExplanations,
} from "/@/serve/api/qualityAssessment";

export interface QualityMetrics {
  dataVolume: number;
  dataAlignment: number;
  dataRedundancy: number;
  diversityBalance: number;
  codeQuality: number;
}

// 新增二级指标接口
export interface SecondaryMetrics {
  syntaxDetection: number;
  configCompleteness: number;
  sampleCount: number;
  imageCount: number;
  imageRenderMatch: number;
  missingRate: number;
  chartTypeBalance: number;
  configDiversity: number;
  codeRedundancy: number;
  imageRedundancy: number;
  timeGranularityCoverage: number;
  seasonalityStrength: number;
  trendStrength: number;
  mainFrequencyStrength: number;
  sampleBalance: number;
  dataCompleteness: number;
  labelConsistency: number;
  sequenceStability: number;
  temporalFeatureCompleteness: number;
  domainKnowledgeDiversity: number;
  domainKnowledgeIntegrity: number;
  featureIndependence: number;
}

export const useQualityAssessment = () => {
  // 数据质量评估指标
  const qualityMetrics = reactive<QualityMetrics>({
    dataVolume: 0,
    dataAlignment: 0,
    dataRedundancy: 0,
    diversityBalance: 0,
    codeQuality: 0,
  });

  // 二级指标数据（包含Internet和energy所有指标）
  const secondaryMetrics = reactive<SecondaryMetrics>({
    syntaxDetection: 0,
    configCompleteness: 0,
    sampleCount: 0,
    imageCount: 0,
    imageRenderMatch: 0,
    missingRate: 0,
    chartTypeBalance: 0,
    configDiversity: 0,
    codeRedundancy: 0,
    imageRedundancy: 0,
    timeGranularityCoverage: 0,
    seasonalityStrength: 0,
    trendStrength: 0,
    mainFrequencyStrength: 0,
    sampleBalance: 0,
    dataCompleteness: 0,
    labelConsistency: 0,
    sequenceStability: 0,
    temporalFeatureCompleteness: 0,
    domainKnowledgeDiversity: 0,
    domainKnowledgeIntegrity: 0,
    featureIndependence: 0,
  });

  // 当前选中的质量指标
  const selectedQualityMetric = ref("dataVolume"); // 默认显示数据对齐指标

  // 质量评估说明
  const qualityExplanations = reactive<Record<string, string>>({
    dataVolume: "",
    dataAlignment: "",
    dataRedundancy: "",
    diversityBalance: "",
    codeQuality: "",
  });

  // 加载质量评估指标
  const loadQualityMetrics = async (taskId: number) => {
    try {
      const response = await getQualityMetrics(taskId);
      const metrics = response.data;

      // 更新质量指标
      Object.assign(qualityMetrics, metrics.primaryMetrics || metrics.qualityPrimaryMetrics || metrics);

      // 更新所有二级指标数据（自动遍历赋值，支持新增字段）
      if (metrics.secondaryMetrics) {
        const sm = secondaryMetrics as Record<string, number>;
        Object.keys(sm).forEach(key => {
          if (key in metrics.secondaryMetrics) {
            sm[key] = metrics.secondaryMetrics[key];
          }
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 加载质量评估说明
  const loadQualityExplanations = async (taskType: "Internet" | "energy" = "Internet") => {
    try {
      const response = await getQualityExplanations(taskType);
      Object.assign(qualityExplanations, response.data);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    qualityMetrics,
    secondaryMetrics,
    qualityExplanations,
    selectedQualityMetric,
    loadQualityMetrics,
    loadQualityExplanations,
  };
};
