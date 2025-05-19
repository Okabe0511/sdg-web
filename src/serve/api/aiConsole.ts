import http from "..";
import mockData from "/@/mock/aiResponseData.json";
import { fetchSSE, SSEEvent } from "/@/utils/sse";

/**
 * AI响应类型定义
 */
export interface AIConsoleResponse {
  id: string;
  success: boolean;
  streamHandler?: (event: SSEEvent) => void;
  error?: string;
}

/**
 * 模拟流式API响应
 * @param mockMessages 模拟消息数组
 * @param streamHandler 处理流式消息的回调
 * @returns
 */
const simulateStream = (
  mockMessages: {
    event: string;
    data: string;
  }[],
  streamHandler: (event: any) => void
): Promise<AIConsoleResponse> => {
  return new Promise((resolve) => {
    let index = 0;

    const sendNextMessage = () => {
      if (index < mockMessages.length) {
        const message = mockMessages[index];
        streamHandler({
          type: message.event,
          data: message.data,
        });

        index++;

        // 模拟延迟，每个消息之间间隔100-300ms
        const delay = Math.floor(Math.random() * 200) + 1000;
        setTimeout(sendNextMessage, delay);
      } else {
        // 所有消息发送完成
        streamHandler({
          type: "finish",
          data: null,
        });

        resolve({
          id: `mock-response-${Date.now()}`,
          success: true,
        });
      }
    };

    // 开始发送消息
    sendNextMessage();
  });
};

/**
 * 获取完整任务流程日志（一次性流式获取）
 * @param taskConfig 任务配置
 * @param streamHandler 处理流式消息的回调
 * @returns AI响应对象
 */
export const getFullTaskLog = async (
  taskConfig: any,
  streamHandler: (event: SSEEvent) => void
): Promise<AIConsoleResponse> => {
  try {
    // 在开发环境中使用mock数据
    if (import.meta.env.DEV) {
      return simulateStream(mockData.responses, streamHandler);
    }
    return Promise.resolve() as any;
  } catch (error: any) {
    console.error("获取任务日志失败", error);
    return {
      id: "",
      success: false,
      error: error?.message || "获取任务日志失败",
    };
  }
};
