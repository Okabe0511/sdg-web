import { identity } from "lodash";
import http from "..";
import mockOperatorsDataRaw from "/@/mock/operatorsData.json";

// 明确 mock 数据类型
interface MockOperatorsData {
  operators: Operator[];
  recommendWorkflows: Record<string, number[]>;
}
const mockOperatorsData = mockOperatorsDataRaw as unknown as MockOperatorsData;

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

// 根据任务ID获取数据集类型（仅支持字符串或数字）
const getDatasetType = (taskId: string | number): string => {
  if (String(taskId) === 'internet') return 'internet';
  if (String(taskId) === 'energy') return 'energy';
  return 'internet'; // 默认为internet
};

// 获取算子列表（不区分数据集类型）
const getOperatorsByDataset = (): Operator[] => {
  return Array.isArray(mockOperatorsData.operators) ? [...mockOperatorsData.operators] : [];
};

/**
 * 获取所有算子列表
 * @param taskId 任务ID
 * @param params 分页参数 {page: 当前页码, pageSize: 每页数量}
 * @returns 算子列表和总数
 */
export const getAllOperators = async (
  taskId: string | number,
  params?: {
    page?: number;
    pageSize?: number;
  }
): Promise<{ data: Operator[]; total: number }> => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    let operators = getOperatorsByDataset();
    const total = operators.length;

    if (params?.page && params?.pageSize) {
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      operators = operators.slice(startIndex, endIndex);
    }

    return Promise.resolve({ data: operators, total });
  }
  // 实际环境中调用真实接口
  return http.get("/operators/list", { 
    params: { 
      ...params, 
      datasetType: getDatasetType(taskId) 
    } 
  });
};

/**
 * 获取算子详情
 * @param taskId 任务ID
 * @param id 算子ID
 * @returns 算子详细信息
 */
export const getOperatorById = async (
  taskId: string | number,
  id: number
): Promise<{ data: Operator | null }> => {
  if (import.meta.env.DEV) {
    const operators = getOperatorsByDataset();
    const operator = operators.find((op) => op.id === id);
    return Promise.resolve({ data: operator || null });
  }
  // 实际环境中调用真实接口
  return http.get(`/operators/${id}`, { 
    params: { datasetType: getDatasetType(taskId) } 
  });
};

/**
 * 更新算子
 * @param taskId 任务ID
 * @param operator 算子数据
 * @returns 更新结果
 */
export const updateOperator = async (
  taskId: string | number,
  operator: Operator
): Promise<{ data: { success: boolean } }> => {
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: { success: true } });
  }
  // 实际环境中调用真实接口
  return http.put(`/operators/${operator.id}`, {
    ...operator,
    datasetType: getDatasetType(taskId)
  });
};

/**
 * 推荐工作流
 * @param taskId 任务ID
 * @param config 推荐配置
 * @returns 推荐的算子列表
 */
export const getRecommendWorkflow = async (
  taskId: string | number,
  config: any
): Promise<{ data: Operator[] }> => {
  if (import.meta.env.DEV) {
    const datasetType = getDatasetType(taskId);
    const workflowIds = (mockOperatorsData.recommendWorkflows && mockOperatorsData.recommendWorkflows[datasetType]) || (mockOperatorsData.recommendWorkflows && mockOperatorsData.recommendWorkflows["internet"]) || [];
    const operators = getOperatorsByDataset();
    const recommendedOperators = (workflowIds as number[]).map((id: number) => operators.find((op) => op.id === id)).filter(Boolean) as Operator[];
    return Promise.resolve({ data: recommendedOperators });
  }
  // 实际环境中调用真实接口
  return http.post("/operators/recommend", {
    ...config,
    datasetType: getDatasetType(taskId)
  });
};

/**
 * 创建新算子
 * @param taskId 任务ID
 * @param operator 算子数据
 * @returns 创建的算子数据
 */
export const createOperator = async (
  taskId: string | number,
  operator: Partial<Operator>
): Promise<{ data: Operator }> => {
  if (import.meta.env.DEV) {
    const operators = getOperatorsByDataset();
    const newId = Math.max(...operators.map((op) => op.id)) + 1;
    const newOperator: Operator = {
      id: newId,
      name: operator.name || "新算子",
      description: operator.description || "",
      parameters: operator.parameters || "",
      costEvaluation: undefined,
      datasetSize: undefined,
    };

    if (Array.isArray(mockOperatorsData.operators)) {
      mockOperatorsData.operators.unshift(newOperator as any);
    }

    return Promise.resolve({ data: newOperator });
  }
  // 实际环境中调用真实接口
  return http.post("/operators", {
    ...operator,
    datasetType: getDatasetType(taskId)
  });
};

/**
 * 删除算子
 * @param taskId 任务ID
 * @param id 算子ID
 * @returns 删除结果
 */
export const deleteOperator = async (
  taskId: string | number,
  id: number
): Promise<{ data: { success: boolean } }> => {
  if (import.meta.env.DEV) {
    if (Array.isArray(mockOperatorsData.operators)) {
      const index = mockOperatorsData.operators.findIndex((op: any) => op.id === id);
      if (index !== -1) {
        mockOperatorsData.operators.splice(index, 1);
      }
    }
    return Promise.resolve({ data: { success: true } });
  }
  // 实际环境中调用真实接口
  return http.delete(`/operators/${id}`, {
    params: { datasetType: getDatasetType(taskId) }
  });
};