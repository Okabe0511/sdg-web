<template>
  <div class="top-area">
    <div class="progress-section">
      <a-steps :current="currentStep">
        <a-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.subtitle"
        />
      </a-steps>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    currentStep: {
      type: Number,
      required: true,
    },
    steps: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style lang="less" scoped>
.top-area {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .progress-section {
    padding: 10px 0;
  }
}

:deep(.ant-steps-item-description) {
  // 展示换行符
  white-space: pre-wrap !important;
}
</style>
