import { ref, reactive, onMounted, onUnmounted } from "vue";
import { getData } from "/@/serve/api/comparisonResult";

/**
 * 图表数据接口
 */
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

/**
 * 图表配置类型
 */
export type ChartConfigType =
  | "task1-accuracy"
  | "task1-loss"
  | "task2-accuracy"
  | "task2-loss";

/**
 * 图表配置映射
 */
const CHART_CONFIG_MAP = {
  "task1-accuracy": {
    title: "Accuracy对比",
  },
  "task1-loss": {
    title: "Loss对比",
  },
  "task2-accuracy": {
    title: "Accuracy对比",
  },
  "task2-loss": {
    title: "Loss对比",
  },
};

/**
 * 统一的图表配置生成器
 * @param configName 图表配置名称
 * @returns 返回图表数据和配置
 */
export const createChartConfig = (configName: string) => {
  // 生成图表数据
  const chartData = reactive<ChartData>({
    labels: [],
    datasets: [],
  });

  // 生成图表配置
  const chartOptions = reactive<any>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: configName,
      },
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
      },
    },
    scales: {
      y: {
        min: 0.3,
      },
      x: {
        title: {
          display: true,
          text: "step",
        },
      },
    },
  });

  return {
    chartData,
    chartOptions,
  };
};

/**
 * 优化后的对照训练图表钩子函数
 */
export const useComparisonCharts = () => {
  // 使用统一方法创建各个图表配置
  const { chartData: task1Chart1Data, chartOptions: task1Chart1Options } =
    createChartConfig("Train_Acc");
  const { chartData: task1Chart2Data, chartOptions: task1Chart2Options } =
    createChartConfig("Val_Acc");
  const { chartData: task1Chart3Data, chartOptions: task1Chart3Options } =
    createChartConfig("Train_Loss");
  const { chartData: task1Chart4Data, chartOptions: task1Chart4Options } =
    createChartConfig("Val_Loss");
  const { chartData: task2Chart1Data, chartOptions: task2Chart1Options } =
    createChartConfig("Train_Acc");
  const { chartData: task2Chart2Data, chartOptions: task2Chart2Options } =
    createChartConfig("Val_Acc");
  const { chartData: task2Chart3Data, chartOptions: task2Chart3Options } =
    createChartConfig("Train_Loss");
  const { chartData: task2Chart4Data, chartOptions: task2Chart4Options } =
    createChartConfig("Val_Loss");

  /**
   * 更新图表数据的统一方法
   * @param configName 图表配置名称
   * @param newData 新的数据
   */
  const updateChartData = (
    data: Partial<ChartData>,
    newData: Partial<ChartData>
  ) => {
    Object.assign(data, newData);
  };

  /**
   * 加载图表数据
   */
  const loadChartData = async (taskId?: string) => {
  try {
  const response = await getData();
  const data = response.data;
  console.log("加载数据", taskId, data);

  // 根据taskId选择数据集
  const selectedData = (() => {
    if (taskId === "1") {
      return data.F; // 使用F数据集
    } else if (taskId === "2") {
      return data.S; // 使用S数据集
    } else {
      return data.T; // 使用T数据集（默认）
    }
  })();

  // 解构选中的数据
  const { epochs, A, B, C } = selectedData;
    console.log("对照训练数据", A);
      updateChartData(task1Chart1Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.train_acc,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: B.train_acc,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
          },
        ],
      });

      updateChartData(task1Chart2Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.val_acc,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: B.val_acc,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
          },
        ],
      });
      updateChartData(task1Chart3Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.train_loss,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: B.train_loss,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
          },
        ],
      });
      updateChartData(task1Chart4Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.val_loss,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: B.val_loss,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
          },
        ],
      });

      updateChartData(task2Chart1Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.train_acc,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: C.train_acc,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      });

      updateChartData(task2Chart2Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.val_acc,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: C.val_acc,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      });
      updateChartData(task2Chart3Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.train_loss,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: C.train_loss,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      });
      updateChartData(task2Chart4Data, {
        labels: epochs,
        datasets: [
          {
            label: "基准数据集",
            data: A.val_loss,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
          {
            label: "制备数据集",
            data: C.val_loss,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      });

      return true;
    } catch (error) {
      console.error("加载对照训练数据失败", error);
      return false;
    }
  };

  return {
    // 图表数据和配置
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

    // 统一方法
    createChartConfig,
    updateChartData,
    loadChartData,
  };
};
