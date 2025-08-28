<template>
  <div class="analysis-section">
    <h2>数据靶点发现</h2>
    <div v-if="visible" class="analysis-content">
      <div class="target-analysis">
        <div class="target-chart-container">
          <!-- 自定义靶图替代 echarts -->
          <div class="target-board">
            <!-- 靶心圆环 -->
            <div class="target-circle circle-1"></div>
            <div class="target-circle circle-2"></div>
            <div class="target-circle circle-3"></div>

            <!-- 动态靶点渲染 -->
            <div
              class="target-indicator"
              v-for="key in displayedTargetKeys"
              :key="key"
              :class="{ active: selectedTargetKey === key }"
              :style="getIndicatorStyle(key, targetData[key as keyof typeof targetData])"
              @click="selectTarget(key)"
            >
              <div class="indicator-marker">
                <div class="line-top"></div>
                <div class="line-right"></div>
                <div class="line-bottom"></div>
                <div class="line-left"></div>
                <div class="circle-ring"></div>
              </div>

              <!-- 修改后的悬浮提示框 -->
              <div class="tooltip">
                <div class="tooltip-title">
                  {{ targetExplanations[key].title }}
                </div>
                <!-- 新增的编辑按钮浮窗 -->
                <div class="edit-popup">
                  <a-button
                    type="primary"
                    size="small"
                    shape="circle"
                    class="edit-button"
                    @click.stop="openEditDialog(key)"
                  >
                    <template #icon>
                      <edit-outlined />
                    </template>
                  </a-button>
                </div>
                <div class="tooltip-value">
                  <span class="label">权重:</span>
                  <span class="value">{{ formatScore(targetData[key as keyof typeof targetData]) }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'configDiversity'">
                  <span class="label">多样性:</span>
                  <span class="value">{{
                    targetData[key as keyof typeof targetData] > 70 ? "严重靶点" : targetData[key as keyof typeof targetData] > 40 ? "中等靶点" : "轻度靶点"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'dataVolume'">
                  <span class="label">数据量:</span>
                  <span class="value">{{
                    targetData[key as keyof typeof targetData] > 70 ? "严重靶点" : targetData[key as keyof typeof targetData] > 40 ? "中等靶点" : "轻度靶点"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'chartTypeBalance'">
                  <span class="label">均衡性:</span>
                  <span class="value">{{
                    targetData[key as keyof typeof targetData] > 70 ? "严重靶点" : targetData[key as keyof typeof targetData] > 40 ? "中等靶点" : "轻度靶点"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 修改后的图例部分 -->
          <div class="target-legend">
            <div
              v-for="(legend, index) in legendItems"
              :key="index"
              class="legend-item"
            >
              <div
                class="legend-color"
                :style="{ backgroundColor: legend.color }"
              ></div>
              <span>{{ legend.label }}</span>
            </div>
          </div>
        </div>

        <div class="target-explanations">
          <div class="metric-explanation" v-if="selectedTargetKey">
            <div class="explanation-title">
              {{ targetExplanations[selectedTargetKey].title }}
            </div>
            <div class="explanation-content">
              {{ targetExplanations[selectedTargetKey].content }}
            </div>
          </div>
        </div>
      </div>

      <div class="additional-analysis">
        <div class="analysis-controls">
          <!-- 根据routeId显示不同的图表切换按钮 -->
          <a-radio-group
            v-model:value="chartType"
            button-style="solid"
            size="small"
            v-if="routeId === 'internet'"
          >
            <a-radio-button value="heatmap">微观</a-radio-button>
            <a-radio-button value="analysis">聚合</a-radio-button>
          </a-radio-group>
        
        </div>

        <!-- 热力图和柱状图容器 - 仅routeId为1时显示 -->
        <template v-if="routeId === 'internet'">
          <div
            v-show="chartType === 'heatmap'"
            id="main"
            style="width: 100%; height: 380px"
          ></div>

          <div
            v-show="chartType === 'analysis'"
            class="histogram-container"
          >
            <div
              v-if="histogramData && histogramData.histogramData"
              class="histogram-grid"
            >
              <div
                v-for="(_, index) in histogramData.histogramData"
                :key="index"
                class="histogram-item"
                ref="histogramChartRefs"
              ></div>
            </div>
            <div v-else class="loading-charts">
              <a-spin />
              <div>正在加载分析图表...</div>
            </div>
          </div>
        </template>

        <!-- 艾森豪威尔矩阵容器 - 仅routeId为2时显示 -->
        <div
          v-if="routeId === 'energy' && chartType === 'eisenhower'"
          id="eisenhower-matrix"
          style="width: 100%; height: 410px"
        ></div>
      </div>

      <!-- 添加下一步按钮 -->
      <div class="next-step-action" v-if="isAnalysisEnd && visible">
        <a-button type="primary" @click="handleNextStep">
          下一步
          <template #icon><right-outlined /></template>
        </a-button>
      </div>
    </div>

    <div v-else class="module-placeholder">
      <a-spin />
      <div class="placeholder-text">正在分析数据...</div>
    </div>

    <!-- 新增靶点编辑弹窗 -->
    <a-modal
      v-model:visible="editDialogVisible"
      :title="`编辑${
        currentEditTarget
          ? targetExplanations[currentEditTarget]?.title
          : '靶点'
      }`"
      @ok="saveTargetChange"
      @cancel="cancelTargetEdit"
      :okText="'保存'"
      :cancelText="'取消'"
      :maskClosable="false"
    >
      <a-form>
        <a-form-item label="靶点名称：">
          <div class="form-value">
            {{
              currentEditTarget
                ? targetExplanations[currentEditTarget]?.title
                : ""
            }}
          </div>
        </a-form-item>
        <a-form-item label="当前权重：">
          <div class="form-value">{{ formatScore(currentEditValue) }}</div>
        </a-form-item>
        <a-form-item label="新权重：">
          <a-slider
            v-if="editDialogVisible"
            v-model:value="newTargetValue"
            :min="0"
            :max="100"
            :step="1"
            :tooltip-visible="true"
            :getTooltipPopupContainer="(node: any) => node"
          />
        </a-form-item>
        <a-form-item>
          <a-button danger @click="confirmDeleteTarget">删除靶点</a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 确认删除弹窗 -->
    <a-modal
      v-model:visible="deleteConfirmVisible"
      title="确认删除靶点"
      @ok="deleteTarget"
      @cancel="deleteConfirmVisible = false"
      :okText="'删除'"
      :cancelText="'取消'"
    >
      <p>
        确定要删除
        {{
          currentEditTarget ? targetExplanations[currentEditTarget]?.title : ""
        }}
        靶点吗？
      </p>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  PropType,
  computed,
} from "vue";
import { message } from "ant-design-vue";
import { RightOutlined, EditOutlined } from "@ant-design/icons-vue";
import { useHeatmapChart } from "../hooks/useHeatmapChart";
import { useHistogramCharts } from "../hooks/useHistogramCharts";
import { useEisenhowerMatrix } from "../hooks/useEisenhowerMatrix";
import { getTargetAnalysis } from "/@/serve/api/targetAnalysis";
import { useRoute } from 'vue-router'; 

interface TargetExplanation {
  title: string;
  score: number;
  content: string;
}

export default defineComponent({
  components: {
    RightOutlined,
    EditOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    taskid: {
      type: Number,
      default: 1,
    },
    onNextStep: {
      type: Function as PropType<() => void>,
      required: false,
    },
  },
  emits: ["next-step"],
  setup(props, { emit }) {
    const route = useRoute();
    const routeId = ref(route.params.key as string);
    const chartType = ref(
      routeId.value === 'internet' ? "heatmap" : "eisenhower"
    );  
    const histogramChartRefs = ref<HTMLElement[]>([]);
    const isAnalysisEnd = ref(false);

    // 使用热力图钩子
    const {
      chartLoaded: heatmapLoaded,
      initHeatmap,
      disposeChart: disposeHeatmap,
      resizeChart: resizeHeatmap,
      handleResize: resizeHeatmapHandler,
    } = useHeatmapChart();

    // 使用柱状图钩子
    const {
      histogramData,
      setChartRefs,
      loadHistogramData,
      initHistogramCharts,
      disposeCharts: disposeHistogramCharts,
      handleResize: resizeHistograms,
    } = useHistogramCharts();

    // 使用艾森豪威尔矩阵钩子
    const {
      chartLoaded: eisenhowerLoaded,
      initEisenhowerMatrix,
      disposeChart: disposeEisenhower,
      resizeChart: resizeEisenhower,
    } = useEisenhowerMatrix();

    // 靶点分析数据
    const targetData = reactive({
      // Internet部分字段
      "configDiversity": 0,
      "dataVolume": 0,
      "chartTypeBalance": 0,
      // Energy部分字段（全部英文 key）
      "domainKnowledgeIntegrity": 0,
      "temporalFeatureCompleteness": 0,
      "timeGranularityCoverage": 0,
      "sequenceStability": 0,
      "domainKnowledgeDiversity": 0,
      "seasonalityStrength": 0,
      "mainFrequencyStrength": 0,
      "featureIndependence": 0,
      "sampleBalance": 0,
      "trendStrength": 0,
      "dataCompleteness": 0,
      "labelConsistency": 0
    });

    // 用于记录删除的靶点
    const deletedTargets = ref<string[]>([]);

    // 靶点解释数据
    const targetExplanations = reactive<Record<string, TargetExplanation>>({
      // Internet部分字段
      "configDiversity": { title: "配置项多样性", score: 0, content: "" },
      "dataVolume": { title: "数据量", score: 0, content: "" },
      "chartTypeBalance": { title: "图表类型均衡性", score: 0, content: "" },
      // Energy部分字段（全部英文 key，title 为中文）- 修正标题名称
      "domainKnowledgeIntegrity": { title: "领域知识完整性", score: 0, content: "" },
      "temporalFeatureCompleteness": { title: "时间特征完整性", score: 0, content: "" },
      "timeGranularityCoverage": { title: "时间粒度覆盖度", score: 0, content: "" },
      "sequenceStability": { title: "序列稳定性", score: 0, content: "" },
      "domainKnowledgeDiversity": { title: "领域知识多样性", score: 0, content: "" },
      "seasonalityStrength": { title: "季节性强度", score: 0, content: "" },
      "mainFrequencyStrength": { title: "主频强度", score: 0, content: "" },
      "featureIndependence": { title: "特征独立性", score: 0, content: "" },
      "sampleBalance": { title: "样本平衡性", score: 0, content: "" },
      "trendStrength": { title: "趋势强度", score: 0, content: "" },
      "dataCompleteness": { title: "数据完整性", score: 0, content: "" },
      "labelConsistency": { title: "标签一致性", score: 0, content: "" },
    });

    // 当前选中的靶点
    const selectedTargetKey = ref("configDiversity");

    // 新增编辑弹窗状态
    const editDialogVisible = ref(false);
    const currentEditTarget = ref<string | null>(null);
    const currentEditValue = ref(0);
    const newTargetValue = ref(0);
    const deleteConfirmVisible = ref(false);

    // 3个主靶点key
    const mainTargetKeys = [
      "configDiversity",
      "dataVolume",
      "chartTypeBalance",
    ];
    // 12个energy靶点key（全部英文）- 修改为前4个
    const energyTargetKeys = [
      "domainKnowledgeIntegrity",
      "temporalFeatureCompleteness",
      "timeGranularityCoverage",
      "sequenceStability",
    ];

    // 计算当前页面应显示的靶点key
    const displayedTargetKeys = computed(() => {
      let baseKeys: string[] = [];
      if (routeId.value === "internet") {
        baseKeys = mainTargetKeys;
      } else if (routeId.value === "energy") {
        baseKeys = energyTargetKeys;
      }
      
      // 过滤掉已删除的靶点，并且确保靶点在targetData中存在
      return baseKeys.filter(key => 
        !deletedTargets.value.includes(key) && 
        key in targetData
      );
    });

    // 打开编辑弹窗
    const openEditDialog = (key: string) => {
      selectedTargetKey.value = key;
      currentEditTarget.value = key;
      currentEditValue.value = targetData[key as keyof typeof targetData];
      newTargetValue.value = currentEditValue.value;
      editDialogVisible.value = true;
    };

    // 保存靶点修改
    const saveTargetChange = () => {
      if (
        currentEditTarget.value &&
        newTargetValue.value >= 0 &&
        newTargetValue.value <= 100
      ) {
        // 更新靶点值
        const key = currentEditTarget.value as keyof typeof targetData;
        targetData[key] = newTargetValue.value;

        // 更新解释数据中的分数
        if (targetExplanations[currentEditTarget.value]) {
          targetExplanations[currentEditTarget.value].score =
            newTargetValue.value;
        }

        message.success(
          `${
            targetExplanations[currentEditTarget.value]?.title || "靶点"
          }值已更新`
        );
        editDialogVisible.value = false;
      }
    };

    // 取消编辑
    const cancelTargetEdit = () => {
      editDialogVisible.value = false;
    };

    // 确认删除靶点
    const confirmDeleteTarget = () => {
      // 检查是否至少保留一个靶点
      const remainingKeys = displayedTargetKeys.value.filter(key => key !== currentEditTarget.value);
      if (remainingKeys.length === 0) {
        message.warning("至少需要保留一个靶点");
        return;
      }
      deleteConfirmVisible.value = true;
    };

    // 删除靶点
    const deleteTarget = () => {
      if (currentEditTarget.value) {
        // 记录已删除的靶点
        deletedTargets.value.push(currentEditTarget.value);

        message.success(
          `${
            targetExplanations[currentEditTarget.value]?.title || "靶点"
          }已删除`
        );
        deleteConfirmVisible.value = false;
        editDialogVisible.value = false;

        // 如果删除的是当前选中的靶点，则选择另一个靶点
        if (selectedTargetKey.value === currentEditTarget.value) {
          // 找到一个未删除的靶点作为新的选中项
          const availableKeys = displayedTargetKeys.value;
          if (availableKeys.length > 0) {
            selectedTargetKey.value = availableKeys[0];
          }
        }
      }
    };

    // 选择靶点
    const selectTarget = (key: string) => {
      selectedTargetKey.value = key;
    };

    // 格式化分数
    const formatScore = (score: number) => {
      return score.toFixed(2);
    };

    // 获取指标对应的图标
    const getIconForMetric = (key: string) => {
      const iconMap: Record<string, string> = {
        configDiversity: "data-panel_line",
        dataVolume: "database",
        chartTypeBalance: "chart",
        timeGranularityCoverage: "clock-circle",
        seasonalityStrength: "calendar",
        trendStrength: "line-chart",
        mainFrequencyStrength: "bar-chart",
        sampleBalance: "pie-chart",
        dataCompleteness: "check-circle",
        labelConsistency: "tag",
        sequenceStability: "swap",
        temporalFeatureCompleteness: "hourglass",
        domainKnowledgeDiversity: "bulb",
        domainKnowledgeIntegrity: "safety",
        featureIndependence: "disconnect",
      };
      return iconMap[key] || "flag";
    };

    // 计算指标点在靶图上的位置
    const getIndicatorStyle = (key: string, value: number) => {
      // 根据当前显示的靶点key列表来计算位置
      const currentKeys = displayedTargetKeys.value;
      const keysLength = currentKeys.length;
      const idx = currentKeys.indexOf(key);
      
      // 如果找不到key，返回默认位置
      if (idx === -1) {
        return { left: '50%', top: '50%' };
      }
      
      // 所有靶点均采用默认均匀分布
      const angle = (360 / keysLength) * idx - 90;
      const distancePercent = 100 - value;
      const radians = (angle * Math.PI) / 180;
      const x = 50 + (Math.cos(radians) * distancePercent) / 2;
      const y = 50 + (Math.sin(radians) * distancePercent) / 2;
      return {
        left: `${x}%`,
        top: `${y}%`,
      };
    };

    // 处理窗口大小变化
    const handleWindowResize = () => {
      if (routeId.value === 'internet') {
        if (chartType.value === "heatmap") {
          resizeHeatmapHandler();
        } else if (chartType.value === "analysis") {
          resizeHistograms();
        }
      } else if (routeId.value === 'energy') {
        resizeEisenhower();
      }
    };

    // 中英文说明映射表
    const explanationKeyMapping: Record<string, string> = {
      "domainKnowledgeIntegrity": "领域知识完整性",
      "temporalFeatureCompleteness": "时间特征完备度", 
      "timeGranularityCoverage": "时间粒度覆盖率",
      "sequenceStability": "时序平稳性",
      "domainKnowledgeDiversity": "领域知识多样性",
      "seasonalityStrength": "季节性强度",
      "mainFrequencyStrength": "主频强度",
      "featureIndependence": "特征独立性",
      "sampleBalance": "样本均衡性",
      "trendStrength": "趋势强度",
      "dataCompleteness": "数据完整性",
      "labelConsistency": "标签一致性"
    };

    // 加载靶点分析数据
    const loadTargetAnalysis = async () => {
      try {
        const response = await getTargetAnalysis();
        const data = response.data;

        // 更新靶点分析数据和解释
        Object.keys(targetData).forEach((key) => {
          if (data.metrics[key] !== undefined) {
            targetData[key as keyof typeof targetData] = data.metrics[key];
          }
          
          // 更新解释内容，优先使用API返回的解释
          let explanationContent = "";
          
          // 首先尝试用英文key获取解释
          if (data.explanations[key] && data.explanations[key].trim() !== "") {
            explanationContent = data.explanations[key];
          } 
          // 如果没有找到，尝试用中文key获取解释（Energy数据集的情况）
          else if (explanationKeyMapping[key] && data.explanations[explanationKeyMapping[key]]) {
            explanationContent = data.explanations[explanationKeyMapping[key]];
          } 
          // 最后使用默认说明
          else {
            explanationContent = `暂无详细说明，请检查数据源或联系管理员。`;
          }
          
          targetExplanations[key].score = data.metrics[key] || 0;
          targetExplanations[key].content = explanationContent;
        });
        
        // 默认选择第一个可显示的靶点
        const availableKeys = displayedTargetKeys.value;
        if (availableKeys.length > 0) {
          selectedTargetKey.value = availableKeys[0];
        }
        isAnalysisEnd.value = true;
        return true;
      } catch (error) {
        console.error("加载靶点分析数据失败", error);
        return false;
      }
    };

    // 初始化图表
    const initCharts = async () => {
      if (routeId.value === 'internet') {
        if (chartType.value === "heatmap") {
          initHeatmap();
        } else if (chartType.value === "analysis") {
          await loadHistogramData();
          nextTick(() => {
            if (histogramChartRefs.value.length > 0) {
              setChartRefs(histogramChartRefs.value);
              initHistogramCharts();
            }
          });
        }
      } else if (routeId.value === 'energy') {
        // 确保艾森豪威尔矩阵正确初始化
        if (chartType.value === "eisenhower") {
          await initEisenhowerMatrix();
        }
      }
    };

    // 组件挂载时加载数据
    onMounted(async () => {
      // 加载靶点分析数据
      await loadTargetAnalysis();

      // 初始化图表
      await initCharts();

      // 添加窗口大小变化监听
      window.addEventListener("resize", handleWindowResize);
    });

    // 在组件销毁前清理资源
    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleWindowResize);
      disposeHeatmap();
      disposeHistogramCharts();
      disposeEisenhower();
    });

    // 监听路由参数变化
    watch(
      () => route.params.key,
      (newKey) => {
        routeId.value = newKey as string;
        // 根据新的routeId设置默认的chartType
        chartType.value = routeId.value === 'internet' ? "heatmap" : "eisenhower";
        // 重新初始化图表
        initCharts();
      }
    );

    // 监听可见性变化，重新渲染图表
    watch(
      () => props.visible,
      (isVisible) => {
        if (isVisible) {
          setTimeout(() => {
            initCharts();
          }, 300);
        }
      }
    );

    // 监听图表类型变化
    watch(
      () => chartType.value,
      async (newType) => {
        if (!props.visible) return;

        if (routeId.value === 'internet') {
          if (newType === "heatmap") {
            setTimeout(() => {
              if (heatmapLoaded.value) {
                resizeHeatmap();
              } else {
                initHeatmap();
              }
            }, 100);
          } else if (newType === "analysis") {
            // 确保数据已加载
            if (!histogramData.value) {
              await loadHistogramData();
            }

            // 等待DOM更新后初始化图表
            nextTick(() => {
              if (histogramChartRefs.value.length > 0) {
                setChartRefs(histogramChartRefs.value);
                initHistogramCharts();
              }
            });
          }
        } else if (routeId.value === 'energy') {
          if (newType === "eisenhower") {
            setTimeout(() => {
              if (eisenhowerLoaded.value) {
                resizeEisenhower();
              } else {
                initEisenhowerMatrix();
              }
            }, 100);
          }
        }
      }
    );

    // 监听柱状图DOM引用变化
    watch(
      () => histogramChartRefs.value,
      (refs) => {
        if (
          refs.length > 0 &&
          chartType.value === "analysis" &&
          props.visible &&
          routeId.value === 'internet'
        ) {
          setChartRefs(refs);
          initHistogramCharts();
        }
      },
      { deep: true }
    );

    // 添加处理下一步的方法
    const handleNextStep = () => {
      emit("next-step");
    };

    // 新增图例数据数组
    const legendItems = ref([
      {
        color: "rgb(169, 209, 142)",
        label: "轻度靶点 (0-30)",
      },
      {
        color: "rgb(255, 217, 102)",
        label: "中等靶点 (30-60)",
      },
      {
        color: "rgb(192, 0, 0)",
        label: "严重靶点 (60-100)",
      },
    ]);

    return {
      chartType,
      histogramChartRefs,
      histogramData,
      targetData,
      targetExplanations,
      selectedTargetKey,
      selectTarget,
      formatScore,
      getIconForMetric,
      getIndicatorStyle,
      isAnalysisEnd,
      handleNextStep,
      // 新增的属性和方法
      editDialogVisible,
      currentEditTarget,
      currentEditValue,
      newTargetValue,
      deleteConfirmVisible,
      openEditDialog,
      saveTargetChange,
      cancelTargetEdit,
      confirmDeleteTarget,
      deleteTarget,
      legendItems,
      routeId,
      displayedTargetKeys,
    };
  },
});
</script>

<style lang="less" scoped>
.analysis-section {
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .analysis-content {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .target-analysis {
      display: flex;
      align-items: flex-start;

      .target-chart-container {
        width: 230px;
        margin: 10px;
        position: relative;

        .target-board {
          position: relative;
          width: 100%;
          height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;

          // 靶心圆环
          .target-circle {
            position: absolute;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            left: 50%;
            top: 50%;

            &.circle-1 {
              width: 100%;
              height: 100%;
              background-color: rgb(169, 209, 142);
              border: 1px solid #000;
            }

            &.circle-2 {
              width: 70%;
              height: 70%;
              background-color: rgb(255, 217, 102);
              border: 1px solid #000;
            }

            &.circle-3 {
              width: 40%;
              height: 40%;
              background-color: rgb(192, 0, 0);
              border: 1px solid #000;
            }
          }

          // 指标点
          .target-indicator {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 5;
            cursor: pointer;
            transition: all 0.3s ease;

            // 修改后的悬浮提示框样式
            .tooltip {
              position: absolute;
              visibility: hidden;
              opacity: 0;
              width: 160px;
              background-color: rgba(0, 0, 0, 0.75);
              color: #fff;
              text-align: left;
              border-radius: 6px;
              padding: 8px 10px;
              z-index: 100;
              transition: opacity 0.3s;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              pointer-events: auto;

              &:hover {
                visibility: visible;
                opacity: 1;
              }

              &:after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.75) transparent transparent
                  transparent;
              }

              .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 14px;
              }

              .tooltip-value {
                display: flex;
                justify-content: space-between;
                margin-top: 3px;
                font-size: 12px;

                .label {
                  color: #ccc;
                }

                .value {
                  font-weight: bold;
                }
              }
            }

            // 新增的编辑按钮浮窗样式
            .edit-popup {
              position: absolute;
              color: rgba(0, 0, 0, 0.75);
              text-align: left;
              border-radius: 6px;
              padding: 0;
              z-index: 1000;
              transition: opacity 0.3s;
              right: 0;
              top: 0;
              transform: translateX(-50%);
              pointer-events: auto;

              .ant-btn {
                font-size: 12px;
                height: 28px;
                line-height: 26px;
                padding: 0 8px;
                border-radius: 4px;
              }
            }

            .indicator-marker {
              position: relative;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              margin-bottom: 5px;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;

              // 四条边线样式
              .line-top {
                position: absolute;
                width: 2px;
                height: 7px;
                background-color: #1890ff;
                transition: background-color 0.3s ease;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -150%);
              }

              .line-right {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #1890ff;
                transition: background-color 0.3s ease;
                right: 50%;
                top: 50%;
                transform: translate(150%, -50%);
              }

              .line-bottom {
                position: absolute;
                width: 2px;
                height: 7px;
                background-color: #1890ff;
                transition: background-color 0.3s ease;
                bottom: 50%;
                left: 50%;
                transform: translate(-50%, 150%);
              }

              .line-left {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #1890ff;
                transition: background-color 0.3s ease;
                left: 50%;
                top: 50%;
                transform: translate(-150%, -50%);
              }

              // 给镂空圆环添加白色背景，以确保十字被圆环遮挡
              .circle-ring {
                position: absolute;
                width: 14px;
                height: 14px;
                border: 3px solid #1890ff;
                border-radius: 50%;
                transition: border-color 0.3s ease;
                z-index: 1; // 确保圆环在十字前面
              }
            }

            &:hover {
              z-index: 100;

              .tooltip {
                visibility: visible;
                opacity: 1;
              }

              .indicator-marker {
                transform: scale(1.1);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #220baa; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #220baa; // 选中为青绿色边框
                }
              }
            }

            &.active {
              z-index: 10;

              .indicator-marker {
                transform: scale(1.1);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #220baa; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #220baa; // 选中为青绿色边框
                }
              }
            }
          }
        }
      }

      .target-explanations {
        flex: 1;
        padding: 0 20px;

        .metric-explanation {
          padding: 15px;
          border-radius: 8px;
          background-color: rgba(0, 155, 164, 0.05);

          .explanation-title {
            font-weight: 500;
            font-size: 16px;
            color: @primary-color;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px dashed rgba(0, 155, 164, 0.2);
          }

          .explanation-content {
            color: #666;
            line-height: 1.6;
            white-space: pre-line;
          }
        }
      }
    }

    .additional-analysis {
      min-height: 405px;

      .analysis-controls {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
      }

      .histogram-container {
        width: 100%;
        height: 350px;
        display: flex;
        justify-content: center;
        align-items: center;

        .loading-charts {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #999;
        }

        .histogram-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 15px;
          width: 100%;
          height: 100%;

          @media (min-width: 1200px) {
            grid-template-columns: repeat(4, 1fr);
          }

          .histogram-item {
            width: 100%;
            height: 160px;
            background-color: #fff;
            border-radius: 6px;
          }
        }
      }
    }
  }

  .module-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;

    .placeholder-text {
      margin-top: 15px;
      color: #999;
    }
  }

  /* 添加下一步按钮样式 */
  .next-step-action {
    margin-bottom: 0px;
    display: flex;
    justify-content: flex-end;
  }

  .target-legend {
    position: absolute;
    left: -35px;
    width: 300px;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;

    .legend-item {
      display: flex;
      align-items: center;
      margin: 0 5px;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        margin-right: 5px;
      }

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }

  /* 添加靶点编辑弹窗样式 */
  .edit-target-form {
    padding: 10px 0;

    .form-row {
      display: flex;
      margin-bottom: 16px;
      align-items: center;

      .form-label {
        width: 80px;
        flex-shrink: 0;
        color: #666;
      }

      .form-value {
        flex: 1;
        font-weight: 500;
      }
    }

    .ant-slider {
      width: 100%;
      margin: 10px 0;
    }
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-start;
  }
}

:global(.ant-slider-tooltip) {
  position: absolute !important;
  top: -50px !important;
  left: -11px !important;
}

:global(.edit-button) {
  padding: 0 !important;
  background-color: transparent !important;
}

#eisenhower-matrix {
  width: 100%;
  height: 410px;
  min-height: 410px;
  background-color: #fff;
}
</style>