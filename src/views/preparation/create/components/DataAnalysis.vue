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
            <div class="target-circle circle-5"></div>

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
              <!-- 添加悬浮提示框 -->
              <div class="tooltip">
                <div class="tooltip-title">
                  {{ targetExplanations[key].title }}
                </div>
                <div class="tooltip-value">
                  <span class="label">得分:</span>
                  <span class="value">{{ formatScore(item) }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'configDiversity'">
                  <span class="label">多样性:</span>
                  <span class="value">{{
                    item > 70 ? "高" : item > 40 ? "中" : "低"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'dataVolume'">
                  <span class="label">数据量:</span>
                  <span class="value">{{
                    item > 70 ? "充足" : item > 40 ? "适中" : "不足"
                  }}</span>
                </div>
                <div class="tooltip-value" v-if="key === 'chartTypeBalance'">
                  <span class="label">均衡性:</span>
                  <span class="value">{{
                    item > 70 ? "优" : item > 40 ? "良" : "差"
                  }}</span>
                </div>
              </div>
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
          <a-radio-group
            v-model:value="chartType"
            button-style="solid"
            size="small"
          >
            <a-radio-button value="heatmap">微观</a-radio-button>
            <a-radio-button value="analysis">聚合</a-radio-button>
          </a-radio-group>
        </div>

        <div
          v-show="chartType === 'heatmap'"
          id="main"
          style="width: 100%; height: 350px"
        ></div>

        <div v-show="chartType === 'analysis'" class="histogram-container">
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
      <div class="placeholder-text">等待数据靶点发现完成...</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  reactive,
  onBeforeUnmount,
  nextTick,
} from "vue";
import Icon from "/@/components/Icon/index.vue";
import { RightOutlined } from "@ant-design/icons-vue";
import { getTargetAnalysis } from "/@/serve/api/targetAnalysis";
import { useHeatmapChart } from "../hooks/useHeatmapChart";
import { useHistogramCharts } from "../hooks/useHistogramCharts";

interface TargetExplanation {
  title: string;
  score: number;
  content: string;
}

export default defineComponent({
  components: {
    Icon,
    RightOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["next-step"],
  setup(props, { emit }) {
    const isAnalysisEnd = ref(false);
    const chartType = ref("heatmap"); // 默认显示热力图
    const histogramChartRefs = ref<HTMLElement[]>([]);

    // 使用热力图钩子
    const {
      chartLoaded,
      initHeatmap,
      disposeChart,
      resizeChart,
      handleResize: resizeHeatmap,
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

    // 靶点分析数据
    const targetData = reactive({
      configDiversity: 0,
      dataVolume: 0,
      chartTypeBalance: 0,
    });

    // 靶点解释数据
    const targetExplanations = reactive<Record<string, TargetExplanation>>({
      configDiversity: { title: "配置项多样性", score: 0, content: "" },
      dataVolume: { title: "数据量", score: 0, content: "" },
      chartTypeBalance: { title: "图表类型均衡性", score: 0, content: "" },
    });

    // 当前选中的靶点
    const selectedTargetKey = ref("configDiversity");

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

      // 计算离靶心的距离
      const distancePercent = ((100 - value) / 100) * 40 + 10;
      const angle = angles[key];
      const radians = (angle * Math.PI) / 180;
      const x = 50 + Math.cos(radians) * distancePercent;
      const y = 50 + Math.sin(radians) * distancePercent;

      return {
        left: `${x}%`,
        top: `${y}%`,
      };
    };

    // 处理窗口大小变化
    const handleWindowResize = () => {
      if (chartType.value === "heatmap") {
        resizeHeatmap();
      } else if (chartType.value === "analysis") {
        resizeHistograms();
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

      // 加载柱状图数据
      await loadHistogramData();

      // 加载初始图表
      if (props.visible) {
        if (chartType.value === "heatmap") {
          initHeatmap();
        }
      }

      // 添加窗口大小变化监听
      window.addEventListener("resize", handleWindowResize);
    });

    // 在组件销毁前清理资源
    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleWindowResize);
      disposeChart();
      disposeHistogramCharts();
    });

    // 监听可见性变化，重新渲染图表
    watch(
      () => props.visible,
      (isVisible) => {
        if (isVisible) {
          if (chartType.value === "heatmap") {
            // 页面显示时，确保图表正确渲染
            setTimeout(() => {
              if (chartLoaded.value) {
                resizeChart();
              } else {
                initHeatmap();
              }
            }, 300);
          } else if (chartType.value === "analysis") {
            // 初始化柱状图
            nextTick(() => {
              if (histogramChartRefs.value.length > 0) {
                setChartRefs(histogramChartRefs.value);
                initHistogramCharts();
              }
            });
          }
        }
      }
    );

    // 监听图表类型变化
    watch(
      () => chartType.value,
      async (newType) => {
        if (!props.visible) return;

        if (newType === "heatmap") {
          setTimeout(() => {
            if (chartLoaded.value) {
              resizeChart();
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
      }
    );

    // 监听柱状图DOM引用变化
    watch(
      () => histogramChartRefs.value,
      (refs) => {
        if (
          refs.length > 0 &&
          chartType.value === "analysis" &&
          props.visible
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

    return {
      targetData,
      targetExplanations,
      selectedTargetKey,
      isAnalysisEnd,
      chartType,
      selectTarget,
      formatScore,
      getIndicatorStyle,
      getIconForMetric,
      handleNextStep,
      histogramData,
      histogramChartRefs,
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
        width: 250px;
        position: relative;

        .target-board {
          position: relative;
          width: 100%;
          height: 250px;
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
              width: 90%;
              height: 90%;
              background-color: rgb(169, 209, 142);
              border: 1px solid #000;
            }

            &.circle-2 {
              width: 66%;
              height: 66%;
              background-color: rgb(255, 217, 102); // 红色背景
              border: 1px solid #000;
            }

            &.circle-5 {
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

            // 添加悬浮提示框
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
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              pointer-events: none;

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
                background-color: #fff;
                transition: background-color 0.3s ease;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -150%);
              }

              .line-right {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #fff;
                transition: background-color 0.3s ease;
                right: 50%;
                top: 50%;
                transform: translate(150%, -50%);
              }

              .line-bottom {
                position: absolute;
                width: 2px;
                height: 7px;
                background-color: #fff;
                transition: background-color 0.3s ease;
                bottom: 50%;
                left: 50%;
                transform: translate(-50%, 150%);
              }

              .line-left {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #fff;
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
                border: 3px solid #fff;
                border-radius: 50%;
                transition: border-color 0.3s ease;
                z-index: 1; // 确保圆环在十字前面
              }
            }

            &:hover {
              z-index: 10;

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
                  background-color: #13c2c2; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #13c2c2; // 选中为青绿色边框
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
                  background-color: #13c2c2; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #13c2c2; // 选中为青绿色边框
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
      min-height: 350px;

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
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
