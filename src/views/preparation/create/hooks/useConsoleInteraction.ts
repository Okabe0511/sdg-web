import { ref } from "vue";
import { getFullTaskLog, getDataPreparationLog } from "/@/serve/api/aiConsole";
import { SSEEvent, parseSSEContent } from "/@/utils/sse";

export interface ConsoleMessage {
  type: "system" | "user";
  content: string;
  reasoning?: string;
  timestamp?: number;
}

export const useConsoleInteraction = () => {
  // 控制台对话内容
  const consoleMessages = ref<ConsoleMessage[]>([]);

  // 是否正在加载AI响应
  const isLoading = ref(false);

  // 添加系统消息
  const addSystemMessage = (
    content: string,
    type: "REASONING" | "RESPONSE"
  ) => {
    if (type === "REASONING") {
      consoleMessages.value.push({
        type: "system",
        content: "",
        reasoning: content,
        timestamp: Date.now(),
      });
    } else if (type === "RESPONSE") {
      consoleMessages.value.push({
        type: "system",
        content,
        timestamp: Date.now(),
      });
    }
  };

  // 添加用户消息
  const addUserMessage = (content: string) => {
    consoleMessages.value.push({
      type: "user",
      content,
      timestamp: Date.now(),
    });
  };

  // 启动自动任务流程（一次性获取整个任务的流式输出）
  const startTaskStream = async (taskConfig: any) => {
    isLoading.value = true;

    try {
      await getFullTaskLog(taskConfig, (event: any) => {
        const content = event.data;
        if (event.type === "REQUEST") {
          addUserMessage(content);
        } else if (event.type === "RESPONSE" || event.type === "REASONING") {
          addSystemMessage(content, event.type);
        }
      });
    } catch (error) {
      console.error("获取任务日志失败", error);
    } finally {
      isLoading.value = false;
    }
  };

  // 启动数据准备流程（一次性获取整个数据准备的流式输出）
  const startDataPreparationStream = async () => {
    isLoading.value = true;

    try {
      await getDataPreparationLog((event: any) => {
        const content = event.data;
        if (event.type === "REQUEST") {
          addUserMessage(content);
        } else if (event.type === "RESPONSE" || event.type === "REASONING") {
          addSystemMessage(content, event.type);
        }
      });
    } catch (error) {
      console.error("获取数据准备日志失败", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    consoleMessages,
    isLoading,
    addSystemMessage,
    addUserMessage,
    startTaskStream,
    startDataPreparationStream,
  };
};
