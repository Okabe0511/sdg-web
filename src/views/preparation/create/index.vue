<script lang="ts">
import { defineComponent, onMounted, ref, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router"; // 添加 useRoute
import { LeftOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
// 导入任务详情 API
import { getTaskDetail } from "/@/serve/api/preparation";

// 引入拆分出的组件
import ProgressSteps from "./components/ProgressSteps.vue";
import DatasetDescription from "./components/DatasetDescription.vue";
import QualityAssessment from "./components/QualityAssessment.vue";
import DataAnalysis from "./components/DataAnalysis.vue";
// 引入修改后的AI控制台组件
import AIConsolePanel from "./components/AIConsolePanel.vue";
// 引入新的任务配置弹窗
import TaskConfigModal from "./components/TaskConfigModal.vue";

// 引入数据制备组件
import DataPreparation from "./components/DataPreparation.vue";

// 引入钩子函数
import { useProgressSteps } from "./hooks/useProgressSteps";
import { useDatasets } from "./hooks/useDatasets";
import { useQualityAssessment } from "./hooks/useQualityAssessment";
import { useDataAnalysis } from "./hooks/useDataAnalysis";
import { useConsoleInteraction } from "./hooks/useConsoleInteraction";

export default defineComponent({
  components: {
    LeftOutlined,
    ProgressSteps,
    DatasetDescription,
    QualityAssessment,
    DataAnalysis,
    AIConsolePanel,
    TaskConfigModal,
    DataPreparation,
  },
  setup() {
    const router = useRouter();
    const route = useRoute(); // 获取当前路由信息
    const taskId = ref<number | null>(null); // 存储任务ID
    const isDetailMode = ref(false); // 是否为详情模式
    const configModalVisible = ref(false); // 默认不显示配置弹窗

    // 使用各个钩子函数
    const { currentStep, steps, setCurrentStep } = useProgressSteps();
    const { datasets, submitDatasetConfig, loadDatasets } = useDatasets();
    const {
      qualityMetrics,
      secondaryMetrics,
      qualityExplanations,
      selectedQualityMetric,
      loadQualityMetrics,
    } = useQualityAssessment();
    const { analysisInProgress, startAnalysis, stopAnalysis } =
      useDataAnalysis();
    const { consoleMessages, isLoading, startTaskStream } =
      useConsoleInteraction();

    // 模块显示控制
    const modulesVisible = reactive({
      datasetDescription: false,
      qualityAssessment: false,
      dataAnalysis: false,
      dataPreparation: false, // 新增数据制备模块控制
    });

    const showDataPreparation = ref(false); // 控制数据制备模块的显示

    // 返回列表页
    const goBackToList = () => {
      router.push("/home/list");
    };

    // 处理任务配置提交 - 修改为使用API
    const handleTaskConfigSubmit = async (config: any) => {
      console.log("任务配置:", config);

      // 创建一个任务ID
      const taskId = Date.now();

      // 开始处理任务流程
      startTaskStream(config);

      // 提交数据集配置并显示数据集描述模块
      const datasetResult = await submitDatasetConfig(config);
    };

    // 任务配置取消
    const handleTaskConfigCancel = () => {
      message.info("已取消任务创建");
      router.push("/home/list");
    };

    // 初始化 - 判断是创建页还是详情页
    onMounted(async () => {
      // 优先使用路由元信息判断模式
      const routeMode = route.meta.mode as string;

      if (routeMode === "detail" || route.params.id) {
        // 详情模式 - 从路由参数获取任务ID
        const id = Number(route.params.id || route.query.taskId);
        if (!id) {
          message.error("缺少任务ID参数");
          router.push("/home/list");
          return;
        }

        // 设置详情模式
        taskId.value = id;
        isDetailMode.value = true;

        // 加载任务详情
        await loadTaskDetail(id);
      } else {
        // 创建模式 - 显示创建弹窗
        isDetailMode.value = false;
        configModalVisible.value = true;
      }
    });

    // 加载任务详情数据
    const loadTaskDetail = async (id: number) => {
      try {
        const response = await getTaskDetail(id);
        const taskData = response.data;

        if (!taskData) {
          message.error("未找到任务详情");
          return false;
        }

        startTaskStream({
          taskId: id,
          taskName: taskData.name,
          taskDescription: taskData.description,
        });

        // 加载任务相关数据
        await loadDatasets(taskData);

        return true;
      } catch (error) {
        console.error("加载任务详情失败", error);
        message.error("加载任务详情失败");
        return false;
      }
    };

    // 新增处理下一步的函数
    const handleNextStep = () => {
      if (currentStep.value === 3) {
        setCurrentStep(3, "process");
        showDataPreparation.value = true;
        modulesVisible.dataPreparation = true;
      }
    };

    const handleStartDataDescription = () => {
      modulesVisible.datasetDescription = true;
      loadQualityMetrics(taskId.value || 0);
      setCurrentStep(1);
    };
    const handleStartQualityAssessment = () => {
      modulesVisible.qualityAssessment = true;
      setCurrentStep(2);
    };
    const handleStartDataAnalysis = () => {
      modulesVisible.dataAnalysis = true;
      startAnalysis();
      setCurrentStep(3, "wait");
    };
    // 监听路由变化
    watch(
      () => consoleMessages,
      () => {
        consoleMessages.value.forEach((msg) => {
          if (msg.type === "system") {
            if (msg.content.includes("完成数据原料召回")) {
              handleStartDataDescription();
            } else if (msg.content.includes("完成数据质量评估")) {
              handleStartQualityAssessment();
            } else if (msg.content.includes("完成数据洞察")) {
              handleStartDataAnalysis();
            }
          }
        });
      },
      { deep: true }
    );

    return {
      // 配置弹窗相关
      configModalVisible,
      handleTaskConfigSubmit,
      handleTaskConfigCancel,

      // 进度与流程
      currentStep,
      steps,
      consoleMessages,
      datasets,
      qualityMetrics,
      secondaryMetrics,
      qualityExplanations,
      analysisInProgress,
      goBackToList,
      modulesVisible,
      selectedQualityMetric,
      isLoading,
      showDataPreparation,

      // 新增返回值
      isDetailMode,
      taskId,

      // 新增的处理下一步的函数
      handleNextStep,
    };
  },
});
</script>

<template>
  <div class="task-create-page">
    <!-- 调整为左右布局 -->
    <div class="task-content">
      <!-- 左侧四个模块整体 -->
      <div class="left-container">
        <!-- 1. 任务进度条部分 -->
        <ProgressSteps :current-step="currentStep" :steps="steps" />

        <div v-if="currentStep < 4 && !showDataPreparation" class="middle-area">
          <div class="left-middle-area">
            <!-- 2. 数据集描述部分 -->
            <DatasetDescription
              :datasets="datasets"
              :visible="modulesVisible.datasetDescription"
              :loading="!modulesVisible.datasetDescription"
            />

            <!-- 3. 数据质量评估部分 -->
            <QualityAssessment
              :visible="modulesVisible.qualityAssessment"
              :loading="!modulesVisible.qualityAssessment"
              :quality-metrics="qualityMetrics"
              :secondary-metrics="secondaryMetrics"
              :quality-explanations="qualityExplanations"
              :selected-quality-metric="selectedQualityMetric"
              @update:selected-quality-metric="selectedQualityMetric = $event"
            />
          </div>

          <!-- 4. 数据靶点发现部分 -->
          <div class="right-middle-area">
            <DataAnalysis
              :visible="modulesVisible.dataAnalysis"
              :loading="!modulesVisible.dataAnalysis"
              @next-step="handleNextStep"
            />
          </div>
        </div>
        <!-- 新增数据制备组件 -->
        <DataPreparation
          v-if="currentStep === 3 && showDataPreparation"
          :visible="modulesVisible.dataPreparation"
          :loading="!modulesVisible.dataPreparation"
        />
      </div>

      <!-- 右侧控制台部分 - 只显示不交互 -->
      <div class="right-container">
        <AIConsolePanel :messages="consoleMessages" :loading="isLoading" />
      </div>
    </div>

    <!-- 任务配置弹窗 -->
    <TaskConfigModal
      v-model:visible="configModalVisible"
      @submit="handleTaskConfigSubmit"
      @cancel="handleTaskConfigCancel"
    />
  </div>
</template>

<style lang="less" scoped>
.task-create-page {
  padding: 20px;
  background-color: #f5f5f5;
  height: 100%;
  overflow: hidden;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h1 {
      font-size: 24px;
      color: @primary-color;
      margin: 0;
    }
  }
}

/* 修改为左右布局 */
.task-content {
  display: flex;
  gap: 20px;
  height: 100%;

  /* 左侧容器包含四个模块 */
  .left-container {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
  }

  /* 右侧容器包含控制台 */
  .right-container {
    flex: 1;
    height: 100%;
  }


  .middle-area {
    display: flex;
    gap: 20px;
    height: 84%;

    .left-middle-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .right-middle-area {
      flex: 2;
    }
  }
}
</style>
