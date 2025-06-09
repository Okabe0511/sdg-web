import http from "..";
import mockOperatorsData from "/@/mock/operatorsData.json";

export interface Operator {
  id: number;
  name: string;
  description: string;
  parameters: string;
  costEvaluation?: {
    resourceCost: number;
    timeCost: number;
    qualityContribution: number;
  };
  datasetSize?: {
    dataPairs: number;
    imageCount: number;
    codeCount: number;
  };
}

/**
 * 获取所有算子列表
 * @param params 分页参数 {page: 当前页码, pageSize: 每页数量}
 * @returns 算子列表和总数
 */
export const getAllOperators = async (params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ data: Operator[]; total: number }> => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    let operators = [...mockOperatorsData.operators];
    const total = operators.length; // 获取总数

    // 如果提供了分页参数，则进行分页处理
    if (params?.page && params?.pageSize) {
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      operators = operators.slice(startIndex, endIndex);
    }

    return Promise.resolve({ data: operators, total });
  }
  // 实际环境中调用真实接口
  return http.get("/operators/list", { params });
};

/**
 * 获取算子详情
 * @param id 算子ID
 * @returns 算子详细信息
 */
export const getOperatorById = async (
  id: number
): Promise<{ data: Operator | null }> => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    const operator = mockOperatorsData.operators.find((op) => op.id === id);
    return Promise.resolve({ data: operator || null });
  }
  // 实际环境中调用真实接口
  return http.get(`/operators/${id}`);
};

/**
 * 更新算子
 * @param operator 算子数据
 * @returns 更新结果
 */
export const updateOperator = async (
  operator: Operator
): Promise<{ data: { success: boolean } }> => {
  // 在开发环境中模拟成功响应
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: { success: true } });
  }
  // 实际环境中调用真实接口
  return http.put(`/operators/${operator.id}`, operator);
};

/**
 * 推荐工作流
 * @param config 推荐配置
 * @returns 推荐的算子列表
 */
export const getRecommendWorkflow = async (
  config: any
): Promise<{ data: Operator[] }> => {
  // 在开发环境中使用固定工作流
  if (import.meta.env.DEV) {
    // 固定顺序的工作流：配置项修复算子 -> 语法修复算子 -> 配置多样性增强算子 -> 基于图像生成代码算子 -> 代码扰动算子 -> 基于代码生成图像算子
    const workflowIds = [4, 7, 5, 1, 2, 6];

    // 根据策略调整算子数量
    let finalIds = [...workflowIds];

    // 获取详细算子信息并按照finalIds的顺序返回
    const operators = finalIds
      .map((id) => mockOperatorsData.operators.find((op) => op.id === id))
      .filter(Boolean) as Operator[]; // 过滤掉可能的undefined

    return Promise.resolve({ data: operators });
  }

  // 实际环境中调用真实接口
  return http.post("/operators/recommend", config);
};

// 添加创建算子和删除算子的API方法

/**
 * 创建新算子
 * @param operator 算子数据
 * @returns 创建的算子数据
 */
export const createOperator = async (
  operator: Partial<Operator>
): Promise<{ data: Operator }> => {
  // 在开发环境中模拟成功响应
  if (import.meta.env.DEV) {
    // 模拟创建成功，生成ID
    const newId =
      Math.max(...mockOperatorsData.operators.map((op) => op.id)) + 1;
    const newOperator: Operator = {
      id: newId,
      name: operator.name || "新算子",
      description: operator.description || "",
      parameters: operator.parameters || "",
      costEvaluation: undefined,
      datasetSize: undefined,
    };

    // 添加到本地mock数据(实际开发中可能不需要)
    mockOperatorsData.operators.unshift(newOperator as any);

    return Promise.resolve({ data: newOperator });
  }

  // 实际环境中调用真实接口
  return http.post("/operators", operator);
};

/**
 * 删除算子
 * @param id 算子ID
 * @returns 删除结果
 */
export const deleteOperator = async (
  id: number
): Promise<{ data: { success: boolean } }> => {
  // 在开发环境中模拟成功响应
  if (import.meta.env.DEV) {
    // 从mock数据中删除(实际开发中可能不需要)
    const index = mockOperatorsData.operators.findIndex((op) => op.id === id);
    if (index !== -1) {
      mockOperatorsData.operators.splice(index, 1);
    }

    return Promise.resolve({ data: { success: true } });
  }

  // 实际环境中调用真实接口
  return http.delete(`/operators/${id}`);
};
