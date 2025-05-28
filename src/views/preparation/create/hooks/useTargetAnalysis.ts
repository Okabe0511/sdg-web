import { reactive, ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";

// 基于日志文件中的实际评估数据更新雷达图数据
const radarDataList = [
  // 初始评估数据
  [40.44, 83.53, 75.17, 31.98, 92.31], // [数据量, 数据对齐, 数据重复性, 多样均衡性, 代码质量]
  // 配置项修复算子后的评估数据
  [40.44, 83.53, 75.14, 57.25, 92.75],
  // 语法修复算子后的评估数据
  [50.26, 82.03, 75.46, 59.72, 91.11],
  // 配置项多样性增强算子后的评估数据
  [50.26, 82.88, 76.1, 61.41, 90.3],
  // 代码扰动算子后的评估数据
  [100.0, 62.94, 64.5, 61.68, 93.77],
  // 基于代码生成图像算子后的评估数据
  [100.0, 65.11, 71.28, 61.68, 93.77],
];

export const useTargetAnalysis = () => {
  // 雷达图相关
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
        configDiversity: 70.02,
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
      value: [40.44, 78.8, 70, 33.55, 89.13],
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

    // 生成一个随机颜色
    const hue = 275;
    const color = `hsla(${hue}, 70%, 50%, 1)`;
    const areaColor = `hsla(${hue}, 70%, 50%, 0.2)`;

    // 如果已经有优化后的数据，则更新它；否则，添加新数据
    if (radarDataSeries.length > 1) {
      // 更新现有的优化数据
      radarDataSeries[1].name = `当前数据`;
      radarDataSeries[1].value = newData;
      radarDataSeries[1].itemStyle.color = color;
      radarDataSeries[1].lineStyle.color = color;
      radarDataSeries[1].areaStyle.color = areaColor;
    } else {
      // 添加新的优化数据
      radarDataSeries.push({
        name: `当前数据`,
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
    }

    // 更新图表
    if (radarChart) {
      updateRadarChart();
    }
  };

  // 新增一个方法用于工作流完成后一次性更新靶点数据
  const updateFinalTargetData = () => {
    // 一次性更新为指定的固定值
    updateTargetData("configDiversity", 20);
    updateTargetData("dataVolume", 0);
    updateTargetData("chartTypeBalance", 30);

    // 更新图表
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
