<template>
  <div class="dataset-section">
    <h2>数据集描述</h2>
    <div v-if="visible" class="dataset-list">
      <!-- 表头 -->
      <div v-if="datasets.size > 0" class="dataset-header">
        <div class="header-cell">数据类型</div>
        <div class="header-cell">数据量</div>
        <div class="header-cell">数据大小</div>
      </div>

      <!-- 数据行 -->
      <div v-for="[key, dataset] in datasets" :key="key" class="dataset-row">
        <div class="dataset-cell type-cell">{{ dataset.dataType }}</div>
        <div class="dataset-cell">{{ dataset.dataAmount }}</div>
        <div class="dataset-cell">{{ dataset.dataSize }}</div>
      </div>

      <!-- 显示为空状态 -->
      <div v-if="datasets.size === 0" class="empty-dataset">
        <p>未添加任何数据集，请使用控制台添加数据集</p>
      </div>
    </div>
    <div v-else class="module-placeholder">
      <a-spin />
      <div class="placeholder-text">等待数据集配置完成...</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface DatasetInfo {
  dataType: string;
  dataAmount: string;
  dataSize: string;
}

export default defineComponent({
  props: {
    datasets: {
      type: Object as PropType<Map<string, DatasetInfo>>,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style lang="less" scoped>
.dataset-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .dataset-list {
    display: flex;
    flex-direction: column;

    .dataset-header {
      display: flex;
      font-weight: 500;
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-radius: 6px 6px 0 0;
      margin-bottom: 1px;

      .header-cell {
        flex: 1;
        text-align: left;
      }
    }

    .dataset-row {
      display: flex;
      padding: 12px 15px;
      background-color: #f9f9f9;
      margin-bottom: 1px;

      &:last-child {
        border-radius: 0 0 6px 6px;
      }

      &:only-child {
        border-radius: 6px;
      }

      .dataset-cell {
        flex: 1;

        &.type-cell {
          font-weight: 500;
          color: #333;
        }
      }
    }

    .empty-dataset {
      padding: 20px;
      text-align: center;
      color: #999;
      background-color: #f9f9f9;
      border-radius: 6px;

      p {
        margin-bottom: 5px;
      }

      .command-hint {
        font-family: monospace;
        background: #f0f0f0;
        padding: 5px 10px;
        border-radius: 4px;
        display: inline-block;
        margin-top: 5px;
      }
    }
  }

  .module-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;

    .placeholder-text {
      margin-top: 15px;
      color: #999;
    }
  }
}
</style>
