import * as echarts from "echarts/core";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getAnalysisHistogramData } from "/@/serve/api/analysisData";
// 需要引入ecStat库
import * as ecStat from "echarts-stat";

export const useHistogramCharts = () => {
  const histogramChartsRef = ref<HTMLElement[]>([]);
  const charts: echarts.ECharts[] = [];
  const histogramData = ref<{
    histogramData: Array<{
      name: string;
      data: number[];
    }>;
    intervals: number[];
  }>();

  // 加载分析数据
  const loadHistogramData = async () => {
    try {
      const response = await getAnalysisHistogramData();
      histogramData.value = response.data;
      return true;
    } catch (error) {
      console.error("加载分析数据失败", error);
      return false;
    }
  };

  // 初始化所有直方图
  const initHistogramCharts = () => {
    if (!histogramData.value || histogramChartsRef.value.length === 0) return;

    // 先清除之前的图表
    disposeCharts();

    // 创建新的图表
    histogramChartsRef.value.forEach((chartDom, index) => {
      if (!chartDom) return;

      const dataItem = histogramData.value!.histogramData[index];
      const intervals = histogramData.value!.intervals;

      // 创建图表实例
      const chart = echarts.init(chartDom);
      charts.push(chart);

      // 数据聚合：将10个区间合并为5个区间
      const aggregatedData = [];
      // 数据聚合，两两合并
      for (let i = 0; i < dataItem.data.length; i += 2) {
        const x0 = i === 0 ? 0 : intervals[i - 1];
        const x1 = i + 2 < intervals.length ? intervals[i + 1] : 100;
        const value =
          dataItem.data[i] +
          (i + 1 < dataItem.data.length ? dataItem.data[i + 1] : 0);
        aggregatedData.push([x0, x1, value]);
      }

      // 设置刻度间隔为20（0-100分5个刻度）
      const interval = 20;

      // 自定义渲染函数
      function renderItem(params: any, api: any) {
        const yValue = api.value(2);
        const start = api.coord([api.value(0), yValue]);
        const size = api.size([api.value(1) - api.value(0), yValue]);
        const style = api.style();

        return {
          type: "rect",
          shape: {
            x: start[0] + 1,
            y: start[1],
            width: size[0] - 2,
            height: size[1],
          },
          style: style,
        };
      }

      // 设置直方图配置
      chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: function (params: any) {
            const range = `[${params.value[0]}, ${params.value[1]}]`;
            return `${range}: ${params.value[2]}`;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "1%",
          top: "18%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          min: 0,
          max: 100,
          interval: interval,
          axisLabel: {
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          name: "频数",
          nameTextStyle: {
            fontSize: 10,
            padding: [0, 0, 0, 15],
          },
          axisLabel: {
            fontSize: 10,
          },
        },
        series: [
          {
            name: dataItem.name,
            type: "custom",
            renderItem: renderItem,
            itemStyle: {
              color: "#1890ff", // 统一使用蓝色
            },
            label: {
              show: false, // 修改为false，不显示柱子上方的数值标签
              position: "top",
              fontSize: 10,
            },
            encode: {
              x: [0, 1],
              y: 2,
              tooltip: 2,
              label: 2,
            },
            data: aggregatedData,
          },
        ],
        title: {
          text: getMetricName(dataItem.name),
          textStyle: {
            fontSize: 12,
            fontWeight: "normal",
          },
          left: "center",
        },
      });
    });
  };

  // 根据指标获取颜色
  const getColorByMetric = (metricKey: string): string => {
    const colorMap: Record<string, string> = {
      syntax_score: "#1890ff",
      configuration_complete_score: "#2fc25b",
      ncc_score: "#facc14",
      distance: "#f04864",
      code_duplicate_score: "#8543e0",
      image_duplicate_score: "#13c2c2",
      missing_data: "#ff7a45",
    };

    return colorMap[metricKey] || "#1890ff";
  };

  // 获取指标名称
  const getMetricName = (metricKey: string): string => {
    const nameMap: Record<string, string> = {
      syntax_score: "语法评分",
      configuration_complete_score: "配置项完整性评分",
      ncc_score: "NCC评分",
      distance: "距离评分",
      code_duplicate_score: "代码重复评分",
      image_duplicate_score: "图像重复评分",
      missing_data: "缺失数据评分",
    };

    return nameMap[metricKey] || metricKey;
  };

  // 监听窗口大小变化，重新调整图表大小
  const handleResize = () => {
    charts.forEach((chart) => {
      if (chart) {
        chart.resize();
      }
    });
  };

  // 销毁所有图表实例
  const disposeCharts = () => {
    charts.forEach((chart) => {
      if (chart) {
        chart.dispose();
      }
    });
    charts.length = 0;
  };

  // 设置图表容器引用
  const setChartRefs = (refs: HTMLElement[]) => {
    histogramChartsRef.value = refs;
  };

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    disposeCharts();
  });

  return {
    histogramData,
    histogramChartsRef,
    setChartRefs,
    loadHistogramData,
    initHistogramCharts,
    disposeCharts,
    handleResize,
  };
};
