<template>
  <div class="preparation-section">
    <!-- 添加数据集信息头部 -->
    <DatasetHeader :metrics="metrics" />

    <div v-if="visible" class="preparation-content">
      <div class="preparation-layout">
        <!-- 左侧：算子库和工作流 -->
        <div class="left-section">
          <!-- 算子库 -->
          <div class="operator-library">
            <div class="section-header">
              <h3>数据制备算子库</h3>
              <div class="header-actions">
                <!-- 添加搜索框 -->
                <a-input-search
                  v-model:value="searchKeyword"
                  placeholder="搜索算子"
                  style="width: 150px; margin-right: 8px"
                  @search="handleSearch"
                  allowClear
                />
                <!-- 管理按钮 -->
                <a-button
                  type="text"
                  @click="toggleManageMode"
                  :class="{ active: isManageMode }"
                >
                  {{ isManageMode ? "退出管理" : "管理" }}
                </a-button>
                <!-- 管理状态下的添加按钮 -->
                <a-button
                  v-if="isManageMode"
                  type="primary"
                  size="small"
                  @click="showAddOperatorModal"
                  style="margin-left: 8px"
                >
                  添加算子
                </a-button>
              </div>
            </div>
            <div class="operators-list">
              <div
                v-for="(operator, index) in operators"
                :key="operator.id"
                class="operator-card"
              >
                <!-- 添加管理模式下的删除按钮 - 放到右上角 -->
                <div v-if="isManageMode" class="operator-manage-actions">
                  <a-button
                    type="text"
                    danger
                    @click.stop="removeOperator(operator.id)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </div>

                <div class="operator-content">
                  <!-- 原有内容保持不变 -->
                  <div class="operator-desc">
                    <div class="operator-name">{{ operator.name }}</div>
                    {{ operator.description }}
                  </div>
                  <div class="operator-image">
                    <img v-if="operator.name === '基于图像生成代码算子'" :src="Operator1" alt="算子图示" />
                    <img v-if="operator.name === '代码扰动算子'" :src="Operator2" alt="算子图示" />
                    <img v-if="operator.name === '图像加噪算子'" :src="Operator3" alt="算子图示" />
                    <img v-if="operator.name === '配置项修复算子'" :src="Operator4" alt="算子图示" />
                    <img v-if="operator.name === '配置多样性增强算子'" :src="Operator5" alt="算子图示" />
                    <img v-if="operator.name === '基于代码生成图像算子'" :src="Operator6" alt="算子图示" />
                    <img v-if="operator.name === '语法修复算子'" :src="Operator7" alt="算子图示" />
                    <img v-if="operator.name === '样本多粒度采样算子'" :src="Operator9" alt="算子图示" />
                    <img v-if="operator.name === '周期性增强算子'" :src="Operator10" alt="算子图示" />
                    <img v-if="operator.name === '趋势性增强算子'" :src="Operator11" alt="算子图示" />
                    <img v-if="operator.name === '主频提取增强算子'" :src="Operator12" alt="算子图示" />
                    <img v-if="operator.name === '数据缺失值填充算子'" :src="Operator13" alt="算子图示" />
                    <img v-if="operator.name === '标签冲突校准算子'" :src="Operator14" alt="算子图示" />
                    <img v-if="operator.name === '时序平稳化算子'" :src="Operator15" alt="算子图示" />
                    <img v-if="operator.name === '稀缺样本生成算子'" :src="Operator16" alt="算子图示" />
                    <img v-if="operator.name === '领域知识迁移算子'" :src="Operator17" alt="算子图示" />
                    <img v-if="operator.name === '领域知识引入算子'" :src="Operator18" alt="算子图示" />
                    <img v-if="operator.name === '时间特征增强算子'" :src="Operator19" alt="算子图示" />
                    <img v-if="operator.name === '冗余样本消除算子'" :src="Operator20" alt="算子图示" />
                    <img v-if="operator.name === '冗余特征消除算子'" :src="Operator21" alt="算子图示" />
                  </div>
                </div>
                <div
                  class="operator-actions"
                  @click="!isWorkflowCompleted && prepareAddOperator(operator)"
                  :class="{ disabled: isWorkflowCompleted }"
                >
                  添加
                </div>
              </div>
            </div>
            <div class="operator-pagination">
              <a-pagination
                v-model:current="currentPage"
                :pageSize="operatorPageSize"
                :total="operatorsTotal"
                size="small"
              />
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
                </div>

                <!-- 添加参数配置显示区域 -->
                <div class="step-params" v-if="step.parameters">
                  <div class="params-title">参数配置：</div>
                  <div class="params-content">
                    {{ formatParameters(step.parameters) }}
                  </div>
                </div>

                <!-- 在展示算子参数的区域下方添加代价评估数据 -->
                <!-- 代价评估暂时隐藏 -->
                <!-- <template v-if="step.costEvaluation">
                  <div class="step-cost-evaluation">
                    <div class="evaluation-title">代价评估：</div>
                    <div class="evaluation-content">
                      <div class="evaluation-item">
                        <span class="evaluation-label">资源成本：</span>
                        <span class="evaluation-value">{{
                          step.costEvaluation.resourceCost
                        }}</span>
                      </div>
                      <div class="evaluation-item">
                        <span class="evaluation-label">时间成本：</span>
                        <span class="evaluation-value">{{
                          step.costEvaluation.timeCost
                        }}</span>
                      </div>
                      <div class="evaluation-item">
                        <span class="evaluation-label">质量贡献：</span>
                        <span class="evaluation-value">{{
                          step.costEvaluation.qualityContribution
                        }}</span>
                      </div>
                    </div>
                  </div>
                </template> -->

                <!-- <div
                  class="step-preview"
                  v-if="isExecuting || isWorkflowCompleted"
                >
                  <a-button
                    type="text"
                    size="small"
                    @click="previewStep(step)"
                    :disabled="!step.isCompleted"
                  >
                    预览
                  </a-button>
                </div> -->
                <div
                  v-if="isExecuting || isWorkflowCompleted"
                  class="step-status"
                >
                  <div
                    class="status-icon"
                    :class="{
                      completed: step.isCompleted,
                      executing: currentExecutingStep === index,
                      pending:
                        !step.isCompleted && currentExecutingStep < index,
                    }"
                  >
                    <check-circle-filled v-if="step.isCompleted" />
                    <loading-outlined
                      v-else-if="currentExecutingStep === index"
                      spin
                    />
                    <clock-circle-outlined v-else />
                  </div>
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
                    上移
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    @click="moveStep(index, 'down')"
                    :disabled="index === workflow.steps.length - 1"
                  >
                    下移
                  </a-button>
                  <a-button type="text" size="small" @click="editStep(index)">
                    编辑
                  </a-button>
                  <a-button type="text" size="small" @click="removeStep(index)">
                    删除
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

                <!-- 三个指标点 -->
                <!-- 原始指标点 -->
                <div
                  class="target-indicator original"
                  v-for="key in Object.keys(targetData.original)"
                  :key="`original-${key}`"
                  :style="getIndicatorStyle(key, (targetData.original as any)[key])"
                >
                  <div class="indicator-marker">
                    <div class="line-top"></div>
                    <div class="line-right"></div>
                    <div class="line-bottom"></div>
                    <div class="line-left"></div>
                    <div class="circle-ring"></div>
                  </div>
                </div>
                <!-- 当前指标点 -->
                <div
                  class="target-indicator current"
                  v-for="key in Object.keys(targetData.current)"
                  :key="`current-${key}`"
                  :style="getIndicatorStyle(key, (targetData.current as any)[key])"
                  @click="selectTarget(key)"
                >
                  <div class="indicator-marker">
                    <div class="line-top"></div>
                    <div class="line-right"></div>
                    <div class="line-bottom"></div>
                    <div class="line-left"></div>
                    <div class="circle-ring"></div>
                  </div>
                  <!-- 添加悬浮提示框 -->
                  <div class="tooltip">
                    <div class="tooltip-title">
                      {{ targetExplanations[key].title }}
                    </div>
                    <div class="tooltip-value">
                      <span class="label">原始得分:</span>
                      <span class="value">{{
                        formatScore((targetData.original as any)[key])
                      }}</span>
                    </div>
                    <div class="tooltip-value">
                      <span class="label">当前得分:</span>
                      <span class="value">{{
                        formatScore((targetData.current as any)[key])
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加悬浮的下一步按钮 -->
            <div class="floating-next-button" v-if="isWorkflowCompleted">
              <a-button type="primary" @click="handleCompletePreparation">
                下一步 <right-outlined />
              </a-button>
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
      title="算子配置"
      @ok="saveAndAddToWorkflow"
      @cancel="operatorEditModalVisible = false"
      :okText="'添加到工作流'"
      :cancelText="'取消'"
    >
      <!-- 算子编辑表单 -->
      <a-form :model="currentOperator">
        <!-- 参数编辑 -->
        <div v-for="(param, index) in parsedParams" :key="index">
          <a-form-item :label="param.name">
            <!-- 根据参数类型渲染不同控件 -->
            <a-input-number
              v-if="param.type === 'number'"
              v-model:value="param.value"
            />
            <a-switch
              v-else-if="param.type === 'bool'"
              v-model:checked="param.value"
            />
            <a-input v-else v-model:value="param.value" />
          </a-form-item>
        </div>
        <!-- 算子参数为空时 -->
        <div v-if="parsedParams.length === 0" class="empty-params">
          <p>此算子无可配置参数</p>
        </div>
      </a-form>
    </a-modal>

    <!-- 智能推荐弹窗 -->
    <a-modal
      v-model:visible="recommendModalVisible"
      title="智能推荐工作流"
      :footer="null"
      width="500px"
    >
      <a-form>
        <a-form-item label="时间限制(分钟)" name="timeLimit">
          <a-input-number
            v-model:value="recommendConfig.timeLimit"
            placeholder="请输入时间限制"
            style="width: 100%"
            :min="1"
            :max="120"
          />
        </a-form-item>
        <a-form-item label="资源成本限制" name="costLimit">
          <a-input-number
            v-model:value="recommendConfig.costLimit"
            placeholder="请输入资源成本限制"
            style="width: 100%"
            :min="100"
            :max="1000"
            :step="100"
          />
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
      width="800px"
      :bodyStyle="{ padding: '16px', maxHeight: '600px' }"
    >
      <div class="preview-content">
        <div v-if="diffHtml" class="preview-diff" v-html="diffHtml"></div>
        <div v-else class="preview-placeholder">
          <p>此步骤执行结果预览暂不可用</p>
          <p>（实际效果需要后端数据支持）</p>
        </div>
      </div>
      <div class="preview-footer">
        <a-button @click="previewModalVisible = false">关闭</a-button>
      </div>
    </a-modal>

    <!-- 步骤编辑弹窗 -->
    <a-modal
      v-model:visible="stepEditModalVisible"
      title="编辑算子"
      @ok="saveEditedStep"
      @cancel="stepEditModalVisible = false"
      :okText="'保存'"
      :cancelText="'取消'"
    >
      <!-- 步骤编辑表单 -->
      <a-form :model="currentOperator">
        <!-- 参数编辑 -->
        <div v-for="(param, index) in parsedParams" :key="index">
          <a-form-item :label="param.name">
            <!-- 根据参数类型渲染不同控件 -->
            <a-input-number
              v-if="param.type === 'number'"
              v-model:value="param.value"
            />
            <a-switch
              v-else-if="param.type === 'bool'"
              v-model:checked="param.value"
            />
            <a-input v-else v-model:value="param.value" />
          </a-form-item>
        </div>
        <!-- 算子参数为空时 -->
        <div v-if="parsedParams.length === 0" class="empty-params">
          <p>此算子无可配置参数</p>
        </div>
      </a-form>
    </a-modal>

    <!-- 添加新算子弹窗 -->
    <a-modal
      v-model:visible="addOperatorModalVisible"
      title="添加新算子"
      @ok="createNewOperator"
      @cancel="closeAddOperatorModal"
      :okText="'创建'"
      :cancelText="'取消'"
    >
      <a-form :model="newOperator" layout="vertical">
        <a-form-item label="算子名称" required>
          <a-input
            v-model:value="newOperator.name"
            placeholder="请输入算子名称"
          />
        </a-form-item>

        <a-form-item label="算子描述" required>
          <a-textarea
            v-model:value="newOperator.description"
            placeholder="请输入算子描述"
            :autoSize="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>

        <a-form-item label="上传算子定义文件">
          <a-upload
            v-model:file-list="uploadFileList"
            :beforeUpload="beforeUpload"
            :maxCount="1"
            action=""
          >
            <a-button>
              <upload-outlined />
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  onMounted,
  reactive,
  nextTick,
} from "vue";
import { message } from "ant-design-vue";
import {
  UpOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  RightOutlined, // 添加右箭头图标
} from "@ant-design/icons-vue";
import Icon from "/@/components/Icon/index.vue";
import { useOperators } from "/@/views/preparation/create/hooks/useOperators";
import { useTargetAnalysis } from "/@/views/preparation/create/hooks/useTargetAnalysis";
import { useWorkflow } from "/@/views/preparation/create/hooks/useWorkflow";
// 引入新的钩子函数
import { useCodePreview } from "/@/views/preparation/create/hooks/useCodePreview";
import DatasetHeader from "/@/components/DatasetHeader/index.vue";
import { useDatasetMetrics } from "/@/views/preparation/create/hooks/useDatasetMetrics";

import Operator1 from "/@/assets/images/operators/operator-1.png";
import Operator2 from "/@/assets/images/operators/operator-2.png";
import Operator3 from "/@/assets/images/operators/operator-3.png";
import Operator4 from "/@/assets/images/operators/operator-4.png";
import Operator5 from "/@/assets/images/operators/operator-5.png";
import Operator6 from "/@/assets/images/operators/operator-6.png";
import Operator7 from "/@/assets/images/operators/operator-7.png";
import Operator8 from "/@/assets/images/operators/operator-8.png";
import Operator9 from "/@/assets/images/operators/operator-9.png";
import Operator10 from "/@/assets/images/operators/operator-10.png";
import Operator11 from "/@/assets/images/operators/operator-11.png";
import Operator12 from "/@/assets/images/operators/operator-12.png";
import Operator13 from "/@/assets/images/operators/operator-13.png";
import Operator14 from "/@/assets/images/operators/operator-14.png";
import Operator15 from "/@/assets/images/operators/operator-15.png";
import Operator16 from "/@/assets/images/operators/operator-16.png";
import Operator17 from "/@/assets/images/operators/operator-17.png";
import Operator18 from "/@/assets/images/operators/operator-18.png";
import Operator19 from "/@/assets/images/operators/operator-19.png";
import Operator20 from "/@/assets/images/operators/operator-20.png";
import Operator21 from "/@/assets/images/operators/operator-21.png";
import { Operator } from "/@/serve/api/operators";


interface TargetExplanation {
  title: string;
  score: number;
  content: string;
}

export default defineComponent({
  components: {
    Icon,
    UpOutlined,
    DownOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleFilled,
    LoadingOutlined,
    ClockCircleOutlined,
    UploadOutlined,
    RightOutlined, // 添加组件
    DatasetHeader,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },

  // 添加emit定义
  emits: ["start-data-preparation", "complete-preparation"],
  setup(props, { emit }) {
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
      prepareAddOperator,
      saveAndAddToWorkflow,
      addOperatorToWorkflow,
      parseParameters,
      updateParameterString,
      // 添加搜索关键词状态
      searchKeyword,
      handleSearch,
      isManageMode,
      toggleManageMode,

      // 添加算子管理相关功能
      addOperatorModalVisible,
      uploadFileList,
      newOperator,
      removeOperator,
      showAddOperatorModal,
      closeAddOperatorModal,
      beforeUpload,
      createNewOperator, // 添加这行，使用钩子中的方法
    } = useOperators();

    // 使用靶点分析钩子
    const {
      radarChartRef,
      targetData,
      selectedTargetKey,
      selectTarget,
      getIndicatorStyle,
      initRadarChart,
      addOperatorData,
      radarDataSeries,
      updateFinalTargetData,
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
      executeWorkflow: originalExecuteWorkflow,
      previewStep,
      isWorkflowCompleted,
    } = useWorkflow();

    // 使用代码预览钩子 - 新增
    const { diffHtml, generateCodeDiff } = useCodePreview();

    // 使用数据集指标钩子
    const { metrics, updateMetrics } = useDatasetMetrics();

    // 步骤编辑相关
    const stepEditModalVisible = ref(false);
    const currentEditingStepIndex = ref(-1);

    // 注册将算子添加到工作流的回调函数
    addOperatorToWorkflow.value = (operator: Operator) => {
      workflow.steps.push({
        ...operator,
        isCompleted: false,
      });
    };

    // 靶点解释数据
    const targetExplanations = reactive<Record<string, TargetExplanation>>({
      // internet 数据集指标
      configDiversity: { title: "配置项多样性", score: 0, content: "" },
      dataVolume: { title: "数据量", score: 0, content: "" },
      chartTypeBalance: { title: "图表类型均衡性", score: 0, content: "" },
      
      // energy 数据集指标（前4个）
      domainKnowledgeIntegrity: { title: "领域知识完整性", score: 0, content: "" },
      temporalFeatureCompleteness: { title: "时间特征完整性", score: 0, content: "" },
      timeGranularityCoverage: { title: "时间粒度覆盖度", score: 0, content: "" },
      sequenceStability: { title: "序列稳定性", score: 0, content: "" },
    });

    // 格式化分数
    const formatScore = (score: number) => {
      return score.toFixed(2);
    };

    // 添加一个已完成算子的跟踪数组
    const completedSteps = ref<number[]>([]);

    // 包装执行工作流方法，添加监听每个步骤完成的逻辑
    const executeWorkflow = () => {
      // 重置已完成步骤
      completedSteps.value = [];
      // 调用原始执行方法
      originalExecuteWorkflow();
      emit("start-data-preparation");
    };

    // 监听工作流步骤完成
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
            addOperatorData(operatorName, completedStepIndex);

            // 更新数据集指标
            if (workflow.steps[completedStepIndex]?.datasetSize) {
              updateMetrics(workflow.steps[completedStepIndex].datasetSize);
            }
          }
        }
      }
    );

    watch(
      () => isWorkflowCompleted.value,
      (newVal, oldVal) => {
        if (isWorkflowCompleted.value) {
          updateFinalTargetData();
        }
      }
    );

    // 修改编辑步骤函数，打开编辑弹窗
    const editStep = (index: number) => {
      if (index >= 0 && index < workflow.steps.length) {
        const step = workflow.steps[index];
        currentOperator.value = { ...step };
        parsedParams.value = parseParameters(step.parameters || "");
        stepEditModalVisible.value = true;
        currentEditingStepIndex.value = index;
      }
    };

    // 添加保存编辑后的步骤函数
    const saveEditedStep = async () => {
      try {
        // 更新参数字符串
        updateParameterString();

        // 如果索引有效，更新工作流步骤
        if (
          currentEditingStepIndex.value >= 0 &&
          currentEditingStepIndex.value < workflow.steps.length
        ) {
          // 更新工作流中的步骤
          workflow.steps[currentEditingStepIndex.value] = {
            ...currentOperator.value,
            isCompleted:
              workflow.steps[currentEditingStepIndex.value].isCompleted,
          };

          // 关闭弹窗
          stepEditModalVisible.value = false;
          currentEditingStepIndex.value = -1;

          // 显示成功消息
          message.success("算子更新成功");
        }
      } catch (error) {
        console.error("保存步骤失败", error);
        message.error("保存步骤失败");
      }
    };

    // 格式化参数字符串，使其更易读
    const formatParameters = (paramStr: string) => {
      if (!paramStr || paramStr.trim() === "") return "无参数";

      return paramStr
        .split(",")
        .map((pair) => {
          const [key, value] = pair.split(":").map((item) => item.trim());
          return `${key}: ${value}`;
        })
        .join(" ");
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

    // 修改预览步骤方法，使用新的钩子函数
    const previewStepWithDiff = (step: any) => {
      // 首先调用原有的预览方法
      previewStep(step);

      // 使用新的钩子函数生成差异
      generateCodeDiff(step);
    };

    // 添加处理完成按钮点击事件的方法
    const handleCompletePreparation = () => {
      emit("complete-preparation");
    };

    // 替换原有的previewStep引用
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
      targetExplanations,
      selectTarget,
      getIndicatorStyle,
      formatScore,

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
      previewStep: previewStepWithDiff, // 用新的预览方法替换原有方法
      formatParameters,
      radarDataSeries,
      isWorkflowCompleted,

      // 添加步骤编辑相关
      stepEditModalVisible,
      saveEditedStep,

      prepareAddOperator,
      saveAndAddToWorkflow,

      // 图像引用
      Operator1,
      Operator2,
      Operator3,
      Operator4,
      Operator5,
      Operator6,
      Operator7,
      Operator8,
      Operator9,
      Operator10,
      Operator11,
      Operator12,
      Operator13,
      Operator14,
      Operator15,
      Operator16,
      Operator17,
      Operator18,
      Operator19,
      Operator20,
      Operator21,

      // 添加搜索相关项
      searchKeyword,
      handleSearch,
      isManageMode,
      toggleManageMode,

      // 添加算子管理相关
      addOperatorModalVisible,
      uploadFileList,
      newOperator,
      removeOperator,
      showAddOperatorModal,
      closeAddOperatorModal,
      beforeUpload,
      createNewOperator,

      // 添加代码预览相关
      diffHtml,

      // 添加数据集指标相关
      metrics, // 添加数据集指标

      // 返回处理完成方法
      handleCompletePreparation,
    };
  },
});
</script>

