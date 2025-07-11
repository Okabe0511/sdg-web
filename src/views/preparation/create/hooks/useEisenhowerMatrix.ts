import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { Grid } from "ant-design-vue";

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
]);

export const useEisenhowerMatrix = () => {
  
  let chartInstance: echarts.ECharts | null = null;
  const chartLoaded = ref(false);

  // 内置数据（直接写在代码中）
  const RawData = [
    {
      primary: '数据量',
      secondary: '时间粒度覆盖率',
      importance: 0.3,
      problem: 0.8,
      urgency: 0.24
    },
    {
      primary: '数据量',
      secondary: '季节性强度',
      importance: 0.3,
      problem: 0.426,
      urgency: 0.128
    },
     {
      primary: '数据量',
      secondary: '趋势强度',
      importance: 0.05,
      problem: 0.426,
      urgency: 0.021
    },
     {
      primary: '数据量',
      secondary: '主频强度',
      importance: 0.25,
      problem: 0.256,
      urgency: 0.064
    },
     {
      primary: '数据量',
      secondary: '样本均衡性',
      importance: 0.1,
      problem: 0.118,
      urgency: 0.012
    },
    {
      primary: '数据内在质量',
      secondary: '标签一致性',
      importance: 0.1,
      problem: 0.07,
      urgency: 0.007
    },
    {
      primary: '数据表示质量',
      secondary: '时序平稳性',
      importance: 0.6,
      problem: 0.306,
      urgency: 0.183
    },
     {
      primary: '数据表示质量',
      secondary: '时间特征完备度',
      importance: 0.4,
      problem: 1,
      urgency: 0.4
    },
    {
      primary: '数据上下文质量',
      secondary: '领域知识完备性',
      importance: 0.7,
      problem: 0.708,
      urgency: 0.496
    },
     {
      primary: '数据上下文质量',
      secondary: '领域知识多样性',
      importance: 0.3,
      problem: 0.444,
      urgency: 0.133
    },
    {
      primary: '数据冗余',
      secondary: '特征独立性',
      importance: 0.6,
      problem: 0.272,
      urgency: 0.163
    },
    {
      primary: '数据冗余',
      secondary: '样本均衡性',
      importance: 0.4,
      problem: 0.118,
      urgency: 0.
    }
  ];

  // 初始化函数（现在只需要containerId参数）
  const initEisenhowerMatrix = (containerId: string = "main") => {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;

    chartInstance = echarts.init(chartDom);
    
    // 使用内置数据
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (param: any) {
          return param.data.name + '<br/>' +
            '重要性: ' + (param.data.importance * 100).toFixed(1) + '%<br/>' +
            '问题严重性: ' + (param.data.problem * 100).toFixed(1) + '%<br/>' +
            '紧急程度: ' + (param.data.urgency * 100).toFixed(1) + '%';
        }
      },
      legend: {
        data: ['数据量', '数据内在质量', '数据表示质量', '数据上下文质量', '数据冗余'],
        textStyle: { fontSize: 16 },
        itemGap: 15,
        bottom: 0,
        padding: [0, 0]
      },
     
      xAxis: {
        name: '重要性',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { fontSize: 16 },
        min: -1,
        max: 1,
        axisLabel: {
          formatter: function (value: number) {
            return (value * 100).toFixed(0) + '%';
          },
          fontSize: 14
        }
      },
      yAxis: {
        name: '问题严重性',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { fontSize: 16 },
        min: -1,  
        max: 1,
        axisLabel: {
          formatter: function (value: number) {
            return (value * 100).toFixed(0) + '%';
            
          },
          fontSize: 14
        }
      },
      series: [
        {
          name: '数据量',
          type: 'scatter',
          data: RawData.filter(item => item.primary === '数据量').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#e6194b' }
        },
         {
          name: '数据内在质量',
          type: 'scatter',
          data: RawData.filter(item => item.primary === '数据内在质量').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#3cb44b' }
        },
        {
          name: '数据表示质量',
          type: 'scatter',
          data: RawData.filter(item => item.primary === '数据表示质量').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#0082c8' }
        },
        {
          name: '数据上下文质量',
          type: 'scatter',
          data: RawData.filter(item => item.primary === '数据上下文质量').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#f58231' }
        },
        {
          name: '数据冗余',
          type: 'scatter',
          data: RawData.filter(item => item.primary === '数据冗余').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#911eb4' }
        },
      ]
    };

    chartInstance.setOption(option);
    chartLoaded.value = true;
    return chartInstance;
  };

  // 保留原有的窗口大小处理、资源清理等方法...
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  const disposeChart = () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  };

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    disposeChart();
  });

  return {
    chartLoaded,
    initEisenhowerMatrix,
    disposeChart,
    resizeChart: handleResize,
  };
};