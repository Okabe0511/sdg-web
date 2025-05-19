<template>
  <div class="preparation-section">
    <div v-if="visible" class="preparation-content">
      <div class="preparation-layout">
        <!-- 左侧：算子库和工作流 -->
        <div class="left-section">
          <!-- 算子库 -->
          <div class="operator-library">
            <div class="section-header">
              <h3>数据制备算子库</h3>
              <a-pagination
                v-model:current="currentPage"
                :pageSize="operatorPageSize"
                :total="operatorsTotal"
                size="small"
              />
            </div>
            <div class="operators-list">
              <div
                v-for="operator in operators"
                :key="operator.id"
                class="operator-card"
              >
                <div class="operator-info">
                  <div class="operator-name">{{ operator.name }}</div>
                  <div class="operator-desc">{{ operator.description }}</div>
                </div>
                <div class="operator-actions">
                  <a-button
                    type="primary"
                    size="small"
                    @click="editOperator(operator)"
                  >
                    编辑
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 工作流 -->
          <div class="workflow-container">
            <div class="section-header">
              <h3>工作流</h3>
              <div class="workflow-status" v-if="workflow.steps.length > 0">
                <span>已运行: {{ runtimeFormatted }}</span>
              </div>
            </div>

            <!-- 未配置状态 -->
            <div v-if="workflow.steps.length === 0" class="workflow-empty">
              <a-button type="primary" @click="showRecommendModal">
                <template #icon><Icon name="magic-wand" /></template>
                智能推荐
              </a-button>
              <div class="empty-tip">点击智能推荐，自动生成最佳工作流</div>
            </div>

            <!-- 已配置状态 -->
            <div v-else class="workflow-steps">
              <div
                v-for="(step, index) in workflow.steps"
                :key="index"
                class="workflow-step"
              >
                <div class="step-header">
                  <div class="step-index">{{ index + 1 }}</div>
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-preview" v-if="step.isCompleted">
                    <a-button
                      type="link"
                      size="small"
                      @click="previewStep(step)"
                    >
                      预览
                    </a-button>
                  </div>
                </div>

                <div class="step-status">
                  <div
                    class="status-dot"
                    :class="{
                      completed: step.isCompleted,
                      executing: currentExecutingStep === index,
                      pending:
                        !step.isCompleted && currentExecutingStep < index,
                    }"
                  ></div>
                  <span>{{
                    step.isCompleted
                      ? "已完成"
                      : currentExecutingStep === index
                      ? "执行中..."
                      : "待执行"
                  }}</span>
                </div>

                <!-- 只在非执行状态下显示操作按钮 -->
                <div
                  class="step-actions"
                  v-if="!isExecuting && !isWorkflowCompleted"
                >
                  <a-button
                    type="text"
                    size="small"
                    @click="moveStep(index, 'up')"
                    :disabled="index === 0"
                  >
                    <template #icon><UpOutlined /></template>
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    @click="moveStep(index, 'down')"
                    :disabled="index === workflow.steps.length - 1"
                  >
                    <template #icon><DownOutlined /></template>
                  </a-button>
                  <a-button type="text" size="small" @click="editStep(index)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                  <a-button type="text" size="small" @click="removeStep(index)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </div>
              </div>

              <!-- 工作流操作按钮区域 -->
              <div class="workflow-actions">
                <a-button
                  v-show="!isWorkflowCompleted"
                  type="primary"
                  :loading="isExecuting"
                  @click="executeWorkflow"
                >
                  {{ isExecuting ? "执行中..." : "执行工作流" }}
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：数据质量评估和数据靶点 -->
        <div class="right-section">
          <!-- 数据质量评估 -->
          <div class="quality-assessment">
            <div class="section-header">
              <h3>数据质量评估</h3>
            </div>
            <div class="radar-chart-container" ref="radarChartRef"></div>
          </div>

          <!-- 数据靶点 -->
          <div class="target-analysis">
            <div class="section-header">
              <h3>数据靶点</h3>
            </div>
            <div class="target-chart-container">
              <!-- 自定义靶图 -->
              <div class="target-board">
                <!-- 靶心圆环 -->
                <div class="target-circle circle-1"></div>
                <div class="target-circle circle-2"></div>
                <div class="target-circle circle-3"></div>
                <div class="target-circle circle-4"></div>
                <div class="target-circle circle-5"></div>

                <!-- 三个指标点 -->
                <div
                  class="target-indicator"
                  v-for="(item, key) in targetData"
                  :key="key"
                  :class="{ active: selectedTargetKey === key }"
                  :style="getIndicatorStyle(key, item)"
                  @click="selectTarget(key)"
                >
                  <div class="indicator-marker">
                    <div class="line-top"></div>
                    <div class="line-right"></div>
                    <div class="line-bottom"></div>
                    <div class="line-left"></div>
                    <div class="circle-ring"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="module-placeholder">
      <a-spin />
      <div class="placeholder-text">正在加载数据制备工作台...</div>
    </div>

    <!-- 算子编辑弹窗 -->
    <a-modal
      v-model:visible="operatorEditModalVisible"
      title="编辑算子"
      :footer="null"
      width="600px"
    >
      <a-form :model="currentOperator" layout="vertical">
        <a-form-item label="算子名称" name="name">
          <a-input v-model:value="currentOperator.name" :disabled="true" />
        </a-form-item>
        <a-form-item label="算子描述" name="description">
          <a-textarea
            v-model:value="currentOperator.description"
            :rows="4"
            :disabled="true"
          />
        </a-form-item>

        <!-- 算子配置参数 - 动态生成 -->
        <a-divider>算子配置参数</a-divider>

        <div v-if="parsedParams.length === 0" class="empty-params">
          此算子没有可配置参数
        </div>

        <div
          v-for="(param, index) in parsedParams"
          :key="index"
          class="param-item"
        >
          <a-form-item :label="param.name">
            <!-- 根据参数类型渲染不同的输入控件 -->
            <a-input-number
              v-if="param.type === 'number'"
              v-model:value="param.value"
              :step="0.1"
            />
            <a-switch
              v-else-if="param.type === 'bool'"
              v-model:checked="param.value"
            />
            <a-input v-else v-model:value="param.value" />
          </a-form-item>
        </div>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="saveOperator">保存</a-button>
            <a-button @click="operatorEditModalVisible = false">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 智能推荐弹窗 -->
    <a-modal
      v-model:visible="recommendModalVisible"
      title="智能推荐工作流"
      :footer="null"
      width="500px"
    >
      <a-form layout="vertical">
        <a-form-item label="推荐策略" name="strategy">
          <a-radio-group v-model:value="recommendConfig.strategy">
            <a-radio value="time">时间优先</a-radio>
            <a-radio value="balanced">均衡</a-radio>
            <a-radio value="quantity">数量优先</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="优化靶点" name="targets">
          <a-checkbox-group v-model:value="recommendConfig.targets">
            <a-checkbox value="configDiversity">配置多样性</a-checkbox>
            <a-checkbox value="chartTypeBalance">图表类型均衡性</a-checkbox>
            <a-checkbox value="dataVolume">数据量</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="generateWorkflow"
              >开始推荐</a-button
            >
            <a-button @click="recommendModalVisible = false">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 步骤预览弹窗 -->
    <a-modal
      v-model:visible="previewModalVisible"
      title="步骤执行结果预览"
      :footer="null"
      width="700px"
    >
      <div class="preview-content">
        <h4>{{ currentPreviewStep?.name }}</h4>
        <p>{{ currentPreviewStep?.description }}</p>
        <div class="preview-placeholder">
          <p>此处展示步骤执行结果的预览效果</p>
          <p>（实际效果暂未实现）</p>
        </div>
      </div>
      <div class="preview-footer">
        <a-button @click="previewModalVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import {
  UpOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import Icon from "/@/components/Icon/index.vue";
