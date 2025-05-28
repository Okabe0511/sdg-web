import { ref, reactive } from "vue";

export interface Step {
  title: string;
  subtitle: string;
  status: "wait" | "process" | "finish";
}

export const useProgressSteps = () => {
  // 当前步骤
  const currentStep = ref(0);

  // 任务步骤
  const steps = reactive<Step[]>([
    {
      title: "配置数据集",
      subtitle: "多源异构数据\n原料高效召回",
      status: "wait",
    },
    {
      title: "数据质量评估",
      subtitle: "基于全面多维度\n质量评估模型",
      status: "wait",
    },
    {
      title: "数据靶点发现",
      subtitle: "面向领域数据\n关键特征洞察",
      status: "wait",
    },
    {
      title: "数据制备",
      subtitle: "领域数据\n增强增广",
      status: "wait",
    },
    {
      title: "制备结果导出与评价",
      subtitle: "输入数据集信息",
      status: "wait",
    },
  ]);

  // 更新当前步骤
  const setCurrentStep = (
    step: number,
    status: "wait" | "process" | "finish" = "process"
  ) => {
    if (step >= 0 && step < steps.length) {
      currentStep.value = step;
    }
    steps.forEach((s, index) => {
      s.status =
        index < currentStep.value
          ? "finish"
          : index === currentStep.value
          ? status
          : "wait";
    });
  };

  // 重置所有步骤
  const resetSteps = () => {
    currentStep.value = 0;
  };

  // 下一步
  const nextStep = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
    }
  };

  return {
    currentStep,
    steps,
    setCurrentStep,
    resetSteps,
    nextStep,
  };
};
