<script lang="ts">
import { defineComponent } from "vue";
import Icon from "/@/components/Icon/index.vue";
import { useTaskList } from "./hooks/useTaskList";
import { useMonitorCharts } from "./hooks/useMonitorCharts";

export default defineComponent({
  components: {
    Icon,
  },
  setup() {
    // 使用任务列表钩子
    const {
      activeTab,
      searchValue,
      taskList,
      filteredTaskList,
      handleTabChange,
      viewTaskDetail,
      deleteTask,
      addNewTask,
    } = useTaskList();

    // 使用监控图表钩子
    const { pieChartRef, barChartRef, monitorData } = useMonitorCharts();

    return {
      // 任务列表相关
      activeTab,
      searchValue,
      taskList,
      filteredTaskList,
      handleTabChange,
      viewTaskDetail,
      deleteTask,
      addNewTask,

      // 监控图表相关
      monitorData,
      pieChartRef,
      barChartRef,
    };
  },
});
</script>

<template>
  <div class="preparation-page">
    <div class="preparation-content">
      <!-- 左侧：任务列表部分 -->
      <div class="tasks-section">
        <div class="tasks-header">
          <div class="tasks-tabs">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'all' }"
              @click="handleTabChange('all')"
            >
              全部
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'completed' }"
              @click="handleTabChange('completed')"
            >
              已完成
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'running' }"
              @click="handleTabChange('running')"
            >
              运行中
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'unconfigured' }"
              @click="handleTabChange('unconfigured')"
            >
              未配置
            </div>
          </div>
          <div class="search-container">
            <a-input-search
              v-model:value="searchValue"
              placeholder="搜索数据集"
              style="width: 250px"
              allow-clear
            />
          </div>
        </div>

        <div class="tasks-list">
          <!-- 添加新任务卡片 -->
          <div class="task-card add-task" @click="addNewTask">
            <div class="add-task-content">
              <Icon
                name="delete_line"
                :size="40"
                color="rgba(0, 155, 164, 1)"
              />
              <div class="add-task-text">新增任务</div>
            </div>
          </div>

          <!-- 任务卡片列表 -->
          <div
            v-for="task in filteredTaskList()"
            :key="task.id"
            class="task-card"
          >
            <div class="task-status" :class="task.status">
              {{
                task.status === "completed"
                  ? "已完成"
                  : task.status === "running"
                  ? "运行中"
                  : "未配置"
              }}
            </div>
            <h3 class="task-name">{{ task.name }}</h3>
            <div class="task-info">
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ task.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">原始数据文件：</span>
                <span class="value">{{ task.fileCount }} 个</span>
              </div>
              <div class="info-item">
                <span class="label">数据制备条目：</span>
                <span class="value">{{ task.dataCount }} 条</span>
              </div>
            </div>
            <div class="task-actions">
              <a-button type="primary" @click="viewTaskDetail(task.id)"
                >详情</a-button
              >
              <a-button danger @click="deleteTask(task.id)">删除</a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：监控信息部分 -->
      <div class="monitor-section">
        <h2 class="monitor-title">多源异构混合存储系统监控</h2>

        <!-- 存储节点模块 -->
        <div class="monitor-card">
          <h3 class="card-title">存储节点</h3>
          <div class="node-status">
            <div class="status-item">
              <div class="status-count online">
                {{ monitorData.storageNodes.online }}
              </div>
              <div class="status-label">在线节点</div>
            </div>
            <div class="status-item">
              <div class="status-count offline">
                {{ monitorData.storageNodes.offline }}
              </div>
              <div class="status-label">离线节点</div>
            </div>
          </div>
        </div>

        <!-- 存储对象模块 -->
        <div class="monitor-card">
          <h3 class="card-title">存储对象</h3>
          <div class="objects-count">
            {{ monitorData.storageObjects.toLocaleString() }}
          </div>
        </div>

        <!-- 存储对象类型分布模块 - 使用 ref 绑定 -->
        <div class="monitor-card">
          <h3 class="card-title">存储对象类型分布</h3>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>

        <!-- 存储节点容量模块 - 使用 ref 绑定 -->
        <div class="monitor-card">
          <h3 class="card-title">存储节点容量</h3>
          <div ref="barChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.preparation-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 150px);
}

.preparation-content {
  display: flex;
  gap: 20px;

  .tasks-section {
    flex: 3;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .tasks-tabs {
        display: flex;
        background-color: #f0f2f5;
        border-radius: 4px;
        overflow: hidden;

        .tab-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
          transition: all 0.3s;

          &.active {
            background-color: @primary-color;
            color: #fff;
          }

          &:hover:not(.active) {
            background-color: #e6e6e6;
          }
        }
      }
    }

    .tasks-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .task-card {
      position: relative;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .task-status {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        color: #fff;

        &.completed {
          background-color: #52c41a;
        }

        &.running {
          background-color: #1890ff;
        }

        &.unconfigured {
          background-color: #faad14;
        }
      }

      .task-name {
        margin-bottom: 12px;
        padding-right: 60px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .task-info {
        margin-bottom: 16px;

        .info-item {
          display: flex;
          margin-bottom: 4px;
          font-size: 14px;

          .label {
            color: #666;
            min-width: 100px;
          }

          .value {
            color: #333;
            font-weight: 500;
          }
        }
      }

      .task-actions {
        display: flex;
        justify-content: flex-start;
        gap: 8px;
      }

      &.add-task {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: #fafafa;
        border: 1px dashed #d9d9d9;
        min-height: 180px;

        &:hover {
          border-color: @primary-color;
        }

        .add-task-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .add-task-text {
            font-size: 16px;
            color: @primary-color;
            font-weight: 500;
          }
        }
      }
    }
  }

  .monitor-section {
    flex: 1;
    min-width: 300px;
    max-width: 400px;

    .monitor-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .monitor-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .node-status {
        display: flex;
        justify-content: space-around;
        padding: 12px 0;

        .status-item {
          text-align: center;

          .status-count {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 4px;

            &.online {
              color: #52c41a;
            }

            &.offline {
              color: #ff4d4f;
            }
          }

          .status-label {
            font-size: 14px;
            color: #666;
          }
        }
      }

      .objects-count {
        font-size: 36px;
        font-weight: bold;
        color: #1890ff;
        text-align: center;
        padding: 20px 0;
      }

      .chart-container {
        height: 200px;
        width: 100%;
      }
    }
  }
}

@media screen and (max-width: 992px) {
  .preparation-content {
    flex-direction: column;

    .monitor-section {
      max-width: none;
    }
  }
}
</style>