import { useOperators } from "/@/views/preparation/create/hooks/useOperators";
import { useTargetAnalysis } from "/@/views/preparation/create/hooks/useTargetAnalysis";
import { useWorkflow } from "/@/views/preparation/create/hooks/useWorkflow";

export default defineComponent({
  components: {
    Icon,
    UpOutlined,
    DownOutlined,
    EditOutlined,
    DeleteOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // 使用算子钩子
    const {
      operators,
      loading,
      operatorsTotal,
      currentPage,
      operatorPageSize,
      operatorEditModalVisible,
      currentOperator,
      parsedParams,
      loadOperators,
      editOperator,
      saveOperator,
    } = useOperators();

    // 使用靶点分析钩子，添加addOperatorData
    const {
      radarChartRef,
      targetData,
      selectedTargetKey,
      selectTarget,
      getIndicatorStyle,
      initRadarChart,
      addOperatorData, // 新增
      radarDataSeries, // 新增
    } = useTargetAnalysis();

    // 使用工作流钩子
    const {
      workflow,
      isExecuting,
      currentExecutingStep,
      runtimeFormatted,
      recommendModalVisible,
      recommendConfig,
      previewModalVisible,
      currentPreviewStep,
      showRecommendModal,
      generateWorkflow,
      moveStep,
      removeStep,
      executeWorkflow: originalExecuteWorkflow, // 重命名原始方法
      previewStep,
      isWorkflowCompleted,
    } = useWorkflow();

    // 添加一个已完成算子的跟踪数组
    const completedSteps = ref<number[]>([]);

    // 包装执行工作流方法，添加监听每个步骤完成的逻辑
    const executeWorkflow = () => {
      // 重置已完成步骤
      completedSteps.value = [];
      // 调用原始执行方法
      originalExecuteWorkflow();
    };

    // 监听currentExecutingStep的变化
    watch(
      () => currentExecutingStep.value,
      (newVal, oldVal) => {
        // 如果当前执行步骤改变，且上一个步骤完成
        if (oldVal >= 0 && newVal !== oldVal) {
          const completedStepIndex = oldVal;
          // 检查该步骤是否已记录为完成
          if (!completedSteps.value.includes(completedStepIndex)) {
            // 记录步骤完成
            completedSteps.value.push(completedStepIndex);
            // 获取完成的算子名称
            const operatorName =
              workflow.steps[completedStepIndex]?.name ||
              `算子${completedStepIndex + 1}`;
            // 添加算子数据到雷达图
            addOperatorData(operatorName);
          }
        }
      }
    );

    // 编辑步骤 - 适配钩子函数接口
    const editStep = (index: number) => {
      if (index >= 0 && index < workflow.steps.length) {
        const step = workflow.steps[index];
        editOperator(step);
      }
    };

    // 组件挂载时初始化
    onMounted(() => {
      if (props.visible) {
        loadOperators();
        initRadarChart();
      }
    });

    // 当可见性变化时重新初始化
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          loadOperators();
          setTimeout(() => {
            initRadarChart();
          }, 100);
        }
      }
    );

    return {
      // 算子库相关
      operators,
      loading,
      currentPage,
      operatorPageSize,
      operatorsTotal,
      operatorEditModalVisible,
      currentOperator,
      parsedParams,
      editOperator,
      saveOperator,

      // 靶点分析相关
      radarChartRef,
      targetData,
      selectedTargetKey,
      selectTarget,
      getIndicatorStyle,

      // 工作流相关
      workflow,
      isExecuting,
      currentExecutingStep,
      runtimeFormatted,
      recommendModalVisible,
      recommendConfig,
      previewModalVisible,
      currentPreviewStep,
      showRecommendModal,
      generateWorkflow,
      moveStep,
      editStep,
      removeStep,
      executeWorkflow,
      previewStep,
      radarDataSeries,
      isWorkflowCompleted,
    };
  },
});
</script>

