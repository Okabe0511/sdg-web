<template>
  <div class="dataset-header">
    <div class="dataset-title">
      <h1>{{ getTaskTitle() }}</h1>
    </div>
    <div class="dataset-metrics">
      <div class="metrics-row">
        <div 
          v-for="(item, index) in getDatasetItems()" 
          :key="index"
          class="metric-item"
        >
          <div class="metric-icon">
            <Icon :name="getIconName(item.dataType)" />
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ item.dataType ? item.dataType + '数量' : '数据对数量' }}</div>
            <div class="metric-value">
              {{ getMetricValue(item.key) }}
              <span
                class="growth-rate"
                :class="{ positive: getGrowthValue(item.key) > 0 }"
              >
                {{ formatGrowth(getGrowthValue(item.key)) }}
                <Icon
                  v-if="getGrowthValue(item.key) !== 0"
                  :name="getGrowthValue(item.key) > 0 ? 'arrow-up' : 'arrow-down'"
                />
                <span v-if="getGrowthValue(item.key) === 0">-</span>
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
import preparationData from "/@/mock/preparationData.json";
import datasetInfo from "/@/mock/datasetInfo.json";

export interface DatasetMetrics {
  dataPairs: number;
  dataPairsGrowth: number;
  imageCount: number;
  imageCountGrowth: number;
  codeCount: number;
  codeCountGrowth: number;
  textCount: number;
  textCountGrowth: number;
  audioCount: number;
  audioCountGrowth: number;
  relationCount: number;
  relationCountGrowth: number;
  adaptiveCount: number;
  adaptiveCountGrowth: number;
  graphCount: number;
  graphCountGrowth: number;
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
      return route.params.key?.toString() || 'internet';
    });

    // 获取任务标题
    const getTaskTitle = (): string => {
      const task = preparationData.tasks.find(t => t.id === pageId.value);
      if (!task) return '未知任务';
      
      // 获取数据类型信息
      const dataTypes = datasetInfo[pageId.value as keyof typeof datasetInfo]
        ?.filter(item => item.dataType)
        .map(item => item.dataType);
      
      if (dataTypes && dataTypes.length > 0) {
        const uniqueDataTypes = [...new Set(dataTypes)]; // 去重
        return `${task.name}（${uniqueDataTypes.join('+')}）`;
      }
      
      return task.name;
    };
    
    // 获取数据集项目
    const getDatasetItems = () => {
      const items = datasetInfo[pageId.value as keyof typeof datasetInfo];
      return items || [];
    };

    // 获取图标名称
    const getIconName = (dataType?: string): string => {
      const iconMap: { [key: string]: string } = {
        '图像': 'image',
        '程序代码': 'code',
        '关系表': 'data',
        '文本': 'text',
        '语音': 'audio',
        '适配': 'adaptive',
        '图数据': 'graph'
      };
      return iconMap[dataType || ''] || 'data';
    };

    // 获取指标值
    const getMetricValue = (key: string): number => {
      const metricMap: { [key: string]: keyof DatasetMetrics } = {
        'dataPairs': 'dataPairs',
        'imageCount': 'imageCount',
        'codeCount': 'codeCount',
        'textCount': 'textCount',
        'audioCount': 'audioCount',
        'relationCount': 'relationCount',
        'adaptiveCount': 'adaptiveCount',
        'graphCount': 'graphCount'
      };
      const metricKey = metricMap[key];
      return metricKey ? props.metrics[metricKey] : 0;
    };

    // 获取增长值
    const getGrowthValue = (key: string): number => {
      const growthMap: { [key: string]: keyof DatasetMetrics } = {
        'dataPairs': 'dataPairsGrowth',
        'imageCount': 'imageCountGrowth',
        'codeCount': 'codeCountGrowth',
        'textCount': 'textCountGrowth',
        'audioCount': 'audioCountGrowth',
        'relationCount': 'relationCountGrowth',
        'adaptiveCount': 'adaptiveCountGrowth',
        'graphCount': 'graphCountGrowth'
      };
      const growthKey = growthMap[key];
      return growthKey ? props.metrics[growthKey] : 0;
    };
    
    // 格式化增长率
    const formatGrowth = (growth: number): string => {
      const absGrowth = Math.abs(growth);
      return `${absGrowth.toFixed(1)}%`;
    };
    return {
      formatGrowth,
      pageId,
      getTaskTitle,
      getDatasetItems,
      getIconName,
      getMetricValue,
      getGrowthValue,
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
