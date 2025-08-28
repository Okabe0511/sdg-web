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
        let wordIndex = 0;
        const typedWord = (word: string) => {
          if (message.event === "REQUEST") {
            streamHandler({
              type: message.event,
              data: message.data,
            });
            index++;
            wordIndex = 0;
            const delay = 500; // 减少到0.5秒，加快REQUEST消息间隔
            setTimeout(sendNextMessage, delay);
            return;
          }
          if (message.event === "RESPONSE") {
            streamHandler({
              type: message.event,
              data: message.data,
            });
            index++;
            wordIndex = 0;
            const delay = 500; // 减少到0.5秒，加快RESPONSE消息间隔
            setTimeout(sendNextMessage, delay);
            return;
          }
          if (message.event === "DELAY") {
            // 处理延迟事件，不向UI发送任何内容，只是等待指定时间
            index++;
            const customDelay = parseInt(message.data) || 2000; // 从data中读取延迟时间，默认2秒
            setTimeout(sendNextMessage, customDelay);
            return;
          }
          if (wordIndex < word.length) {
            streamHandler({
              type: message.event,
              data: word[wordIndex],
            });
            wordIndex++;
            setTimeout(() => typedWord(word), 32); // 加快打字速度到30毫秒
          } else {
            wordIndex = 0;
            index++;
            // 发送完整消息
            streamHandler({
              type: message.event,
              data: "\n", // 换行符表示消息结束
            });
            const delay = 50; // 减少到50毫秒，加快消息间隔
            setTimeout(sendNextMessage, delay);
          }
        };
        typedWord(message.data);
        return;
        // streamHandler({
        //   type: message.event,
        //   data: `${message.data}\n`,
        // });

        index++;

        // 模拟延迟
        // const delay = 1000;
        // setTimeout(sendNextMessage, delay);
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
  task: any,
  streamHandler: (event: SSEEvent) => void
): Promise<AIConsoleResponse> => {
  try {
    // 在开发环境中使用mock数据
    if (import.meta.env.DEV) {
      if (task.taskId == "internet") {
        return simulateStream(mockData.responses["internet"], streamHandler);
      }
      else if (task.taskId == "energy") {
        return simulateStream(mockData.responses["energy"], streamHandler);
      }
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

/**
 * 获取完整任务流程日志（一次性流式获取）
 * @param taskConfig 任务配置
 * @param streamHandler 处理流式消息的回调
 * @returns AI响应对象
 */
export const getDataPreparationLog = async (
  task: any,
  streamHandler: (event: SSEEvent) => void
): Promise<AIConsoleResponse> => {
  try {
    // 在开发环境中使用mock数据
    if (import.meta.env.DEV) {
      if (task === "internet") {
        return simulateStream(mockData.preparation.internet, streamHandler);
      } else if (task === "energy") {
        return simulateStream(mockData.preparation.energy, streamHandler);
      }
      else  {
        return simulateStream(mockData.preparation.internet, streamHandler);
    }
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
