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

// 新增二级指标接口（使用中文键名）
export interface SecondaryMetrics {
  "语法检测通过率": number;
  "配置项完整性": number;
  "样本数量": number;
  "图像数量": number;
  "图像与渲染截图匹配度": number;
  "缺失率": number;
  "图表类型均衡性": number;
  "配置项多样性": number;
  "代码重复性": number;
  "图像重复性": number;
  "时间粒度覆盖率": number;
  "季节性强度": number;
  "趋势强度": number;
  "主频强度": number;
  "样本均衡性": number;
  "数据完整性": number;
  "标签一致性": number;
  "时序平稳性": number;
  "时间特征完备度": number;
  "领域知识多样性": number;
  "领域知识完整性": number;
  "特征独立性": number;
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
    "语法检测通过率": 0,
    "配置项完整性": 0,
    "样本数量": 0,
    "图像数量": 0,
    "图像与渲染截图匹配度": 0,
    "缺失率": 0,
    "图表类型均衡性": 0,
    "配置项多样性": 0,
    "代码重复性": 0,
    "图像重复性": 0,
    "时间粒度覆盖率": 0,
    "季节性强度": 0,
    "趋势强度": 0,
    "主频强度": 0,
    "样本均衡性": 0,
    "数据完整性": 0,
    "标签一致性": 0,
    "时序平稳性": 0,
    "时间特征完备度": 0,
    "领域知识多样性": 0,
    "领域知识完整性": 0,
    "特征独立性": 0,
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
  const loadQualityMetrics = async (taskId: string) => {
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
  const loadQualityExplanations = async (taskType: "internet" | "energy" = "internet") => {
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
