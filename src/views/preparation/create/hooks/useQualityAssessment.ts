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
  syntaxDetection: number; // 语法检测
  configCompleteness: number; // 配置项完整性检测
  sampleCount: number; // 数据量
  imageCount: number; // 图像数量
  imageRenderMatch: number; // 图像与渲染截图匹配度
  missingRate: number; // 缺失率
  chartTypeBalance: number; // 图表类型均衡性
  configDiversity: number; // 配置项多样性
  codeRedundancy: number; // 代码重复性
  imageRedundancy: number; // 图像重复性
  timeGranularityCoverage: number; // 时间粒度覆盖率（energy专用）
  seasonalityStrength: number; // 季节性强度（energy专用）
  trendStrength: number; // 趋势强度（energy专用）
  mainFrequencyStrength: number; // 主频强度（energy专用）
  sampleBalance: number; // 样本均衡性（energy专用）
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
