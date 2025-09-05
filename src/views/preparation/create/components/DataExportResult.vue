<template>
  <div class="result-section">
    <h2>制备结果导出</h2>
    <div v-if="visible" class="result-content">
      <!-- ...existing code... -->

      <!-- 导出按钮区域 -->
      <div class="export-actions">
        <a-button type="primary" @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          下载数据集
        </a-button>
        <a-button @click="handleCopyLink">
          <template #icon><LinkOutlined /></template>
          复制链接
        </a-button>
      </div>

      <!-- 三部分结果展示区域 -->
      <div class="result-modules">
        <div class="left-modules">
          <!-- 数据量模块 -->
          <div class="data-volume-module">
            <h3>数据量指标</h3>
            <div class="volume-metrics">
              <div
                v-for="(metric, index) in volumeMetrics"
                :key="index"
                class="volume-metric-item"
              >
                <div class="metric-content">
                  <div class="metric-label">{{ metric.dataType ? metric.dataType + '数量' : '数据对数量' }}</div>
                  <div class="metric-value">
                    {{ metric.value }}
                    <span
                      class="growth-rate"
                      :class="{ positive: metric.growthRate > 0 }"
                    >
                      {{ formatGrowthRate(metric.growthRate) }}
                      <Icon
                        v-if="metric.growthRate !== 0"
                        :name="
                          metric.growthRate > 0 ? 'arrow-up' : 'arrow-down'
                        "
                      />
                      <span v-if="metric.growthRate === 0">-</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 数据特征评估模块 -->
          <div class="data-quality-module">
            <h3>数据特征评估</h3>
            <div ref="qualityChartRef" class="quality-chart"></div>
          </div>
        </div>

        <!-- 并排的下两个模块 -->
        <div class="result-bottom-modules">
          <!-- 数据对比列表 -->
          <div class="data-comparison-module">
            <h3>原始与制备后数据对比</h3>
            <div class="comparison-table-scroll">
              <div class="comparison-table">
                <div class="table-header">
                  <div class="header-cell">指标</div>
                  <div class="header-cell">原始数据</div>
                  <div class="header-cell">制备后数据</div>
                  <div class="header-cell">提升率</div>
                </div>
                <div class="table-body">
                  <div
                    v-for="(item, key) in currentMetrics"
                    :key="key"
                    class="table-row"
                  >
                    <div class="row-cell">{{ getMetricName(key) }}</div>
                    <div class="row-cell">
                      {{ formatPercent(originalMetrics[key] || 0) }}
                    </div>
                    <div
                      class="row-cell"
                      :class="{
                        'higher-value': item > (originalMetrics[key] || 0),
                      }"
                    >
                      {{ formatPercent(item) }}
                    </div>
                    <div
                      class="row-cell improvement"
                      :class="{
                        improved: getImprovementRate(key) > 0,
                        degraded: getImprovementRate(key) < 0,
                      }"
                    >
                      {{ formatImprovement(getImprovementRate(key)) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 添加悬浮的对照训练按钮 -->
      <div class="floating-train-button">
        <a-button type="primary" @click="handleComparisonTrain" size="large">
          <template #icon><Icon name="comparison" /></template>
          对照训练
        </a-button>
        <div class="button-hint">使用原始数据集和制备后数据集分别进行训练</div>
      </div>
    </div>

    <div v-else class="module-placeholder">
      <a-spin />
      <div class="placeholder-text">正在加载结果数据...</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, computed } from "vue";
import { DownloadOutlined, LinkOutlined } from "@ant-design/icons-vue";
import Icon from "/@/components/Icon/index.vue";
import DatasetHeader from "/@/components/DatasetHeader/index.vue";
import { useDataExport } from "../hooks/useDataExport";
import { useRoute, useRouter } from "vue-router";
import dataMetrics from  "/@/mock/dataMetrics.json"
import radarData from "/@/mock/radarData.json";
import targetAnalysisResponse from '/@/mock/targetAnalysisResponse.json';
export interface SecondaryMetrics {
  [key: string]: number;
}

export default defineComponent({
  components: {
    DatasetHeader,
    DownloadOutlined,
    LinkOutlined,
    Icon,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    metrics: {
      type: Object,
      default: () => ({}),
    },
    secondaryMetrics: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    // 获取当前任务ID
    const taskId = computed(() => {
      return route.params.key?.toString() || "internet";
    });

  
    const energyKeys = [
      "时间粒度覆盖率",
      "季节性强度",
      "时序平稳性",
      "时间特征完备度",
      "领域知识多样性",
      "领域知识完整性",
      "主频强度",
      "特征独立性",
      "样本均衡性",
      "趋势强度",
      "数据完整性",
      "标签一致性"
    ];    // 获取制备后指标（从 radarData.json 获取每个任务的最后一组数据）
    const getPreparedMetrics = (id: string) => {
      const secondaryData = radarData[`${id}_secondary` as keyof typeof radarData];
      if (!secondaryData || !Array.isArray(secondaryData) || secondaryData.length === 0) {
        return {};
      }
      // 返回最后一组数据
      return secondaryData[secondaryData.length - 1];
    };

    // 根据任务ID选择对应的制备后指标数据（task1->internet, task2,3->energy）
    const currentMetrics = computed(() => {
      if (taskId.value === 'internet') {
        return getPreparedMetrics('Internet') || {};
      } else {
        const energyMetrics: Record<string, number> = {};
        const energyData = getPreparedMetrics('energy');
        for (const k of energyKeys) {
          energyMetrics[k] = energyData[k as keyof typeof energyData] ?? 0;
        }
        return energyMetrics;
      }
    });

    // energy 靶点指标为 9 项，取原始分数
    const originalMetrics = computed(() => {
        if (taskId.value === 'internet') {
        return dataMetrics.originalMetrics['internet'] || {};
      } else {
        const energyMetrics: Record<string, number> = {};
        const energyData = dataMetrics.originalMetrics['energy'];
        for (const k of energyKeys) {
          energyMetrics[k] = energyData[k as keyof typeof energyData] ?? 0;
        }
        return energyMetrics;
      }
    });

    // 使用数据导出钩子
    const {
      qualityChartRef,
      volumeMetrics,
      initChart,
      formatPercent,
      formatImprovement,
      getImprovementRate,
      getMetricName,
      handleDownload,
      handleCopyLink,
    } = useDataExport();

    onMounted(() => {
      if (props.visible) {
        initChart(currentMetrics.value);
      }
    });

    watch(
      [() => props.visible, taskId],
      () => {
        if (props.visible) {
          initChart(currentMetrics.value);
        }
      }
    );

    // 封装提升率计算，适配组件接口
    const getImprovementRateWrapped = (key: string) => {
      return getImprovementRate(key, currentMetrics.value);
    };

    // 格式化增长率
    const formatGrowthRate = (growth: number): string => {
      const absGrowth = Math.abs(growth);
      return `${absGrowth.toFixed(1)}%`;
    };

    const handleComparisonTrain = () => {
      router.push(`/home/comparison/${taskId.value}`);
    };

    return {
      taskId,
      currentMetrics,
      qualityChartRef,
      originalMetrics,
      volumeMetrics,
      handleDownload,
      handleCopyLink,
      formatPercent,
      formatImprovement,
      getImprovementRate: getImprovementRateWrapped,
      getMetricName,
      formatGrowthRate,
      handleComparisonTrain,
    };
  },
});
</script>

<style lang="less" scoped>
.result-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .task-indicator {
    margin-bottom: 15px;
    
    .ant-tag {
      font-size: 14px;
      padding: 4px 12px;
      border-radius: 4px;
    }
  }

  .result-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    .export-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .result-modules {
      flex: 1;
      display: flex;
      gap: 20px;

      .left-modules {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .data-quality-module,
      .data-volume-module {
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 16px;

        h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
      }

      .quality-chart {
        height: 458px;
        flex: 1;
      }

      .result-bottom-modules {
        display: flex;
        flex: 2;
        gap: 20px;

        .data-comparison-module {
          flex: 1;
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;

          h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
            color: #333;
          }
        }

        .comparison-table-scroll {
          max-height: 600px;
          overflow-y: auto;
        }
        .comparison-table {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .table-header {
          display: flex;
          background-color: #eee;
          font-weight: bold;
          flex-shrink: 0;
        }
        .header-cell {
          flex: 1;
          padding: 18px 12px;
          text-align: center;
        }
        .table-body {
          width: 100%;
        }
        .table-row {
          display: flex;
          border-bottom: 1px solid #eee;
          &:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }
        }
        .row-cell {
          flex: 1;
          padding: 18px 12px;
          text-align: center;
          &.improvement-rate {
            color: #f5222d;
            &.positive {
              color: #52c41a;
            }
          }
          &.higher-value {
            color: #f56c6c;
            font-weight: 500;
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
    flex: 1;

    .placeholder-text {
      margin-top: 15px;
      color: #999;
    }
  }

  .data-volume-module {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    .volume-metrics {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;

      .volume-metric-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        width: 30%;
        min-width: 180px;

        .metric-icon {
          font-size: 24px;
          color: @primary-color;
          margin-right: 12px;
        }

        .metric-content {
          display: flex;
          flex-direction: column;

          .metric-label {
            font-size: 14px;
            color: #666;
          }

          .metric-value {
            font-size: 20px;
            font-weight: 500;
            color: #333;
            display: flex;
            align-items: center;

            .growth-rate {
              font-size: 14px;
              color: #333;
              margin-left: 8px;
              display: flex;
              align-items: center;

              &.positive {
                color: #f5222d;
              }

              :deep(.anticon) {
                margin-left: 4px;
              }

              span {
                display: inline-block;
                margin-left: 4px;
              }
            }
          }
        }
      }
    }
  }

  // 添加悬浮按钮样式
  .floating-train-button {
    position: fixed;
    bottom: 60px;
    right: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1000;

    .ant-btn {
      height: 36px;
      padding: 0 24px;
      font-size: 16px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 98, 106, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 98, 106, 0.4);
      }

      &:active {
        transform: translateY(1px);
      }
    }

    .button-hint {
      position: absolute;
      left: -180%;
      top: 0;
      font-size: 12px;
      color: #666;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 4px 8px;
      border-radius: 4px;
      text-align: center;
      max-width: 180px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>