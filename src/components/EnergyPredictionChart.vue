<template>
  <div class="energy-chart-full">
    <div ref="chartRef" class="energy-chart-inner"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  width: { type: Number, default: 900 },
  height: { type: Number, default: 320 }
});

const chartOption = ref({});
const chartRef = ref<HTMLElement | null>(null);

async function fetchJson(path: string) {
  const res = await fetch(path);
  return await res.json();
}

onMounted(async () => {
  // json文件已由npy_to_json.py生成并放在public目录
  const before = await fetchJson('/public/before.json');
  const after = await fetchJson('/public/after.json');
  const trueVals = await fetchJson('/public/true.json');
  const option = {
    title: { text: 'energy任务预测结果', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['BEFORE', 'AFTER', 'TRUE'], top: 30 },
    grid: { left: 40, right: 40, top: 80, bottom: 40 },
    xAxis: { type: 'category', data: trueVals.map((_: number, i: number) => i) },
    yAxis: { type: 'value' },
    series: [
      { name: 'BEFORE', type: 'line', data: before, color: '#fabed4', smooth: true, lineStyle: { width: 1 } },
      { name: 'AFTER', type: 'line', data: after, color: '#42d4f4', smooth: true, lineStyle: { width: 1 } },
      { name: 'TRUE', type: 'line', data: trueVals, color: '#f58231', smooth: true, lineStyle: { width: 1 } }
    ]
  };
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    chart.setOption(option);
  }
});
</script>

<style scoped>


.energy-chart-full {
  width: 100%;
  height: 100%;
  min-height: 800px;
  flex: 1 1 auto;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

.energy-chart-inner {
  width: 100%;
  height: 100%;
}
</style>