<style lang="less" scoped>
.preparation-section {
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
  }

  .preparation-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .preparation-layout {
    display: flex;
    flex: 1;
    gap: 20px;
    height: 100%;

    @media (max-width: 1200px) {
      flex-direction: column;
    }

    .left-section {
      flex: 3;
      display: flex;
      gap: 20px;

      .operator-library {
        flex: 2;
        display: flex;
        flex-direction: column;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: @primary-color;
          }
        }

        .operators-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
          overflow-y: auto;

          .operator-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s ease;

            &:hover {
              border-color: @primary-color;
              box-shadow: 0 2px 8px rgba(0, 155, 164, 0.1);
            }

            .operator-info {
              flex: 1;

              .operator-name {
                font-weight: 500;
                font-size: 16px;
                margin-bottom: 5px;
                color: #333;
              }

              .operator-desc {
                color: #666;
                font-size: 14px;
                margin-bottom: 10px;
              }

              .operator-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
              }
            }

            .operator-actions {
              margin-left: 15px;
            }
          }
        }
      }

      .workflow-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: @primary-color;
          }

          .workflow-status {
            font-size: 14px;
            color: #666;
          }
        }

        .workflow-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .empty-tip {
            margin-top: 10px;
            font-size: 14px;
            color: #999;
          }
        }

        .workflow-steps {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          padding: 5px 3px;

          .workflow-step {
            display: flex;
            flex-direction: column;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 15px;
            background-color: #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;

            &::after {
              content: "";
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              width: 2px;
              height: 20px;
              background-color: #d9d9d9;
              z-index: 1;
            }

            &:last-child::after {
              display: none;
            }

            // 倒数第二个也不展示
            &:nth-last-child(2)::after {
              display: none;
            }

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 155, 164, 0.15);
              border-color: @primary-color;
            }

            &.completed {
              border-left: 4px solid #52c41a;
            }

            .step-header {
              display: flex;
              align-items: center;
              width: 100%;
              margin-bottom: 8px;

              .step-index {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background-color: @primary-color;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
                box-shadow: 0 2px 4px rgba(0, 155, 164, 0.2);
              }

              .step-name {
                font-weight: 500;
                font-size: 15px;
                color: #333;
                flex: 1;
              }

              .step-preview {
                margin-left: auto;

                .ant-btn {
                  &:hover {
                    background-color: #f0f7ff;
                  }
                }
              }
            }

            .step-description {
              margin-left: 40px;
              font-size: 13px;
              color: #666;
              margin-bottom: 10px;
              line-height: 1.5;
            }

            .step-status {
              position: absolute;
              top: 0;
              right: 0;
              padding: 5px 10px;
              font-size: 12px;
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 6px;

                &.completed {
                  background-color: #52c41a;
                }

                &.pending {
                  background-color: #faad14;
                }
              }
            }

            .step-actions {
              display: flex;
              gap: 5px;
              margin-left: 40px;

              .ant-btn {
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                  background-color: #f5f5f5;

                  &.ant-btn-danger {
                    background-color: #fff1f0;
                  }
                }
              }
            }
          }

          .workflow-execute {
            display: flex;
            justify-content: center;
            margin-top: 20px;

            .ant-btn {
              padding: 0 25px;
              height: 38px;
              font-size: 15px;
              box-shadow: 0 2px 6px rgba(0, 155, 164, 0.2);

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 155, 164, 0.3);
              }
            }
          }
        }
      }
    }

    .right-section {
      flex: 1.5;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .quality-assessment,
      .target-analysis {
        flex: 1;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        background-color: #fff;

        .section-header {
          margin-bottom: 15px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: @primary-color;
          }
        }
      }

      .radar-chart-container {
        flex: 1;
        height: 100%;
        min-height: 200px;
      }

      .target-chart-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;

        .target-board {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5dc;
          border-radius: 50%;

          // 靶心圆环
          .target-circle {
            position: absolute;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            left: 50%;
            top: 50%;

            &.circle-1 {
              width: 90%;
              height: 90%;
              background-color: #f5f5dc;
              border: 2px solid rgba(0, 0, 0, 0.8);
            }

            &.circle-2 {
              width: 70%;
              height: 70%;
              background-color: rgb(196, 37, 52);
            }

            &.circle-3 {
              width: 50%;
              height: 50%;
              background-color: rgba(52, 58, 64, 1);
            }

            &.circle-4 {
              width: 30%;
              height: 30%;
              background-color: rgb(223, 169, 8);
            }

            &.circle-5 {
              width: 10%;
              height: 10%;
              background-color: rgb(223, 169, 8);
            }
          }

          // 指标点
          .target-indicator {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 5;
            cursor: pointer;
            transition: all 0.3s ease;

            .indicator-marker {
              position: relative;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;

              // 四条边线样式
              .line-top,
              .line-right,
              .line-bottom,
              .line-left {
                position: absolute;
                background-color: #1890ff;
                transition: background-color 0.3s ease;
              }

              .line-top,
              .line-bottom {
                width: 2px;
                height: 6px;
              }

              .line-right,
              .line-left {
                width: 6px;
                height: 2px;
              }

              .line-top {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -150%);
              }

              .line-right {
                right: 50%;
                top: 50%;
                transform: translate(150%, -50%);
              }

              .line-bottom {
                bottom: 50%;
                left: 50%;
                transform: translate(-50%, 150%);
              }

              .line-left {
                left: 50%;
                top: 50%;
                transform: translate(-150%, -50%);
              }

              .circle-ring {
                position: absolute;
                width: 12px;
                height: 12px;
                border: 4px solid #1890ff;
                border-radius: 50%;
                transition: border-color 0.3s ease;
                z-index: 1;
              }
            }

            &.active,
            &:hover {
              z-index: 10;

              .indicator-marker {
                transform: scale(1.1);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #13c2c2;
                }

                .circle-ring {
                  border-color: #13c2c2;
                }
              }
            }
          }
        }
      }
    }
  }

  .module-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    flex: 1;

    .placeholder-text {
      margin-top: 15px;
      color: #999;
    }
  }

  .preview-content {
    .preview-placeholder {
      border: 1px dashed #ddd;
      padding: 20px;
      text-align: center;
      margin-top: 15px;
      color: #999;
      border-radius: 4px;
      background-color: #fafafa;
    }
  }

  .preview-footer {
    margin-top: 20px;
    text-align: right;
  }
}

.empty-params {
  text-align: center;
  color: #999;
  padding: 10px 0;
  padding-bottom: 20px;
}
</style>
