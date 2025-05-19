/**
 * SSE 事件类型定义
 */
export interface SSEEvent {
  type: "delta" | "finish" | null;
  data: any;
}

/**
 * SSE 请求选项定义
 */
export interface FetchSSEOptions {
  url?: string;
  params?: any;
  headers?: Record<string, string>;
  success?: (data: SSEEvent) => void;
  fail?: () => void;
  complete?: (success: boolean, message?: string) => void;
}

/**
 * SSE 流式请求处理工具函数
 * @param options 请求选项
 * @returns Promise<void>
 */
export const fetchSSE = async (options: FetchSSEOptions = {}) => {
  const { url, params, headers, success, fail, complete } = options;

  // 构建请求配置
  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: params ? JSON.stringify(params) : undefined,
  };

  // fetch请求流式接口
  const responsePromise = fetch(url || "", requestInit).catch((e) => {
    const msg = e.toString() || "流式接口异常";
    complete?.(false, msg);
    return Promise.reject(e);
  });

  responsePromise
    .then((response) => {
      if (!response?.ok) {
        complete?.(false, response.statusText);
        fail?.();
        throw new Error("Request failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      const bufferArr: string[] = [];
      let pendingText = "";
      const event: SSEEvent = { type: null, data: null };

      async function processText({
        done,
        value,
      }: ReadableStreamReadResult<Uint8Array>): Promise<void> {
        if (done) {
          complete?.(true);
          return Promise.resolve();
        }

        const chunk = decoder.decode(value);
        const lines = chunk.toString().split(/\r?\n\r?\n/);

        bufferArr.push(...lines);

        while (bufferArr.length > 0) {
          const line = bufferArr[0];

          if (!line.trim()) {
            bufferArr.shift();
            continue;
          }

          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              event.type = "finish";
              event.data = null;
              success?.(event);
              bufferArr.shift();
              continue;
            }

            try {
              const jsonData = JSON.parse(data);
              const choice = jsonData.choices?.[0];

              if (choice) {
                if (choice.finish_reason === "stop") {
                  event.type = "finish";
                  event.data = null;
                } else {
                  event.type = "delta";
                  event.data = choice;
                }

                success?.(event);
              }
            } catch (error) {
              console.error("解析消息失败:", error, data);
            }
          }

          bufferArr.shift();
        }

        return reader.read().then(processText);
      }

      return reader.read().then(processText);
    })
    .catch((error) => {
      console.error("流式请求异常:", error);
      fail?.();
    });
};

/**
 * 解析流式数据的内容
 * @param data 流式数据
 * @returns 解析后的内容
 */
export const parseSSEContent = (data: SSEEvent): string | null => {
  if (!data || !data.data || !data.data.delta || !data.data.delta.content) {
    return null;
  }
  return data.data.delta.content;
};
