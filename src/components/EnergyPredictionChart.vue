<template>
  <div class="energy-chart-full">
    <div ref="chartRef" class="energy-chart-inner"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import before from "/@/mock/before.json";
import after from "/@/mock/after.json";
import trueVals from "/@/mock/true.json";

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
  const option = {
    title: { text: '电价预测任务验证', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['基准数据模型预测', '制备后数据模型预测', '真实数据'], top: 30 },
    grid: { left: 40, right: 40, top: 80, bottom: 40 },
    xAxis: { type: 'category', data: trueVals.map((_: number, i: number) => i), show: false },
    yAxis: { type: 'value', min: -200, max: 1000 },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 40,
        xAxisIndex: 0,
        zoomLock: true // 只允许拖动，不允许缩放
      },
      {
        type: 'inside',
        realtime: true,
        start: 0,
        end: 40,
        xAxisIndex: 0,
      }
    ],
    series: [
      { 
        name: '基准数据模型预测', 
        type: 'line', 
        data: before, 
        color: '#fabed4', 
        smooth: true, 
        showSymbol: false,
        lineStyle: { 
          width: 1 
        } 
      },
      { 
        name: '制备后数据模型预测', 
        type: 'line', 
        data: after, 
        color: '#42d4f4', 
        smooth: true, 
        showSymbol: false,
        lineStyle: { 
          width: 1 
        } 
      },
      { 
        name: '真实数据', 
        type: 'line', 
        data: trueVals, 
        color: '#f58231', 
        smooth: true, 
        showSymbol: false,
        lineStyle: { 
          width: 1 
        } 
      }
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
