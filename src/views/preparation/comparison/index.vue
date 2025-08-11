<template>
  <div class="training-comparison-container">
    <template v-if="$route.params.id === '2'">
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
import { defineComponent, onMounted, ref } from "vue";
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
    const chartHeight = ref(window.innerHeight - 80);
    window.addEventListener('resize', () => {
      chartWidth.value = window.innerWidth;
      chartHeight.value = window.innerHeight - 80;
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
      if (taskId === '1' || taskId === '2') {
        await loadChartData(taskId);
      }
    });
    return {
      chartWidth,
      chartHeight,
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

.energy-chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  height: calc(90vh - 0px);
  display: flex;
  align-items: center;
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
