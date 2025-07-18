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
import mockData from '/@/mock/eisenhowerRawData.json';
import { useRoute } from 'vue-router';

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
]);

// 定义数据类型
interface DataItem {
  secondary: string;
  importance: number;
  problem: number;
  urgency: number;
}

interface EisenhowerData {
  main: {
    [key: string]: DataItem[];
    default: DataItem[];
  };
}

export const useEisenhowerMatrix = () => {
  const route = useRoute();
  let chartInstance: echarts.ECharts | null = null;
  const chartLoaded = ref(false);
  
  // 获取数据函数（根据环境返回mock数据或真实数据）
  const getData = async (): Promise<DataItem[]> => {
    const taskId = route.params.id; // 直接从路由获取taskId
    if (import.meta.env.DEV) {
      // 开发环境使用mock数据
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
      
      const eisenhowerData = mockData as EisenhowerData;
      
      // 根据taskId返回对应的数据集
      if (eisenhowerData.main[taskId as string]) {
        return eisenhowerData.main[taskId as string];
      }
      return eisenhowerData.main.default;
    } else {
      // 生产环境调用真实API
      // 这里应该是你的API调用逻辑
      // 例如: const response = await fetch(`/api/eisenhower/${taskId}`);
      // return response.data;
      
      // 暂时用默认数据代替
      return (mockData as EisenhowerData).main.default;
    }
  };

  // 初始化函数（接受容器ID作为参数）
  const initEisenhowerMatrix = async (containerId: string = "eisenhower-matrix") => {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;

    chartInstance = echarts.init(chartDom);
    
    // 获取数据
    const data = await getData();

    const option = {
       grid: {
         // 右边距
    bottom: 120,    // 下边距（原可能为默认值，显式设置更小的值）
  },
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
        data: ['时间粒度覆盖率', '季节性强度', '趋势强度', '主频强度', '样本均衡性','标签一致性','时序平稳性'
          ,'时间特征完备度','领域知识完备性','领域知识多样性','特征独立性','样本均衡性'
        ],
        textStyle: { fontSize: 16 },
        itemGap: 15,
        bottom: 10,
         padding: [50, 0, 0, 0],  
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
          name: '时间粒度覆盖率',
          type: 'scatter',
          data: data.filter(item => item.secondary === '时间粒度覆盖率').map(item => ({
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
          name: '季节性强度',
          type: 'scatter',
          data: data.filter(item => item.secondary === '季节性强度').map(item => ({
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
          name: '趋势强度',
          type: 'scatter',
          data: data.filter(item => item.secondary === '趋势强度').map(item => ({
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
          name: '主频强度',
          type: 'scatter',
          data: data.filter(item => item.secondary === '主频强度').map(item => ({
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
          name: '样本均衡性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '样本均衡性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#911eb4' }
        },
        {
          name: '标签一致性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '标签一致性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#006010ff' }
        },
        {
          name: '时序平稳性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '时序平稳性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#ec70d1ff' }
        },
        {
          name: '时间特征完备度',
          type: 'scatter',
          data: data.filter(item => item.secondary === '时间特征完备度').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#4a85c4ff' }
        },
        {
          name: '领域知识完备性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '领域知识完备性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#6bd7b8ff' }
        },
        {
          name: '领域知识多样性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '领域知识多样性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#ee6565ff' }
        },
         {
          name: '特征独立性',
          type: 'scatter',
          data: data.filter(item => item.secondary === '特征独立性').map(item => ({
            value: [item.importance * 2 - 1, item.problem * 2 - 1],
            name: item.secondary,
            importance: item.importance,
            problem: item.problem,
            urgency: item.urgency,
            symbolSize: item.urgency * 200 + 10
          })),
          itemStyle: { color: '#070009ff' }
        },
      ] 
    };

    chartInstance.setOption(option);
    chartLoaded.value = true;
    return chartInstance;
  };

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