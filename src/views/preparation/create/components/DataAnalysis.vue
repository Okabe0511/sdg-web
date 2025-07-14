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

            <!-- 三个指标点 -->
            <div
              class="target-indicator"
              v-for="(item, key) in targetData"
              :key="key"
              :class="{ active: selectedTargetKey === key }"
              :style="getIndicatorStyle(key, item)"
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
                  <span class="value">{{ formatScore(item) }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'configDiversity'">
                  <span class="label">多样性:</span>
                  <span class="value">{{
                    item > 70 ? "严重靶点" : item > 40 ? "中等靶点" : "轻度靶点"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'dataVolume'">
                  <span class="label">数据量:</span>
                  <span class="value">{{
                    item > 70 ? "严重靶点" : item > 40 ? "中等靶点" : "轻度靶点"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'chartTypeBalance'">
                  <span class="label">均衡性:</span>
                  <span class="value">{{
                    item > 70 ? "严重靶点" : item > 40 ? "中等靶点" : "轻度靶点"
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
       

        <div
          v-show="chartType === 'eisenhower'"
          id="eisenhower-matrix"
          style="width: 100%; height: 405px"
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
            :getTooltipPopupContainer="(node) => node"
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
} from "vue";
import { message } from "ant-design-vue";
import { RightOutlined, EditOutlined } from "@ant-design/icons-vue";
import { useEisenhowerMatrix } from "../hooks/useEisenhowerMatrix";
import { getTargetAnalysis } from "/@/serve/api/targetAnalysis";

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
    onNextStep: {
      type: Function as PropType<() => void>,
      required: false,
    },
  },
  emits: ["next-step"],
  setup(props, { emit }) {
    // 原有部分保持不变
    const chartType = ref("eisenhower"); // 默认显示eisenhower图
    const histogramChartRefs = ref<HTMLElement[]>([]);
    const isAnalysisEnd = ref(false);

    // 使用eisenhower图钩子
    const {
    chartLoaded,
    initEisenhowerMatrix,
    disposeChart,
    resizeChart: handleResize,
    } = useEisenhowerMatrix();



    // 靶点分析数据
    const targetData = reactive({
      configDiversity: 0,
      dataVolume: 0,
      chartTypeBalance: 0,
    });

    // 用于记录删除的靶点
    const deletedTargets = ref<string[]>([]);

    // 靶点解释数据
    const targetExplanations = reactive<Record<string, TargetExplanation>>({
      configDiversity: { title: "配置项多样性", score: 0, content: "" },
      dataVolume: { title: "数据量", score: 0, content: "" },
      chartTypeBalance: { title: "图表类型均衡性", score: 0, content: "" },
    });

    // 当前选中的靶点
    const selectedTargetKey = ref("configDiversity");

    // 新增编辑弹窗状态
    const editDialogVisible = ref(false);
    const currentEditTarget = ref<string | null>(null);
    const currentEditValue = ref(0);
    const newTargetValue = ref(0);
    const deleteConfirmVisible = ref(false);

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
      deleteConfirmVisible.value = true;
    };

    // 删除靶点
    const deleteTarget = () => {
      if (currentEditTarget.value) {
        // 记录已删除的靶点
        deletedTargets.value.push(currentEditTarget.value);

        // 从数据中删除该靶点
        delete targetData[currentEditTarget.value as keyof typeof targetData];

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
          const availableKeys = Object.keys(targetData);
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
      };
      return iconMap[key] || "flag";
    };

    // 计算指标点在靶图上的位置
    const getIndicatorStyle = (key: string, value: number) => {
      // 根据三个指标的位置，设置不同的角度
      const angles: Record<string, number> = {
        configDiversity: 30, // 右上
        dataVolume: 150, // 左上
        chartTypeBalance: 270, // 下方
      };

      // 计算离靶心的距离，当值为100时在靶心(0%)，当值为0时在靶边缘(100%)
      const distancePercent = 100 - value;

      const angle = angles[key];
      const radians = (angle * Math.PI) / 180;
      const x = 50 + (Math.cos(radians) * distancePercent) / 2; // 除以2使得最大范围不超过边界
      const y = 50 + (Math.sin(radians) * distancePercent) / 2;

      return {
        left: `${x}%`,
        top: `${y}%`,
      };
    };

    // 处理窗口大小变化
    const handleWindowResize = () => {
      if (chartType.value === "eisenhower") {
        handleResize();
      } 
    };

    // 加载靶点分析数据
    const loadTargetAnalysis = async () => {
      try {
        const response = await getTargetAnalysis();
        const data = response.data;

        // 更新靶点分析数据
        targetData.configDiversity = data.metrics.configDiversity;
        targetData.dataVolume = data.metrics.dataVolume;
        targetData.chartTypeBalance = data.metrics.chartTypeBalance;

        // 更新靶点解释数据
        targetExplanations.configDiversity = {
          title: "配置项多样性",
          score: data.metrics.configDiversity,
          content: data.explanations.configDiversity,
        };
        targetExplanations.dataVolume = {
          title: "数据量",
          score: data.metrics.dataVolume,
          content: data.explanations.dataVolume,
        };
        targetExplanations.chartTypeBalance = {
          title: "图表类型均衡性",
          score: data.metrics.chartTypeBalance,
          content: data.explanations.chartTypeBalance,
        };

        // 默认选择第一个靶点
        selectedTargetKey.value = "configDiversity";
        isAnalysisEnd.value = true;
        return true;
      } catch (error) {
        console.error("加载靶点分析数据失败", error);
        return false;
      }
    };

    // 组件挂载时加载数据
    onMounted(async () => {
      // 加载靶点分析数据
      await loadTargetAnalysis();

      // 加载初始图表
      if (props.visible) {
        if (chartType.value === "eisenhower") {
          initEisenhowerMatrix();
        }
      }

      // 添加窗口大小变化监听
      window.addEventListener("resize", handleWindowResize);
    });

    // 在组件销毁前清理资源
    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleWindowResize);
      disposeChart();
    });

    // 监听可见性变化，重新渲染图表
    watch(
      () => props.visible,
      (isVisible) => {
        if (isVisible) {
          if (chartType.value === "eisenhower") {
            // 页面显示时，确保图表正确渲染
            setTimeout(() => {
              if (chartLoaded.value) {
                handleResize();
              } else {
                initEisenhowerMatrix();
              }
            }, 300);
          } 
        }
      }
    );

    // 监听图表类型变化
    watch(
      () => chartType.value,
      async (newType) => {
        if (!props.visible) return;

        if (newType === "eisenhower") {
          setTimeout(() => {
            if (chartLoaded.value) {
              handleResize();
            } else {
              initEisenhowerMatrix();
            }
          }, 100);
        } 
      }
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
      legendItems, // 新增返回值
    };
  },
});
</script>

<style lang="less" scoped>
/* 保留原有样式 */
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
    margin-top: 20px;
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
</style>
