import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import {
  getAllOperators,
  updateOperator,
  Operator,
  createOperator,
  deleteOperator,
} from "/@/serve/api/operators";
import { useRoute } from 'vue-router';

// 定义参数接口
export interface OperatorParam {
  name: string;
  type: "number" | "bool" | "string";
  value: number | boolean | string;
  defaultValue: string;
}

// 前端写死的算子参数配置
const OPERATOR_PARAMETERS: Record<number, string> = {
  1: "", // 基于图像生成代码算子
  2: "mutation_prob: 1, mutation_range: 0.5", // 代码扰动算子
  3: "add_watermark: True, water_count: 25, add_noise: True, add_text: True, text_count: 15", // 图像加噪算子
  4: "", // 配置项修复算子
  5: "probability: 0.5", // 配置多样性增强算子
  6: "", // 基于代码生成图像算子
  7: "", // 语法修复算子
  8: "sampling_rates: 15min,30min,1h", // 样本多粒度采样算子
  9: "period_type: seasonal", // 周期性增强算子
  10: "trend_type: linear", // 趋势性增强算子
  11: "frequency_count: 5", // 主频提取增强算子
  12: "model_type: SAITS", // 数据缺失值填充算子
  13: "vote_method: majority", // 标签冲突校准算子
  14: "normalize_method: standard", // 时序平稳化算子
  15: "balance_ratio: 0.8", // 稀缺样本生成算子
  16: "transfer_method: similarity", // 领域知识迁移算子
  17: "feature_type: temporal", // 领域知识引入算子
  18: "time_features: month,day,hour,holiday", // 时间特征增强算子
  19: "cluster_method: kmeans", // 冗余样本消除算子
  20: "correlation_threshold: 0.9" // 冗余特征消除算子
};

