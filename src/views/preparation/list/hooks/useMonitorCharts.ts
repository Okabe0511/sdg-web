import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import { getMonitorData } from "/@/serve/api/preparation";
import { message } from "ant-design-vue";

// 监控数据类型定义
export interface StorageNode {
  online: number;
  offline: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

// CapacityItem 接口，max 表示实际总容量 (GB)，value 表示已用容量 (GB)
export interface CapacityItem {
  name: string;
  value: number;
  max: number;
}

export interface MonitorData {
  storageNodes: StorageNode;
  storageObjects: number;
  objectTypeDistribution: ChartDataItem[];
  storageCapacity: CapacityItem[];
}

/**
 * 监控图表相关钩子函数
 * @returns 监控图表相关的状态和方法
 */
export const useMonitorCharts = () => {
  // 为图表容器创建 ref
  const pieChartRef = ref<HTMLElement | null>(null);
  const barChartRef = ref<HTMLElement | null>(null);

  // 存储图表实例
  let pieChart: echarts.ECharts | null = null;
  let barChart: echarts.ECharts | null = null;

  // 监控数据
  const monitorData = reactive<MonitorData>({
    storageNodes: {
      online: 0,
      offline: 0,
    },
    storageObjects: 0,
    objectTypeDistribution: [],
    storageCapacity: [],
  });

  const loading = ref(false);

  // 获取监控数据
  const fetchMonitorData = async () => {
    loading.value = true;
    try {
      const res = await getMonitorData();
      Object.assign(monitorData, res.data);

      // 更新图表
      initPieChart();
      initBarChart();
    } catch (error) {
      console.error("获取监控数据失败", error);
      message.error("获取监控数据失败");
    } finally {
      loading.value = false;
    }
  };

  // 初始化饼图
  const initPieChart = () => {
    if (!pieChartRef.value || monitorData.objectTypeDistribution.length === 0)
      return;

    if (!pieChart) {
      pieChart = echarts.init(pieChartRef.value);
    }

    pieChart.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        data: monitorData.objectTypeDistribution.map((item) => item.name),
      },
      grid: {
        left: "5%",
        right: "30%",
        top: "10%",
        bottom: "10%",
        containLabel: true,
      },
      series: [
        {
          name: "存储对象类型",
          type: "pie",
          radius: ["0", "65%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "14",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: monitorData.objectTypeDistribution,
        },
      ],
    });
  };

  // 初始化柱状图
  const initBarChart = () => {
    if (!barChartRef.value || monitorData.storageCapacity.length === 0) return;

    // 计算每个节点的剩余容量
    const remainingCapacity = monitorData.storageCapacity.map((item) => ({
      name: item.name,
      value: item.max - item.value,
    }));

    // 为图表计算最大容量值，用于设置坐标轴范围
    const maxCapacity = Math.max(
      ...monitorData.storageCapacity.map((item) => item.max)
    );

    if (!barChart) {
      barChart = echarts.init(barChartRef.value);
    }

    barChart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          const used = params[0];
          const remaining = params[1];
          return `${used.name}<br/>${used.seriesName}: ${used.value} GB<br/>
                  ${remaining.seriesName}: ${remaining.value} GB<br/>
                  总容量: ${used.value + remaining.value} GB`;
        },
      },
      legend: {
        data: ["已用容量", "可用容量"],
        top: 0,
        left: "center",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "30px",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        max: maxCapacity * 1.05,
        axisLabel: {
          formatter: "{value} GB",
        },
      },
      yAxis: {
        type: "category",
        data: monitorData.storageCapacity.map((item) => item.name),
        axisLabel: {
          margin: 15,
        },
      },
      series: [
        {
          name: "已用容量",
          type: "bar",
          stack: "total",
          data: monitorData.storageCapacity.map((item) => item.value),
          itemStyle: {
            color: "#1890ff",
          },
          label: {
            show: false,
          },
          barWidth: "60%",
        },
        {
          name: "可用容量",
          type: "bar",
          stack: "total",
          data: remainingCapacity.map((item) => item.value),
          itemStyle: {
            color: "rgba(0, 195, 206, 0.3)",
          },
          label: {
            show: false,
          },
        },
      ],
    });

    // 设置容器样式以确保图表能够完全显示
    if (barChartRef.value) {
      barChartRef.value.style.height = `${Math.max(
        200,
        monitorData.storageCapacity.length * 40
      )}px`;
      barChart.resize();
    }
  };

  // 处理窗口大小变化
  const handleResize = () => {
    pieChart?.resize();
    barChart?.resize();
  };

  // 初始化图表
  onMounted(() => {
    fetchMonitorData();
    window.addEventListener("resize", handleResize);
  });

  // 组件卸载时清理资源
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    pieChart?.dispose();
    barChart?.dispose();
  });

  return {
    pieChartRef,
    barChartRef,
    monitorData,
    loading,
    fetchMonitorData,
  };
};