<style lang="less" scoped>
.preparation-section {
  border-radius: 8px;
  height: 84%;
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
    height: 100%;
    flex-direction: column;
  }

  .preparation-layout {
    display: flex;
    flex: 1;
    gap: 20px;
    height: 100%;

    .left-section {
      flex: 3;
      display: flex;
      gap: 20px;

      .operator-library {
        flex: 2;
        position: relative;
        display: flex;
        flex-direction: column;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .operator-pagination {
          position: absolute;
          bottom: 15px;
          right: 15px;
        }

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

          .header-actions {
            display: flex;
            align-items: center;

            .ant-input-search {
              width: 150px;
              margin-right: 8px;
            }

            .ant-btn {
              height: 32px;
              padding: 0 12px;
              font-size: 14px;
              display: flex;
              align-items: center;

              &.active {
                color: @primary-color;
                font-weight: 500;
              }
            }
          }
        }

        .operators-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 22px;
          overflow-y: auto;
          margin-top: 10px;

          .operator-card {
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid @primary-color;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;

            .operator-name {
              font-weight: 500;
              font-size: 16px;
              margin-top: 30px;
              margin-bottom: 15px;
              color: #333;
            }

            .operator-content {
              display: flex;
              margin-bottom: 12px;
              margin-left: 15px;
              min-height: 80px;

              .operator-desc {
                flex: 1;
                color: #666;
                font-size: 14px;
                padding-right: 10px;
              }

              .operator-image {
                width: 160px;
                height: 160px;
                border-radius: 4px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: cover;
                }
              }
            }

            .operator-actions {
              width: 100%;
              height: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #ccc;
              margin-top: auto;
              cursor: pointer;

              &.disabled {
                background-color: #e0e0e0;
                color: #999;
                cursor: not-allowed;
              }
            }

            // 管理模式下的删除按钮样式
            .operator-manage-actions {
              position: absolute;
              top: 5px;
              right: 5px;
              z-index: 10;

              .ant-btn {
                width: 32px;
                height: 32px;
                padding: 0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(255, 255, 255, 0.8);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

                &:hover {
                  background-color: #ff4d4f;
                  color: #fff;
                }
              }
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
          height: 84%;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          padding: 5px 3px;
          // 隐藏滚动条
          &::-webkit-scrollbar {
            display: none;
          }

          .workflow-step {
            display: flex;
            flex-direction: column;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;

            // &::after {
            //   content: "";
            //   position: absolute;
            //   bottom: -20px;
            //   left: 50%;
            //   transform: translateX(-50%);
            //   width: 1px;
            //   height: 20px;
            //   background-color: #d9d9d9;
            //   z-index: 1;
            // }

            &:last-child::after {
              display: none;
            }

            // 倒数第二个也不展示
            &:nth-last-child(2)::after {
              display: none;
            }

            &.completed {
              border-left: 4px solid #52c41a;
            }

            .step-header {
              display: flex;
              align-items: center;
              width: 100%;
              padding: 15px;

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
            }

            .step-description {
              margin-left: 40px;
              font-size: 13px;
              color: #666;
              margin-bottom: 10px;
              line-height: 1.5;
            }
            .step-preview {
              display: flex;
              width: 100%;
              height: 40px;
              justify-content: space-between;
              align-items: center;
              background-color: #ccc;
              border-radius: 0 0 8px 8px;

              .ant-btn {
                width: 100%;
                height: 100%;
                border-radius: 0;
                cursor: pointer;
              }
            }
            .step-status {
              position: absolute;
              top: 16px;
              right: 10px;
              padding: 5px 5px;
              font-size: 12px;
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .status-icon {
                margin-right: 6px;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;

                &.completed {
                  color: #52c41a;
                }

                &.executing {
                  color: #1890ff;
                }

                &.pending {
                  color: #faad14;
                }
              }
            }

            .step-actions {
              flex-shrink: 0;
              display: flex;
              width: 100%;
              height: 40px;
              justify-content: space-between;
              align-items: center;
              background-color: #ccc;
              border-radius: 0 0 8px 8px;

              .ant-btn {
                width: 25%;
                height: 100%;
                border-radius: 0;
                cursor: pointer;
                border-right: 1px solid #aaa;
                &:last-child {
                  border-right: 0;
                }
              }
            }
          }
          .workflow-actions {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
          width: 270px;
          height: 270px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;

          // 靶心圆环
          .target-circle {
            position: absolute;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            left: 50%;
            top: 50%;

            &.circle-1 {
              width: 100%;
              height: 100%;
              background-color: rgb(169, 209, 142);
              border: 1px solid #000;
            }

            &.circle-2 {
              width: 70%;
              height: 70%;
              background-color: rgb(255, 217, 102); // 红色背景
              border: 1px solid #000;
            }

            &.circle-3 {
              width: 40%;
              height: 40%;
              background-color: rgb(192, 0, 0);
              border: 1px solid #000;
            }
          }

          // 指标点
          .target-indicator {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 5;
            cursor: pointer;
            transition: all 0.3s ease;

            // 添加悬浮提示框
            .tooltip {
              position: absolute;
              visibility: hidden;
              opacity: 0;
              width: 160px;
              background-color: rgba(0, 0, 0, 0.75);
              color: #fff;
              text-align: left;
              border-radius: 6px;
              padding: 8px 10px;
              z-index: 100;
              transition: opacity 0.3s;
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              pointer-events: none;

              &:after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.75) transparent transparent
                  transparent;
              }

              .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 14px;
              }

              .tooltip-value {
                display: flex;
                justify-content: space-between;
                margin-top: 3px;
                font-size: 12px;

                .label {
                  color: #ccc;
                }

                .value {
                  font-weight: bold;
                }
              }
            }

            .indicator-marker {
              position: relative;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              margin-bottom: 5px;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;

              // 四条边线样式
              .line-top {
                position: absolute;
                width: 2px;
                height: 7px;
                background-color: #1890ff; // 改为蓝色，与靶图颜色区分
                transition: background-color 0.3s ease;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -150%);
              }

              .line-right {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #1890ff; // 改为蓝色
                transition: background-color 0.3s ease;
                right: 50%;
                top: 50%;
                transform: translate(150%, -50%);
              }

              .line-bottom {
                position: absolute;
                width: 2px;
                height: 7px;
                background-color: #1890ff; // 改为蓝色
                transition: background-color 0.3s ease;
                bottom: 50%;
                left: 50%;
                transform: translate(-50%, 150%);
              }

              .line-left {
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #1890ff; // 改为蓝色
                transition: background-color 0.3s ease;
                left: 50%;
                top: 50%;
                transform: translate(-150%, -50%);
              }

              // 给镂空圆环添加白色背景，以确保十字被圆环遮挡
              .circle-ring {
                position: absolute;
                width: 14px;
                height: 14px;
                border: 3px solid #1890ff; // 改为蓝色边框
                border-radius: 50%;
                transition: border-color 0.3s ease;
                z-index: 1; // 确保圆环在十字前面
              }
            }

            &:hover {
              z-index: 10;

              .tooltip {
                visibility: visible;
                opacity: 1;
              }

              .indicator-marker {
                transform: scale(1.1);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #220baa; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #220baa; // 选中为青绿色边框
                }
              }
            }

            &.active {
              z-index: 10;

              .indicator-marker {
                transform: scale(1.1);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #13c2c2; // 选中为青绿色
                }

                .circle-ring {
                  border-color: #13c2c2; // 选中为青绿色边框
                }
              }
            }

            &.original {
              .indicator-marker {
                opacity: 0.6;
                transform: scale(0.8);

                .line-top,
                .line-right,
                .line-bottom,
                .line-left {
                  background-color: #aaa; // 灰色表示原始数据
                }

                .circle-ring {
                  border-color: #aaa; // 灰色表示原始数据
                }
              }

              &:hover {
                .tooltip {
                  display: none; // 原始点不显示悬浮信息，避免混淆
                }
              }
            }

            &.current {
              z-index: 6; // 确保当前点在原始点上面

              .indicator-marker {
                &.active {
                  transform: scale(1.1);

                  .line-top,
                  .line-right,
                  .line-bottom,
                  .line-left {
                    background-color: #13c2c2; // 选中为青绿色
                  }

                  .circle-ring {
                    border-color: #13c2c2; // 选中为青绿色边框
                  }
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

  .step-params {
    padding: 0 15px 10px;
    font-size: 13px;
    color: #666;

    .params-title {
      font-weight: 500;
      margin-bottom: 3px;
    }

    .params-content {
      background-color: #f5f5f5;
      padding: 5px 8px;
      border-radius: 4px;
      font-family: "Courier New", monospace;
      white-space: pre-wrap;
    }
  }

  .preview-diff {
    :deep(.preview-image) {
      margin: 10px auto;
      display: block;
      max-width: 100%;
    }

    :deep(.image-preview-container) {
      background-color: #f9f9f9;
      border-radius: 4px;
      margin-bottom: 10px;
    }
  }
  .step-cost-evaluation {
    padding: 0 15px 10px;
    font-size: 13px;
    color: #666;

    .evaluation-title {
      font-weight: 500;
      margin-bottom: 3px;
    }

    .evaluation-content {
      background-color: #f5f5f5;
      padding: 5px 8px;
      border-radius: 4px;
      font-family: "Courier New", monospace;

      .evaluation-item {
        display: flex;
        justify-content: flex-start;
        margin: 3px 0;

        .evaluation-label {
          color: #666;
        }

        .evaluation-value {
          font-weight: 500;
        }
      }
    }
  }

  .target-analysis {
    flex: 1;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    position: relative; /* 确保相对定位 */

    .section-header {
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: @primary-color;
      }
    }

    // 添加悬浮按钮样式
    .floating-next-button {
      position: absolute;
      bottom: 16px;
      right: 16px;
      z-index: 10;

      .ant-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 8px 16px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}

.empty-params {
  text-align: center;
  color: #999;
  padding: 30px 0 10px;
}

:global(.preview-diff) {
  margin-top: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  max-height: 500px;

  .d2h-code-side-linenumber {
    position: relative;
  }
}
</style>
