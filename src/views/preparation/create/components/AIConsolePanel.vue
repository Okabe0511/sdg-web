<template>
  <div class="ai-console-section">
    <h2>控制台</h2>
    <div class="ai-console">
      <!-- 使用 TDesign Chat 组件展示日志 -->
      <div class="chat-container">
        <t-chat
          :clear-history="false"
          :data="formattedMessages"
          :isStreamLoad="isStreamLoad"
          :reverse="false"
          ref="chatRef"
        >
          <template #content="{ item, index }">
            <t-chat-reasoning
              v-if="item?.reasoning?.length > 0"
              expand-icon-placement="right"
            >
              <template #header>
                <t-chat-loading
                  v-if="isStreamLoad && index === formattedMessages.length - 1"
                  text="指令执行中..."
                />
                <div
                  v-else
                  style="display: flex; align-items: center; gap: 8px"
                >
                  <CheckCircleOutlined :style="{ color: 'green' }" />
                  <span>指令执行完成</span>
                </div>
              </template>
              <t-chat-content :content="item.reasoning" />
            </t-chat-reasoning>
            <t-chat-content :content="item.content" />
          </template>
        </t-chat>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";

import { CheckCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  components: { CheckCircleOutlined },
  props: {
    messages: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const chatRef = ref(null) as any;

    const isStreamLoad = ref(false);

    // 格式化消息以符合 TDesign Chat 组件的要求
    const formattedMessages = computed(() => {
      const mergedMessages: any[] = [];
      let currentSystemMessage: any = null;

      // 处理原始消息
      props.messages.forEach((msg: any) => {
        const isUser = msg.type === "user";

        // 处理用户消息 - 直接添加到结果中
        if (isUser) {
          isStreamLoad.value = false;
          currentSystemMessage = null;
          mergedMessages.push({
            avatar: "https://tdesign.gtimg.com/site/avatar.jpg",
            name: "操作记录",
            datetime: msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
            content: msg.content,
            role: "user",
            type: "text",
          });
          return;
        }

        // 处理系统消息
        if (msg.type === "system") {
          // 情况1: content为空，有reasoning - 需要累积
          if (msg.content === "") {
            // 如果没有当前累积的系统消息，创建一个新的
            if (!currentSystemMessage) {
              currentSystemMessage = {
                avatar: "https://tdesign.gtimg.com/site/chat-avatar.png",
                name: "系统日志",
                datetime: msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString()
                  : new Date().toLocaleTimeString(),
                content: "",
                role: "assistant",
                type: "text",
                reasoning: msg.reasoning || "",
              };
              isStreamLoad.value = true;
              mergedMessages.push(currentSystemMessage);
            } else {
              // 有当前消息，追加 reasoning
              currentSystemMessage.reasoning += msg.reasoning || "";
              mergedMessages[mergedMessages.length - 1] = currentSystemMessage;
            }
          }
          // 情况2: content 有内容 - 完成当前累积的系统消息
          else {
            // 如果有当前累积的系统消息，用这个 content 填充它
            if (currentSystemMessage) {
              isStreamLoad.value = false;
              currentSystemMessage.content = msg.content;
              currentSystemMessage.isStreamLoad = false;
              mergedMessages[mergedMessages.length - 1] = currentSystemMessage;
              currentSystemMessage = null;
            } else {
              isStreamLoad.value = false;
              // 没有当前累积的系统消息，直接添加
              mergedMessages.push({
                avatar: "https://tdesign.gtimg.com/site/chat-avatar.png",
                name: "系统日志",
                datetime: msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString()
                  : new Date().toLocaleTimeString(),
                content: msg.content,
                role: "assistant",
                type: "text",
              });
            }
          }
        }
      });

      // 反转消息顺序，最新的消息显示在底部
      return mergedMessages;
    });

    return {
      formattedMessages,
      chatRef,
      isStreamLoad,
    };
  },
});
</script>

<style lang="less" scoped>
.ai-console-section {
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
  }

  .ai-console {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;

    .chat-container {
      flex-grow: 1;
      overflow-y: auto;
      max-height: 100%;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 10px;
      background-color: #fff;
    }

    :deep(.t-chat) {
      --td-chat-content-bg-color: #f0f2f5;
      --td-chat-content-bg-color-reverse: rgba(0, 155, 164, 0.1);

      .t-chat-message--reverse {
        .t-chat-message__content {
          background-color: rgba(0, 155, 164, 0.1);
          color: #333;
        }
      }

      .t-chat-message__name {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .t-chat-message__time {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

// 调整消息最大高度，避免单条消息过长导致无法查看
:deep(.t-chat-message__content) {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.t-chat__text__content) {
  // 检测换行符号
  p {
    white-space: pre-wrap;
  }
}
</style>
