<template>
  <div class="quality-section">
    <h2>数据质量评估</h2>
    <div v-if="visible" class="quality-content">
      <div ref="radarChartRef" class="radar-chart"></div>
      <div class="quality-tips">
        <!-- <h3>
          评估指标说明
          <span class="tip-hint">(点击图表指标查看详情)</span>
        </h3> -->
        <!-- 数据量详情 -->
        <div
          v-if="selectedQualityMetric === 'dataVolume'"
          class="tip-item active-tip"
        >
          <div class="tip-title">数据量</div>
          <div class="tip-content">
            {{ qualityExplanations.dataVolume }}
          </div>
          <div class="secondary-metrics">
            <div v-for="key in currentSecondaryMetrics" :key="key" class="secondary-metric-item">
              <span class="metric-label">{{ getMetricName(key) }}：</span>
              <span class="metric-value">
                <template v-if="['sampleCount', 'imageCount'].includes(key)">
                  {{ formatValue(secondaryMetrics[key]) }}
                </template>
                <template v-else>
                  {{ formatPercent(secondaryMetrics[key]) }}
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- 数据表示质量详情 -->
        <div
          v-if="selectedQualityMetric === 'dataAlignment'"
          class="tip-item active-tip"
        >
          <div class="tip-title">数据表示质量</div>
          <div class="tip-content">
            {{ qualityExplanations.dataAlignment }}
          </div>
          <div class="secondary-metrics">
            <div v-for="key in currentSecondaryMetrics" :key="key" class="secondary-metric-item">
              <span class="metric-label">{{ getMetricName(key) }}：</span>
              <span class="metric-value">
                <template v-if="['sampleCount', 'imageCount'].includes(key)">
                  {{ formatValue(secondaryMetrics[key]) }}
                </template>
                <template v-else>
                  {{ formatPercent(secondaryMetrics[key]) }}
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- 数据冗余详情 -->
        <div
          v-if="selectedQualityMetric === 'dataRedundancy'"
          class="tip-item active-tip"
        >
          <div class="tip-title">数据冗余</div>
          <div class="tip-content">
            {{ qualityExplanations.dataRedundancy }}
          </div>
          <div class="secondary-metrics">
            <div v-for="key in currentSecondaryMetrics" :key="key" class="secondary-metric-item">
              <span class="metric-label">{{ getMetricName(key) }}：</span>
              <span class="metric-value">
                <template v-if="['sampleCount', 'imageCount'].includes(key)">
                  {{ formatValue(secondaryMetrics[key]) }}
                </template>
                <template v-else>
                  {{ formatPercent(secondaryMetrics[key]) }}
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- 数据上下文质量详情 -->
        <div
          v-if="selectedQualityMetric === 'diversityBalance'"
          class="tip-item active-tip"
        >
          <div class="tip-title">数据上下文质量</div>
          <div class="tip-content">
            {{ qualityExplanations.diversityBalance }}
          </div>
          <div class="secondary-metrics">
            <div v-for="key in currentSecondaryMetrics" :key="key" class="secondary-metric-item">
              <span class="metric-label">{{ getMetricName(key) }}：</span>
              <span class="metric-value">
                <template v-if="['sampleCount', 'imageCount'].includes(key)">
                  {{ formatValue(secondaryMetrics[key]) }}
                </template>
                <template v-else>
                  {{ formatPercent(secondaryMetrics[key]) }}
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- 数据内在质量详情 -->
        <div
          v-if="selectedQualityMetric === 'codeQuality'"
          class="tip-item active-tip"
        >
          <div class="tip-title">数据内在质量</div>
          <div class="tip-content">
            {{ qualityExplanations.codeQuality }}
          </div>
          <div class="secondary-metrics">
            <div v-for="key in currentSecondaryMetrics" :key="key" class="secondary-metric-item">
              <span class="metric-label">{{ getMetricName(key) }}：</span>
              <span class="metric-value">
                <template v-if="['sampleCount', 'imageCount'].includes(key)">
                  {{ formatValue(secondaryMetrics[key]) }}
                </template>
                <template v-else>
                  {{ formatPercent(secondaryMetrics[key]) }}
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="module-placeholder">
      <a-spin />
      <div class="placeholder-text">等待数据质量评估完成...</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import * as echarts from "echarts";
