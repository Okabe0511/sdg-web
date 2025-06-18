<template>
  <div class="training-comparison-container">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useRoute } from "vue-router";
import LineChart from "/@/components/charts/LineChart.vue";
import { useComparisonCharts } from "./hooks/useComparisonCharts";

export default defineComponent({
  name: "TrainingComparison",
  components: {
    LineChart,
  },
  setup() {
    const route = useRoute();

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
      if (taskId) {
        await loadChartData(taskId);
      }
    });

    return {
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
