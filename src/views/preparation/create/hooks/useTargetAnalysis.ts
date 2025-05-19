import { reactive, ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";

export const useTargetAnalysis = () => {
  // 雷达图相关
  const radarChartRef = ref<HTMLElement | null>(null);
  let radarChart: echarts.ECharts | null = null;

  // 靶点相关
  const targetData = reactive({
    configDiversity: 60,
    dataVolume: 45,
    chartTypeBalance: 75,
  });

  const selectedTargetKey = ref("configDiversity");

  // 选择靶点
  const selectTarget = (key: string) => {
    selectedTargetKey.value = key;
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
      value: [40, 75, 70, 30, 85],
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

  // 修改算子数据到雷达图，更新优化数据而不添加新记录
  const addOperatorData = (operatorName: string) => {
    // 随机生成5个指标数据，在原有基础上有所改善
    const baseData = radarDataSeries[0].value;
    const newData = baseData.map((val) => {
      // 在原有基础上随机增加0-15的值，最高不超过100
      const improvement = Math.floor(Math.random() * 15);
      return Math.min(100, val + improvement);
    });

    // 生成一个随机颜色
    const hue = Math.floor(Math.random() * 360);
    const color = `hsla(${hue}, 70%, 50%, 1)`;
    const areaColor = `hsla(${hue}, 70%, 50%, 0.2)`;

    // 如果已经有优化后的数据，则更新它；否则，添加新数据
    if (radarDataSeries.length > 1) {
      // 更新现有的优化数据
      radarDataSeries[1].name = `${operatorName}优化后`;
      radarDataSeries[1].value = newData;
      radarDataSeries[1].itemStyle.color = color;
      radarDataSeries[1].lineStyle.color = color;
      radarDataSeries[1].areaStyle.color = areaColor;
    } else {
      // 添加新的优化数据
      radarDataSeries.push({
        name: `${operatorName}优化后`,
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
          { name: "数据对齐", max: 100 },
          { name: "数据重复性", max: 100 },
          { name: "多样均衡性", max: 100 },
          { name: "代码质量", max: 100 },
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
  };
};
