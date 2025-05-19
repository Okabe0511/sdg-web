import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import {
  getAllOperators,
  updateOperator,
  Operator,
} from "/@/serve/api/operators";

// 定义参数接口
export interface OperatorParam {
  name: string;
  type: "number" | "bool" | "string";
  value: number | boolean | string;
  defaultValue: string;
}

export const useOperators = () => {
  // 算子库数据
  const operators = reactive<Operator[]>([]);
  const loading = ref(false);
  const operatorsTotal = ref(0);
  const operatorPageSize = ref(5);
  const currentPage = ref(1);

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

  // 加载算子库数据
  const loadOperators = async () => {
    try {
      loading.value = true;
      const response = await getAllOperators({
        pageSize: operatorPageSize.value,
        page: currentPage.value,
      });

      operators.length = 0;
      operators.push(...response.data);
      operatorsTotal.value = response.total;
    } catch (error) {
      console.error("加载算子库失败", error);
      message.error("加载算子库失败");
    } finally {
      loading.value = false;
    }
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
    currentOperator.value = { ...operator };
    parsedParams.value = parseParameters(operator.parameters);
    operatorEditModalVisible.value = true;
  };

  // 保存算子
  const saveOperator = async () => {
    try {
      updateParameterString();
      await updateOperator(currentOperator.value);

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

  // 监听分页变化
  watch(currentPage, () => {
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
  };
};
