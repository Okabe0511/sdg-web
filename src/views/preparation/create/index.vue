<script lang="ts">
import { defineComponent, onMounted, ref, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LeftOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
// 导入任务详情 API
import { getTaskDetail } from "/@/serve/api/preparation";
import dataMetrics from '/@/mock/dataMetrics.json';

// 引入拆分出的组件
import ProgressSteps from "./components/ProgressSteps.vue";
import DatasetDescription from "./components/DatasetDescription.vue";
import QualityAssessment from "./components/QualityAssessment.vue";
import DataAnalysis from "./components/DataAnalysis.vue";
// 引入修改后的AI控制台组件
import AIConsolePanel from "./components/AIConsolePanel.vue";
// 引入新的任务配置弹窗
import TaskConfigModal from "./components/TaskConfigModal.vue";
// 引入数据集头部组件
import DatasetHeader from "/@/components/DatasetHeader/index.vue";

// 引入数据制备组件
import DataPreparation from "./components/DataPreparation.vue";
// 引入数据导出结果组件
import DataExportResult from "./components/DataExportResult.vue";

// 引入钩子函数
import { useProgressSteps } from "./hooks/useProgressSteps";
import { useDatasets } from "./hooks/useDatasets";
import { useQualityAssessment } from "./hooks/useQualityAssessment";
import { useDataAnalysis } from "./hooks/useDataAnalysis";
import { useConsoleInteraction } from "./hooks/useConsoleInteraction";
import { useDatasetMetrics } from "./hooks/useDatasetMetrics";

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
    DatasetHeader,
    DataExportResult,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const taskId = ref<number | null>(null);
    const isDetailMode = ref(false);
    const configModalVisible = ref(false);

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
    const {
      consoleMessages,
      isLoading,
      startTaskStream,
      startDataPreparationStream,
    } = useConsoleInteraction();

    // 使用钩子替代直接初始化
    const { metrics: datasetMetrics, updateMetrics } = useDatasetMetrics();

    // 模块显示控制
    const modulesVisible = reactive({
      datasetDescription: false,
      qualityAssessment: false,
      dataAnalysis: false,
      dataPreparation: false,
      dataExportResult: false, // 新增数据导出结果模块控制
    });

    // 控制页面显示特定步骤
    const showDataPreparation = ref(false);
    const showDataExportResult = ref(false); // 新增导出结果显示控制

    // 返回列表页
    const goBackToList = () => {
      router.push("/home/list");
    };

    // 处理任务配置提交
    const handleTaskConfigSubmit = async (config: any) => {
      console.log("任务配置:", config);
      const taskId = Date.now();
      startTaskStream(config);
      const datasetResult = await submitDatasetConfig(config);
    };

    // 任务配置取消
    const handleTaskConfigCancel = () => {
      message.info("已取消任务创建");
      router.push("/home/list");
    };

    // 初始化 - 判断是创建页还是详情页
    onMounted(async () => {
      const routeMode = route.meta.mode as string;

      if (routeMode === "detail" || route.params.id) {
        const id = Number(route.params.id || route.query.taskId);
        if (!id) {
          message.error("缺少任务ID参数");
          router.push("/home/list");
          return;
        }

        taskId.value = id;
        isDetailMode.value = true;
        await loadTaskDetail(id);
      } else {
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

        if (taskData.metrics) {
          updateMetrics({
            dataPairs: taskData.metrics.dataPairs || 0,
            imageCount: taskData.metrics.imageCount || 0,
            codeCount: taskData.metrics.codeCount || 0,
          });
        }

        await loadDatasets(taskData);

        return true;
      } catch (error) {
        console.error("加载任务详情失败", error);
        message.error("加载任务详情失败");
        return false;
      }
    };

    // 计算当前页面 id
    const getMetricNameMap = () => {
      let id = '';
      if (String(taskId.value) === '1') id = 'Internet';
      else if (String(taskId.value) === '2') id = 'energy';
      else id = 'Internet';
      return (dataMetrics.metricNameMap as Record<string, Record<string, string>>)[id] || {};
    };

    // 处理下一步的函数
    const handleNextStep = () => {
      if (currentStep.value === 3) {
        setCurrentStep(3, "process");
        showDataPreparation.value = true;
        modulesVisible.dataPreparation = true;
      } else if (currentStep.value === 4) {
        // 从数据制备到结果导出
        setCurrentStep(4);
        showDataExportResult.value = true;
        modulesVisible.dataExportResult = true;
      }
    };

    // 从数据制备到结果导出的处理函数
    const handleCompletePreparation = () => {
      setCurrentStep(4);
      showDataPreparation.value = false;
      showDataExportResult.value = true;
      modulesVisible.dataExportResult = true;
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
          if (currentStep.value > 2) {
            return;
          }
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

    // 监听工作流完成状态，自动跳转到结果页
    watch(
      () => modulesVisible.dataPreparation,
      (newVal) => {
        if (
          newVal &&
          consoleMessages.value.some((msg) =>
            msg.content.includes("任务流程执行完成")
          )
        ) {
          setTimeout(handleCompletePreparation, 1000);
        }
      }
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
      showDataExportResult, // 新增导出结果显示控制
      startDataPreparationStream,

      // 新增返回值
      isDetailMode,
      taskId,

      // 数据集指标
      datasetMetrics,

      // 新增的处理下一步的函数
      handleNextStep,
      handleCompletePreparation,
      getMetricNameMap,
    };
  },
});
</script>

<template>
  <div class="task-create-page">
    <div class="task-content">
      <div class="left-container">
        <!-- 1. 任务进度条部分 -->
        <ProgressSteps :current-step="currentStep" :steps="steps" />

        <!-- 添加数据集头部信息 -->
        <DatasetHeader
          v-if="
            currentStep < 4 && !showDataPreparation && !showDataExportResult
          "
          :metrics="datasetMetrics"
        />

        <div
          v-if="
            currentStep < 4 && !showDataPreparation && !showDataExportResult
          "
          class="middle-area"
        >
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
              :metric-name-map="getMetricNameMap()"
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

        <!-- 数据制备组件 -->
        <DataPreparation
          v-if="
            currentStep === 3 && showDataPreparation && !showDataExportResult
          "
          :visible="modulesVisible.dataPreparation"
          :loading="!modulesVisible.dataPreparation"
          @start-data-preparation="startDataPreparationStream"
          @complete-preparation="handleCompletePreparation"
        />

        <!-- 数据导出结果组件 -->
        <DataExportResult
          v-if="currentStep === 4 && showDataExportResult"
          :visible="modulesVisible.dataExportResult"
          :metrics="datasetMetrics"
        />
      </div>

      <!-- 右侧控制台部分 - 结果页不显示控制台 -->
      <div v-if="!showDataExportResult" class="right-container">
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
  position: relative;
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
