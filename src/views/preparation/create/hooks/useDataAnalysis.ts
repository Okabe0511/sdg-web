import { ref } from "vue";

export const useDataAnalysis = () => {
  // 任务运行状态
  const analysisInProgress = ref(false);

  // 开始分析
  const startAnalysis = () => {
    analysisInProgress.value = true;
  };

  // 停止分析
  const stopAnalysis = () => {
    analysisInProgress.value = false;
  };

  return {
    analysisInProgress,
    startAnalysis,
    stopAnalysis,
  };
};
