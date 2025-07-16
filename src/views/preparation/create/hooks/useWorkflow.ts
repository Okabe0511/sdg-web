import { ref, reactive, computed, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { getRecommendWorkflow } from "/@/serve/api/operators";
import type { Operator } from "/@/serve/api/operators";
import { useRoute } from 'vue-router';
export const useWorkflow = () => {
  const route = useRoute();
  const taskId = route.params.id;
  // 工作流数据
  const workflow = reactive<{
    steps: Array<any>;
    startTime: number | null;
    endTime: number | null;
  }>({
    steps: [],
    startTime: null,
    endTime: null,
  });

  // 执行状态
  const isExecuting = ref(false);
  const currentExecutingStep = ref(-1);

  // 定时器相关
  let timerInterval: number | null = null;
  const runtimeCounter = ref(0);

  // 智能推荐相关
  const recommendModalVisible = ref(false);
  const recommendConfig = reactive({
    timeLimit: 30, // 默认时间限制为30分钟
    costLimit: 500, // 默认资源成本限制为500
  });

  // 步骤预览相关
  const previewModalVisible = ref(false);
  const currentPreviewStep = ref<any>(null);

  // 显示推荐弹窗
  const showRecommendModal = () => {
    recommendModalVisible.value = true;
  };
  
  // 生成工作流
  const generateWorkflow = async () => {
    if (!recommendConfig.timeLimit || recommendConfig.timeLimit <= 0) {
      return message.warning("请输入有效的时间限制");
    }

    if (!recommendConfig.costLimit || recommendConfig.costLimit <= 0) {
      return message.warning("请输入有效的资源成本限制");
    }

    try {
      const response = await getRecommendWorkflow(taskId, recommendConfig);
      workflow.steps = response.data.map((op: Operator) => ({
        ...op,
        isCompleted: false,
      }));
      
      recommendModalVisible.value = false;
      message.success("工作流生成成功，已按最佳顺序安排算子");
    } catch (error) {
      console.error("生成工作流失败", error);
      message.error("生成工作流失败");
    }
  };

  // 移动步骤
  const moveStep = (index: number, direction: string) => {
    if (direction === "up" && index > 0) {
      const temp = workflow.steps[index];
      workflow.steps[index] = workflow.steps[index - 1];
      workflow.steps[index - 1] = temp;
    } else if (direction === "down" && index < workflow.steps.length - 1) {
      const temp = workflow.steps[index];
      workflow.steps[index] = workflow.steps[index + 1];
      workflow.steps[index + 1] = temp;
    }
  };

  // 编辑步骤（需要与editOperator配合使用）
  const editStep = (
    index: number,
    editOperatorFn: (operator: Operator) => void
  ) => {
    const step = workflow.steps[index];
    editOperatorFn(step);
  };

  // 删除步骤
  const removeStep = (index: number) => {
    workflow.steps.splice(index, 1);
  };

  // 执行工作流
  const executeWorkflow = () => {
    isExecuting.value = true;
    workflow.startTime = Date.now();
    workflow.endTime = null;
    currentExecutingStep.value = 0;

    // 启动定时器，每秒更新计数器
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = window.setInterval(() => {
      runtimeCounter.value++;
    }, 1000);

    // 模拟执行过程
    const executeStep = (index: number) => {
      if (index >= workflow.steps.length) {
        isExecuting.value = false;
        currentExecutingStep.value = -1;
        workflow.endTime = Date.now();

        // 停止定时器
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        return;
      }

      currentExecutingStep.value = index;

      setTimeout(() => {
        workflow.steps[index].isCompleted = true;
        executeStep(index + 1);
      }, 4500);
    };

    executeStep(0);
  };

  // 清理定时器
  const cleanupTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // 预览步骤
  const previewStep = (step: any) => {
    currentPreviewStep.value = step;
    previewModalVisible.value = true;
  };

  // 计算运行时间格式
  const runtimeFormatted = computed(() => {
    if (!workflow.startTime) return "00:00:00";

    const endTime = workflow.endTime || Date.now();
    const runtimeMs = endTime - workflow.startTime;

    // 使用runtimeCounter作为依赖项，确保每秒更新
    runtimeCounter.value;

    const seconds = Math.floor((runtimeMs / 1000) % 60);
    const minutes = Math.floor((runtimeMs / (1000 * 60)) % 60);
    const hours = Math.floor(runtimeMs / (1000 * 60 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  });

  // 工作流是否完成
  const isWorkflowCompleted = computed(() => {
    if (workflow.steps.length === 0) return false;
    return workflow.steps.every((step) => step.isCompleted);
  });

  // 组件卸载前清理资源
  onBeforeUnmount(() => {
    cleanupTimer();
  });

  return {
    workflow,
    isExecuting,
    currentExecutingStep,
    runtimeFormatted,
    recommendModalVisible,
    recommendConfig,
    previewModalVisible,
    currentPreviewStep,
    showRecommendModal,
    generateWorkflow,
    moveStep,
    editStep,
    removeStep,
    executeWorkflow,
    previewStep,
    isWorkflowCompleted,
    cleanupTimer,
  };
};
