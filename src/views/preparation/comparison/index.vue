<template>
  <div class="training-comparison-container">
    <template v-if="$route.params.id === '2' || $route.params.id === '3'">
      <!-- 制备前后对比表格 -->
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>相似度指标</th>
              <th>数据制备前</th>
              <th>数据制备后</th>
              <th>变化幅度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metricsData" :key="metric.key">
              <td>{{ metric.label }}</td>
              <td>{{ typeof metric.previousValue === 'number' && metric.previousValue < 10 ? metric.previousValue.toFixed(4) : metric.previousValue }}</td>
              <td>{{ typeof metric.value === 'number' && metric.value < 10 ? metric.value.toFixed(4) : metric.value }}</td>
              <td :class="{ 'positive': metric.changePercent > 0, 'negative': metric.changePercent < 0 }">
                {{ metric.changePercent > 0 ? '+' : '' }}{{ metric.changePercent.toFixed(2) }}%
                <span class="arrow">{{ metric.changePercent > 0 ? '↑' : '↓' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="energy-chart-container">
        <div class="energy-chart-content">
          <EnergyPredictionChart :width="chartWidth" :height="chartHeight" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="task-module">
        <h2 class="task-title">任务1:</h2>
        <p class="task-description">
          评估数据质量提升对ECharts代码生成多模态模型训练性能的影响。以初始数据集为基线，对其进行质量提升操作，形成优化后的数据集，比较二者在模型训练过程中的表现差异。
        </p>
        <div class="charts-container">
          <div class="chart">
            <LineChart
              :chartData="task1Chart1Data"
              :chartOptions="task1Chart1Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task1Chart2Data"
              :chartOptions="task1Chart2Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task1Chart3Data"
              :chartOptions="task1Chart3Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task1Chart4Data"
              :chartOptions="task1Chart4Options"
            />
          </div>
        </div>
      </div>
      <div class="task-module">
        <h2 class="task-title">任务2:</h2>
        <p class="task-description">
          在保持初始数据集基础内容的前提下，通过多种数据增强策略扩展样本规模，构建数据集，研究大规模高多样性数据对模型性能的影响。
        </p>
        <div class="charts-container">
          <div class="chart">
            <LineChart
              :chartData="task2Chart1Data"
              :chartOptions="task2Chart1Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task2Chart2Data"
              :chartOptions="task2Chart2Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task2Chart3Data"
              :chartOptions="task2Chart3Options"
            />
          </div>
          <div class="chart">
            <LineChart
              :chartData="task2Chart4Data"
              :chartOptions="task2Chart4Options"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import LineChart from "/@/components/charts/LineChart.vue";
import { useComparisonCharts } from "./hooks/useComparisonCharts";
import EnergyPredictionChart from '/@/components/EnergyPredictionChart.vue';

export default defineComponent({
  name: "TrainingComparison",
  components: {
    LineChart,
    EnergyPredictionChart,
  },
  setup() {
    const route = useRoute();
    const chartWidth = ref(window.innerWidth);
    const chartHeight = ref(window.innerHeight - 200); // 减小图表高度，增加减去的值
    
    window.addEventListener('resize', () => {
      chartWidth.value = window.innerWidth;
      chartHeight.value = window.innerHeight - 200;
    });

    // 根据路由ID获取对应的指标数据
    const metricsData = computed(() => {
      const routeId = route.params.id as string;
      const dataTypeId = routeId === "3" ? "2" : routeId;
      
      if (dataTypeId === "2") {
        // Energy 数据集的相似度指标 - 制备前后对比
        return [
          {
            label: "余弦相似度",
            key: "cosine_similarity",
            value: 0.8286, // 数据制备后
            previousValue: 0.8096, // 数据制备前
            changePercent: ((0.8286 - 0.8096) / 0.8096) * 100
          },
          {
            label: "皮尔逊相关系数", 
            key: "pearson_correlation",
            value: 0.6600, // 数据制备后
            previousValue: 0.6222, // 数据制备前
            changePercent: ((0.6600 - 0.6222) / 0.6222) * 100
          },
          {
            label: "平均绝对误差",
            key: "mean_absolute_error", 
            value: 76.1520, // 数据制备后
            previousValue: 86.9353, // 数据制备前
            changePercent: ((76.1520 - 86.9353) / 86.9353) * 100
          }
        ];
      } else {
        // Internet 数据集的指标 (ID=1的情况下)
        return [
          {
            label: "数据对数量",
            key: "dataPairs", 
            value: 1305,
            previousValue: 640,
            changePercent: ((1305 - 640) / 640) * 100
          },
          {
            label: "图像数量",
            key: "imageCount",
            value: 1302,
            previousValue: 580,
            changePercent: ((1302 - 580) / 580) * 100
          },
          {
            label: "程序代码数量", 
            key: "codeCount",
            value: 1300,
            previousValue: 592,
            changePercent: ((1300 - 592) / 592) * 100
          }
        ];
      }
    });

    // 使用我们创建的钩子函数
    const {
      task1Chart1Data,
      task1Chart1Options,
      task1Chart2Data,
      task1Chart2Options,
      task1Chart3Data,
      task1Chart3Options,
      task1Chart4Data,
      task1Chart4Options,
      task2Chart1Data,
      task2Chart1Options,
      task2Chart2Data,
      task2Chart2Options,
      task2Chart3Data,
      task2Chart3Options,
      task2Chart4Data,
      task2Chart4Options,
      loadChartData,
    } = useComparisonCharts();
    
    onMounted(async () => {
      // 从路由参数获取任务ID并加载数据
      const taskId = route.params.id as string;
      
      // ID 映射函数：将 ID=3 映射到 ID=2
      const getDataTypeId = (id: string): string => {
        return id === "3" ? "2" : id;
      };

      const mappedId = getDataTypeId(taskId);
      if (mappedId === '1' || mappedId === '2') {
        await loadChartData(mappedId);
      }
    });
    
    return {
      chartWidth,
      chartHeight,
      metricsData,
      // 返回所有需要在模板中使用的数据和方法
      task1Chart1Data,
      task1Chart1Options,
      task1Chart2Data,
      task1Chart2Options,
      task1Chart3Data,
      task1Chart3Options,
      task1Chart4Data,
      task1Chart4Options,
      task2Chart1Data,
      task2Chart1Options,
      task2Chart2Data,
      task2Chart2Options,
      task2Chart3Data,
      task2Chart3Options,
      task2Chart4Data,
      task2Chart4Options,
    };
  },
});
</script>

<style scoped>
.training-comparison-container {
  padding: 20px;
  width: 100%;
}

/* 对比表格样式 */
.comparison-table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 20px; /* 从16px调大到20px */
}

.comparison-table th,
.comparison-table td {
  padding: 12px 16px;
  text-align: center;
  border: 1px solid #e8e8e8;
}

.comparison-table th {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.comparison-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.comparison-table tbody tr:hover {
  background-color: #f0f9ff;
}

.comparison-table td.positive {
  color: #67c23a;
  font-weight: 600;
}

.comparison-table td.negative {
  color: #f56c6c;
  font-weight: 600;
}

.arrow {
  font-size: 16px;
  font-weight: bold;
  margin-left: 4px;
}

.energy-chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 10px 20px 20px 20px; /* 减小上内边距从20px到10px */
  width: 100%;
  height: calc(96vh - 40px); /* 从98vh改为96vh */
  display: flex;
  align-items: flex-start; /* 改为顶部对齐，使图表向上移动 */
  justify-content: center;
}

.energy-chart-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.energy-chart-title {
  font-size: 20px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
}

.task-module {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.task-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.charts-container {
  display: flex;
  gap: 20px;
}

.chart {
  flex: 1;
  height: 360px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .charts-container {
    flex-direction: column;
  }

  .chart {
    height: 300px;
  }
}
</style>