export const useOperators = () => {
  const route = useRoute();
  const taskId = route.params.key as string; // 获取路由参数

  // 算子库数据
  const operators = reactive<Operator[]>([]);
  const loading = ref(false);
  const operatorsTotal = ref(0);
  const operatorPageSize = ref(3);
  const currentPage = ref(1);

  // 添加搜索关键词状态
  const searchKeyword = ref("");
  // 添加原始算子数据，用于搜索过滤
  const originalOperators = reactive<Operator[]>([]);
  // 添加管理模式状态
  const isManageMode = ref(false);

  // 算子编辑相关
  const operatorEditModalVisible = ref(false);
  const currentOperator = ref<Operator>({
    id: 0,
    name: "",
    description: "",
    parameters: "",
  });

  // 解析后的参数
  const parsedParams = ref<OperatorParam[]>([]);

  // 添加新增算子相关状态
  const addOperatorModalVisible = ref(false);
  const uploadFileList = ref<any[]>([]);
  const newOperator = ref<Partial<Operator>>({
    name: "",
    description: "",
  });

  // 加载算子库数据
  const loadOperators = async () => {
    try {
      loading.value = true;
      const response = await getAllOperators(
        taskId, // 传递路由参数
        {
          pageSize: operatorPageSize.value,
          page: currentPage.value,
        }
      );

      // 使用前端配置的参数替换服务器返回的参数
      const operatorsWithParameters = response.data.map(operator => ({
        ...operator,
        parameters: OPERATOR_PARAMETERS[operator.id] || ""
      }));

      // 保存原始算子列表用于搜索
      originalOperators.length = 0;
      originalOperators.push(...operatorsWithParameters);

      // 如果有搜索关键词，过滤算子列表
      if (searchKeyword.value) {
        filterOperators();
      } else {
        operators.length = 0;
        operators.push(...response.data);
      }

      operatorsTotal.value = response.total;
    } catch (error) {
      message.error("加载算子库失败");
    } finally {
      loading.value = false;
    }
  };

  // 添加搜索处理方法
  const handleSearch = (value: string) => {
    searchKeyword.value = value;
    currentPage.value = 1; // 重置到第一页
    filterOperators();
  };

  // 添加过滤算子方法
  const filterOperators = () => {
    if (!searchKeyword.value) {
      // 如果没有搜索关键词，恢复原始列表
      operators.length = 0;
      operators.push(...originalOperators);
      return;
    }

    // 基于关键词过滤算子
    const keyword = searchKeyword.value.toLowerCase();
    const filtered = originalOperators.filter(
      (operator) =>
        operator.name.toLowerCase().includes(keyword) ||
        operator.description.toLowerCase().includes(keyword)
    );

    operators.length = 0;
    operators.push(...filtered);

    // 更新总数
    operatorsTotal.value = filtered.length;
  };

  // 添加切换管理模式的方法
  const toggleManageMode = () => {
    isManageMode.value = !isManageMode.value;
  };

  // 获取算子的前端配置参数
  const getOperatorParameters = (operatorId: number): string => {
    return OPERATOR_PARAMETERS[operatorId] || "";
  };

  // 解析参数字符串为结构化数据
  const parseParameters = (paramStr: string): OperatorParam[] => {
    if (!paramStr || paramStr.trim() === "") return [];

    const result: OperatorParam[] = [];
    const paramPairs = paramStr.split(",");

    paramPairs.forEach((pair) => {
      const [name, valueStr] = pair.split(":").map((item) => item.trim());
      if (!name || !valueStr) return;

      // 判断参数类型
      let type: "number" | "bool" | "string";
      let value: number | boolean | string;

      // 尝试解析数字
      if (
        !isNaN(Number(valueStr)) &&
        valueStr !== "True" &&
        valueStr !== "False"
      ) {
        type = "number";
        value = Number(valueStr);
      }
      // 判断布尔值
      else if (
        valueStr === "True" ||
        valueStr === "true" ||
        valueStr === "False" ||
        valueStr === "false"
      ) {
        type = "bool";
        value = valueStr === "True" || valueStr === "true";
      }
      // 其他情况作为字符串处理
      else {
        type = "string";
        value = valueStr;
      }

      result.push({
        name,
        type,
        value,
        defaultValue: valueStr,
      });
    });

    return result;
  };

  // 将结构化参数转回字符串
  const updateParameterString = () => {
    const paramStrs = parsedParams.value.map((param) => {
      // 格式化布尔值为 True/False
      if (param.type === "bool") {
        return `${param.name}: ${param.value ? "True" : "False"}`;
      }
      return `${param.name}: ${param.value}`;
    });

    currentOperator.value.parameters = paramStrs.join(", ");
  };

  // 编辑算子
  const editOperator = (operator: Operator) => {
    // 使用前端配置的参数而不是服务器的参数
    const operatorWithParams = {
      ...operator,
      parameters: OPERATOR_PARAMETERS[operator.id] || ""
    };
    currentOperator.value = { ...operatorWithParams };
    parsedParams.value = parseParameters(operatorWithParams.parameters || "");
    operatorEditModalVisible.value = true;
  };

  // 保存算子
  const saveOperator = async () => {
    try {
      updateParameterString();
      await updateOperator(taskId, currentOperator.value); // 传递路由参数

      // 更新本地算子列表
      const index = operators.findIndex(
        (o) => o.id === currentOperator.value.id
      );
      if (index !== -1) {
        operators[index] = { ...currentOperator.value };
      }

      operatorEditModalVisible.value = false;
      message.success("算子更新成功");
    } catch (error) {
      console.error("保存算子失败", error);
      message.error("保存算子失败");
    }
  };

  // 添加算子到工作流
  const addOperatorToWorkflow = ref<((operator: Operator) => void) | null>(
    null
  );

  // 编辑并准备添加算子到工作流
  const prepareAddOperator = (operator: Operator) => {
    currentOperator.value = { ...operator };
    parsedParams.value = parseParameters(operator.parameters || "");
    operatorEditModalVisible.value = true;
  };

  // 保存算子并添加到工作流
  const saveAndAddToWorkflow = async () => {
    try {
      updateParameterString();
      await updateOperator(taskId, currentOperator.value); // 传递路由参数

      // 更新本地算子列表
      const index = operators.findIndex(
        (o) => o.id === currentOperator.value.id
      );
      if (index !== -1) {
        operators[index] = { ...currentOperator.value };
      }

      // 如果有注册添加到工作流的回调，则调用它
      if (addOperatorToWorkflow.value) {
        addOperatorToWorkflow.value({ ...currentOperator.value });
      }

      operatorEditModalVisible.value = false;
      message.success("算子已添加到工作流");
    } catch (error) {
      console.error("保存算子失败", error);
      message.error("保存算子失败");
    }
  };

  // 删除算子
  const removeOperator = async (operatorId: number) => {
    try {
      await deleteOperator(taskId, operatorId); // 传递路由参数

      // 从本地列表中移除
      const index = operators.findIndex((op) => op.id === operatorId);
      if (index !== -1) {
        operators.splice(index, 1);
      }

      // 同样从原始列表中移除
      const originalIndex = originalOperators.findIndex(
        (op) => op.id === operatorId
      );
      if (originalIndex !== -1) {
        originalOperators.splice(originalIndex, 1);
      }

      // 更新总数
      operatorsTotal.value--;

      // 检查当前页是否还有数据，如果没有且不是第一页，则跳转到上一页
      const totalPages = Math.ceil(
        operatorsTotal.value / operatorPageSize.value
      );
      if (currentPage.value > totalPages && currentPage.value > 1) {
        currentPage.value--;
      }

      // 重新加载算子列表，确保页面上显示正确数量的算子
      await loadOperators();

      message.success("算子删除成功");
    } catch (error) {
      console.error("删除算子失败", error);
      message.error("删除算子失败");
    }
  };

  // 显示添加算子弹窗
  const showAddOperatorModal = () => {
    addOperatorModalVisible.value = true;
    newOperator.value = {
      name: "",
      description: "",
    };
    uploadFileList.value = [];
  };

  // 关闭添加算子弹窗
  const closeAddOperatorModal = () => {
    addOperatorModalVisible.value = false;
  };

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const isJSON = file.type === "application/json";
    if (!isJSON) {
      message.error("只能上传JSON文件!");
    }
    return false; // 阻止自动上传
  };

  // 创建新算子
  const createNewOperator = async () => {
    try {
      if (!newOperator.value.name || !newOperator.value.description) {
        message.error("请填写算子名称和描述");
        return;
      }

      // 如果有上传文件，解析文件内容
      if (uploadFileList.value.length > 0) {
        const file = uploadFileList.value[0].originFileObj;
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const parsedData = JSON.parse(content);

            // 合并文件内容和表单内容
            const operatorData = {
              ...newOperator.value,
              ...parsedData,
              name: newOperator.value.name || parsedData.name,
              description:
                newOperator.value.description || parsedData.description,
            };

            await submitCreateOperator(operatorData);
          } catch (error) {
            console.error("解析JSON文件失败", error);
            message.error("解析JSON文件失败，请确保文件格式正确");
          }
        };

        reader.readAsText(file);
      } else {
        // 没有文件，直接提交表单数据
        await submitCreateOperator(newOperator.value);
      }
    } catch (error) {
      console.error("创建算子失败", error);
      message.error("创建算子失败");
    }
  };

  // 提交创建算子请求
  const submitCreateOperator = async (operatorData: Partial<Operator>) => {
    const response = await createOperator(taskId, operatorData); // 传递路由参数
    const newOperatorData = response.data;

    // 重置页码
    currentPage.value = 1;

    // 清除搜索关键词
    searchKeyword.value = "";

    // 重新加载算子列表
    await loadOperators();

    message.success("算子创建成功");
    addOperatorModalVisible.value = false;
  };

  // 监听分页变化
  watch([currentPage], () => {
    loadOperators();
  });

  return {
    operators,
    loading,
    operatorsTotal,
    currentPage,
    operatorPageSize,
    operatorEditModalVisible,
    currentOperator,
    parsedParams,
    loadOperators,
    editOperator,
    saveOperator,
    updateParameterString,
    addOperatorToWorkflow,
    prepareAddOperator,
    saveAndAddToWorkflow,
    parseParameters,
    getOperatorParameters,
    searchKeyword,
    handleSearch,
    isManageMode,
    toggleManageMode,
    addOperatorModalVisible,
    uploadFileList,
    newOperator,
    removeOperator,
    showAddOperatorModal,
    closeAddOperatorModal,
    beforeUpload,
    createNewOperator,
  };
};