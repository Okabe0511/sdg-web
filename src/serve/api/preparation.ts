import http from "..";
import mockData from "/@/mock/preparationData.json";

// 获取任务列表
export const getTaskList = () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: mockData.tasks });
  }
  // 实际环境中调用真实接口
  return http.get("/preparation/tasks");
};

// 获取监控数据
export const getMonitorData = () => {
  // 在开发环境中使用mock数据
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: mockData.monitorData });
  }
  // 实际环境中调用真实接口
  return http.get("/preparation/monitor");
};

// 删除任务
export const deleteTask = (taskId: string) => {
  // 在开发环境中模拟成功响应
  if (import.meta.env.DEV) {
    return Promise.resolve({ data: { success: true } });
  }
  // 实际环境中调用真实接口
  return http.delete(`/preparation/tasks/${taskId}`);
};

// 查看任务详情
export const getTaskDetail = (taskId: string) => {
  // 在开发环境中找到对应的任务
  if (import.meta.env.DEV) {
    const task = mockData.tasks.find((t) => t.id === taskId);
    return Promise.resolve({ data: task });
  }
  // 实际环境中调用真实接口
  return http.get(`/preparation/tasks/${taskId}`);
};
