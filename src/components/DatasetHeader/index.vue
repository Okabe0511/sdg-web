<template>
  <div class="dataset-header">
    <div class="dataset-title">
      <h1>{{ pageId === '2' ? '电价预测数据集（关系表）' : 'ECharts多模态数据集（图像+程序代码）' }}</h1>
    </div>
    <div class="dataset-metrics">
      <div v-if="pageId === '1'" class="metrics-row">
        <div class="metric-item">
          <div class="metric-icon">
            <Icon name="data" />
          </div>
          <div class="metric-content">
            <div class="metric-label">数据对数量</div>
            <div class="metric-value">
              {{ metrics.dataPairs }}
              <span
                class="growth-rate"
                :class="{ positive: metrics.dataPairsGrowth > 0 }"
              >
                {{ formatGrowth(metrics.dataPairsGrowth) }}
                <Icon
                  v-if="metrics.dataPairsGrowth !== 0"
                  :name="metrics.dataPairsGrowth > 0 ? 'arrow-up' : 'arrow-down'"
                />
                <span v-if="metrics.dataPairsGrowth === 0">-</span>
              </span>
            </div>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-icon">
            <Icon name="image" />
          </div>
          <div class="metric-content">
            <div class="metric-label">图像数量</div>
            <div class="metric-value">
              {{ metrics.imageCount }}
              <span
                class="growth-rate"
                :class="{ positive: metrics.imageCountGrowth > 0 }"
              >
                {{ formatGrowth(metrics.imageCountGrowth) }}
                <Icon
                  v-if="metrics.imageCountGrowth !== 0"
                  :name="metrics.imageCountGrowth > 0 ? 'arrow-up' : 'arrow-down'"
                />
                <span v-if="metrics.imageCountGrowth === 0">-</span>
              </span>
            </div>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-icon">
            <Icon name="code" />
          </div>
          <div class="metric-content">
            <div class="metric-label">程序代码数量</div>
            <div class="metric-value">
              {{ metrics.codeCount }}
              <span
                class="growth-rate"
                :class="{ positive: metrics.codeCountGrowth > 0 }"
              >
                {{ formatGrowth(metrics.codeCountGrowth) }}
                <Icon
                  v-if="metrics.codeCountGrowth !== 0"
                  :name="metrics.codeCountGrowth > 0 ? 'arrow-up' : 'arrow-down'"
                />
                <span v-if="metrics.codeCountGrowth === 0">-</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="pageId === '2'">
        <div class="metric-item">
          <div class="metric-icon">
            <Icon name="data" />
          </div>
          <div class="metric-content">
            <div class="metric-label">关系表数量</div>
            <div class="metric-value">
              {{ metrics.codeCount }}
              <span
                class="growth-rate"
                :class="{ positive: metrics.codeCountGrowth > 0 }"
              >
                {{ formatGrowth(metrics.codeCountGrowth) }}
                <Icon
                  v-if="metrics.codeCountGrowth !== 0"
                  :name="metrics.codeCountGrowth > 0 ? 'arrow-up' : 'arrow-down'"
                />
                <span v-if="metrics.codeCountGrowth === 0">-</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, watch, computed } from "vue";
import { useRoute } from 'vue-router';
import Icon from "/@/components/Icon/index.vue";

export interface DatasetMetrics {
  dataPairs: number;
  dataPairsGrowth: number;
  imageCount: number;
  imageCountGrowth: number;
  codeCount: number;
  codeCountGrowth: number;
}

export default defineComponent({
  components: {
    Icon,
  },
  props: {
    metrics: {
      type: Object as PropType<DatasetMetrics>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    // 获取页面id，优先用路由参数
    const pageId = computed(() => {
      return route.params.id?.toString() || '1';
    });
    // 格式化增长率
    const formatGrowth = (growth: number): string => {
      const absGrowth = Math.abs(growth);
      return `${absGrowth.toFixed(1)}%`;
    };
    return {
      formatGrowth,
      pageId,
    };
  },
});
</script>

<style lang="less" scoped>
.dataset-header {
  position: fixed;
  top: 10px;
  left: 400px;
  padding: 8px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  flex-direction: row;
  width: auto;

  .dataset-title {
    margin-right: 40px;
    display: flex;
    align-items: center;
    h1 {
      font-size: 20px;
      font-weight: 500;
      color: #333;
      margin: 0;
      white-space: nowrap;
    }
  }

  .dataset-metrics {
    display: flex;
    flex-direction: row;
    gap: 40px;
    width: auto;

    .metrics-row {
      display: flex;
      flex-direction: row;
      gap: 40px;
      width: auto;
    }

    .metric-item {
      display: flex;
      align-items: center;

      .metric-icon {
        font-size: 24px;
        color: @primary-color;
        margin-right: 12px;
      }

      .metric-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;

        .metric-label {
          position: relative;
          top: 1px;
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
            position: relative;
            top: 1px;
            font-size: 14px;
            color: #333;
            margin-left: 8px;
            display: flex;
            align-items: center;

            &.positive {
              color: #f5222d;
            }

            .anticon {
              margin-left: 4px;
            }

            span {
              display: inline-block;
              margin-left: 4px;
              margin-bottom: 1px;
            }
          }
        }
      }
    }
  }
}
</style>