import mockDataMetrics from "/@/mock/dataMetrics.json";
import {
  QualityMetrics,
  SecondaryMetrics,
} from "../hooks/useQualityAssessment";

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    qualityMetrics: {
      type: Object as PropType<QualityMetrics>,
      required: true,
    },
    secondaryMetrics: {
      type: Object as PropType<SecondaryMetrics>,
      required: true,
    },
    qualityExplanations: {
      type: Object,
      required: true,
    },
    selectedQualityMetric: {
      type: String,
      required: true,
    },
    metricNameMap: {
      type: Object as PropType<Record<string, string>>,
      required: true,
    },
  },
  emits: ["update:selectedQualityMetric"],
  setup(props, { emit }) {
    // 获取当前路由
    const route = useRoute();
    // 获取当前数据集类型
    const getType = () => {
      const id = Number(route.params.id ?? route.query.taskId);
      return id === 2 ? "energy" : "Internet";
    };
    // 获取当前一级指标对应的二级指标数组
    const secondaryMetricMap = mockDataMetrics.secondaryMetricMap as Record<string, Record<string, string[]>>;
    const currentSecondaryMetrics = computed<string[]>(() => {
      const type = getType();
      const metric = props.selectedQualityMetric;
      return secondaryMetricMap[type]?.[metric] || [];
    });
    const radarChartRef = ref<HTMLElement | null>(null);
    let radarChart: echarts.ECharts | null = null;

    // 格式化百分比
    const formatPercent = (value: number) => {
      return value ? value.toFixed(1) : "0.0";
    };

    // 格式化值，对数字添加千分位分隔符
    const formatValue = (value: number) => {
      if (!value) return "0";
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 动态获取指标中文名
    const getMetricName = (key: string) => {
      return props.metricNameMap?.[key] || key;
    };

    const initRadarChart = () => {
      if (!radarChartRef.value) return;

      radarChart = echarts.init(radarChartRef.value);

      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: ["原始数据"],
          selectedMode: false,
          bottom: 0,
          left: "center",
          padding: [10, 10],
        },
        radar: {
          indicator: [
            { name: "数据量", max: 100 },
            { name: "数据表示质量", max: 100 },
            { name: "数据冗余", max: 100 },
            { name: "数据上下文质量", max: 100 },
            { name: "数据内在质量", max: 100 },
          ],
          triggerEvent: true,
          axisName: {
            color: "#666",
            fontSize: 12,
            fontWeight: 500,
          },
          center: ["50%", "50%"],
          splitArea: {
            areaStyle: {
              color: [
                "rgba(0, 155, 164, 0.02)",
                "rgba(0, 155, 164, 0.05)",
                "rgba(0, 155, 164, 0.1)",
                "rgba(0, 155, 164, 0.15)",
              ],
            },
          },
        },
        series: [
          {
            name: "数据质量评估",
            type: "radar",
            data: [
              {
                value: [
                  props.qualityMetrics.dataVolume,
                  props.qualityMetrics.dataAlignment,
                  props.qualityMetrics.dataRedundancy,
                  props.qualityMetrics.diversityBalance,
                  props.qualityMetrics.codeQuality,
                ],
                name: "原始数据",
                areaStyle: {
                  color: "rgba(0, 155, 164, 0.2)",
                },
                lineStyle: {
                  color: "rgba(0, 155, 164, 1)",
                },
                itemStyle: {
                  color: "rgba(0, 155, 164, 1)",
                },
              },
            ],
          },
        ],
      };

      radarChart.setOption(option);

      // 添加点击事件监听
      radarChart.on("click", (params) => {
        const indicatorNames = [
          "数据量",
          "数据表示质量",
          "数据冗余",
          "数据上下文质量",
          "数据内在质量",
        ];
        const indicatorKeys = [
          "dataVolume",
          "dataAlignment",
          "dataRedundancy",
          "diversityBalance",
          "codeQuality",
        ];

        // 获取点击的指标索引
        const clickedIndex = indicatorNames.indexOf(params.name);
        if (clickedIndex !== -1) {
          emit("update:selectedQualityMetric", indicatorKeys[clickedIndex]);
        }
      });
    };

    onMounted(() => {
      if (props.visible) {
        initRadarChart();
      }

      // 监听窗口大小变化，重新渲染图表
      window.addEventListener("resize", () => {
        radarChart?.resize();
      });
    });

    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          // 当质量评估模块显示时，重新初始化图表
          setTimeout(() => {
            initRadarChart();
          }, 100);
        }
      }
    );

    // 当指标数据更新时重新渲染图表
    watch(
      () => [props.qualityMetrics, props.secondaryMetrics],
      () => {
        if (props.visible && radarChart) {
          initRadarChart();
        }
      },
      { deep: true }
    );

    return {
      radarChartRef,
      formatPercent,
      formatValue,
      getMetricName,
      currentSecondaryMetrics,
      secondaryMetrics: props.secondaryMetrics as unknown as Record<string, number>,
    };
  },
});
</script>

<style lang="less" scoped>
.quality-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: calc(100% - 40px);

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .quality-content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    .radar-chart {
      flex: 1;
      height: 300px;
      min-width: 300px;
    }

    .quality-tips {
      flex: 1;
      min-width: 300px;

      h3 {
        margin-top: 0;
        font-size: 16px;
        color: #333;
        margin-bottom: 15px;

        .tip-hint {
          font-size: 13px;
          font-weight: normal;
          color: #999;
        }
      }

      .tip-item {
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        background-color: #f9f9f9;
        transition: all 0.3s ease;

        &.active-tip {
          background-color: rgba(0, 155, 164, 0.1);
          border-left: 3px solid @primary-color;
          animation: fadeIn 0.5s ease-in-out;
        }

        .tip-title {
          font-weight: 500;
          color: @primary-color;
          margin-bottom: 5px;
        }

        .tip-content {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .secondary-metrics {
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 6px;
          padding: 10px;
          margin-top: 8px;
          border: 1px dashed rgba(0, 155, 164, 0.3);

          .secondary-metric-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;

            &:last-child {
              margin-bottom: 0;
            }

            .metric-label {
              color: #555;
              font-size: 13px;
            }

            .metric-value {
              font-weight: 500;
              color: @primary-color;
              font-size: 13px;
            }
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
}
</style>
