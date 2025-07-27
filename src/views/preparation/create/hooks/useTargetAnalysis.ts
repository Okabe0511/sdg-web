import { reactive, ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";
import { useRoute } from 'vue-router';
import radardata from '/@/mock/radarData.json';
import finalTargetData from '/@/mock/targetData.json';

let radarDataList = radardata.internet;

export const useTargetAnalysis = () => {
  // 雷达图相关
  const route = useRoute();
  const taskId = route.params.id;
  if(taskId === "1") {
    radarDataList = radardata.internet;
  }
  if(taskId === "2") {
    radarDataList = radardata.energy;
  }
  const radarChartRef = ref<HTMLElement | null>(null);
  let radarChart: echarts.ECharts | null = null;

  // 靶点相关
  const targetData: {
    original: Record<string, number>;
    current: Record<string, number>;
  } = // 使用Record类型来定义靶点数据的结构
    reactive({
      original: {
        configDiversity: 70.02,
        dataVolume: 64.63,
        chartTypeBalance: 53.23,
      },
      current: {
        configDiversity: 99.02,
        dataVolume: 64.63,
        chartTypeBalance: 53.23,
      },
    });

  const selectedTargetKey = ref("configDiversity");

  // 选择靶点
  const selectTarget = (key: string) => {
    selectedTargetKey.value = key;
  };

  // 更新靶点数据
  const updateTargetData = (key: string, value: number) => {
    // 确保不超过100
    targetData.current[key] = Math.min(100, value);
  };

  // 获取指标点在靶图上的位置
  const getIndicatorStyle = (key: string, value: number) => {
    // 根据三个指标的位置，设置不同的角度
    const angles = {
      configDiversity: 30, // 右上
      dataVolume: 150, // 左上
      chartTypeBalance: 270, // 下方
    };

    // 计算离靶心的距离 (100 - value) / 100 * 40 + 10
    // 分数越高越靠近靶心，最低10%，最高50%
    const distancePercent = ((100 - value) / 100) * 40 + 10;

    // 转换为角度和距离
    const angle = angles[key as keyof typeof angles];
    const radians = (angle * Math.PI) / 180;
    const x = 50 + Math.cos(radians) * distancePercent;
    const y = 50 + Math.sin(radians) * distancePercent;

    return {
      left: `${x}%`,
      top: `${y}%`,
    };
  };

  // 雷达图数据数组，用于存储多组数据
  const radarDataSeries = reactive<
    Array<{
      name: string;
      value: number[];
      itemStyle: any;
      lineStyle: any;
      areaStyle: any;
    }>
  >([
    {
      name: "原始数据",
      value:(()=>{
        if(taskId === "1") {
          return [40.44, 83.53, 75.17, 31.98, 92.31];
        } else if(taskId === "2") {
          return [43.44, 83.3, 75.17, 31.98, 92.31];
        }
        return [10, 20, 30, 20, 30]; // 默认值
      })(),
      itemStyle: {
        color: "rgba(0, 155, 164, 1)",
      },
      lineStyle: {
        color: "rgba(0, 155, 164, 1)",
      },
      areaStyle: {
        color: "rgba(0, 155, 164, 0.2)",
      },
    },
  ]);

  // 修改算子数据到雷达图，同时也更新靶点数据
  const addOperatorData = (operatorName: string, stepIndex: number = 0) => {
    // 使用预定义的评估数据，而不是随机生成
    const currentStepIndex = Math.min(stepIndex, radarDataList.length - 1);
    const newData = radarDataList[currentStepIndex];

    // 基于步骤索引生成不同的颜色
    // 使用偏暗色系的颜色
    const colorIndex = stepIndex % darkColors.length;
    const color = darkColors[colorIndex];
    const areaColor = `${color}33`; // 添加透明度

    // 保存每个算子的数据，用 v1/v2/... 命名
    const seriesName = `v${stepIndex + 1}`;

    // 添加新的数据系列，而不是替换
    radarDataSeries.push({
      name: seriesName,
      value: newData,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
      },
      areaStyle: {
        color: areaColor,
      },
    });

    // 更新图表
    if (radarChart) {
      updateRadarChart();
    }
  };

  // 新增一个方法用于工作流完成后一次性更新靶点数据
const updateFinalTargetData = () => {
  // 根据任务ID选择最终数据
  let finalData;
  if (taskId === "1") {
    finalData = finalTargetData.FinalData1;
  } else if (taskId === "2") {
    finalData = finalTargetData.FinalData2;
  } else {
    finalData = finalTargetData.FinalDataDefault;
  }

  // 更新靶点数据
  updateTargetData("configDiversity", finalData.configDiversity);
  updateTargetData("dataVolume", finalData.dataVolume);
  updateTargetData("chartTypeBalance", finalData.chartTypeBalance);

    // 不再添加最终结果的数据系列
    // 仅更新图表
    if (radarChart) {
      updateRadarChart();
    }
  };

  // 更新雷达图
  const updateRadarChart = () => {
    if (!radarChart || !radarChartRef.value) return;

    const option = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        data: radarDataSeries.map((item) => item.name),
        selectedMode: true,
        bottom: 0,
        left: "center",
        padding: [10, 10],
        textStyle: {
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 9,
      },
      radar: {
        indicator: [
          { name: "数据量", max: 100 },
          { name: "数据表示质量", max: 100 },
          { name: "数据冗余", max: 100 },
          { name: "数据上下文质量", max: 100 },
          { name: "数据内在质量", max: 100 },
        ],
        triggerEvent: true,
        axisName: {
          color: "#666",
          fontSize: 12,
          fontWeight: 500,
        },
        center: ["50%", "50%"],
        splitArea: {
          areaStyle: {
            color: [
              "rgba(0, 155, 164, 0.02)",
              "rgba(0, 155, 164, 0.05)",
              "rgba(0, 155, 164, 0.1)",
              "rgba(0, 155, 164, 0.15)",
            ],
          },
        },
      },
      series: [
        {
          name: "数据质量评估",
          type: "radar",
          data: radarDataSeries,
        },
      ],
    };

    radarChart.setOption(option);
  };

  // 初始化雷达图 - 修改为调用updateRadarChart
  const initRadarChart = () => {
    if (!radarChartRef.value) return;

    if (!radarChart) {
      radarChart = echarts.init(radarChartRef.value);
    }

    updateRadarChart();
  };

  // 清理图表资源
  const cleanupChart = () => {
    if (radarChart) {
      radarChart.dispose();
      radarChart = null;
    }
  };

  // 组件卸载时清理资源
  onBeforeUnmount(() => {
    cleanupChart();
  });

  return {
    radarChartRef,
    targetData,
    selectedTargetKey,
    selectTarget,
    getIndicatorStyle,
    initRadarChart,
    cleanupChart,
    addOperatorData, // 导出新添加的方法
    radarDataSeries, // 导出数据系列
    updateFinalTargetData, // 导出新增的方法
  };
};

// 在文件开头附近添加一个偏暗色系的颜色数组
const darkColors = [
  "#5B8FF9", // 深蓝
  "#5AD8A6", // 墨绿
  "#5D7092", // 灰蓝
  "#F6BD16", // 金黄
  "#E8684A", // 砖红
  "#6DC8EC", // 青蓝
  "#9270CA", // 紫色
  "#FF9D4D", // 橙色
  "#269A99", // 深青
  "#FF99C3", // 粉红
];
