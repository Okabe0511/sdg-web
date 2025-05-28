<template>
  <a-modal
    v-model:visible="visible"
    title="创建数据制备任务"
    width="700px"
    :maskClosable="false"
    :closable="false"
    :footer="null"
    centered
  >
    <div class="task-config-form">
      <a-form :model="formState" layout="vertical" :rules="rules" ref="formRef">
        <!-- 任务名称 -->
        <a-form-item label="任务名称" name="taskName" required>
          <a-input
            v-model:value="formState.taskName"
            placeholder="请输入任务名称"
          />
        </a-form-item>

        <!-- 数据集类型选择 -->
        <a-form-item label="数据集分类" name="datasetType" required>
          <a-radio-group
            v-model:value="formState.datasetType"
            @change="onDatasetTypeChange"
          >
            <a-radio value="basic">基础数据集</a-radio>
            <a-radio value="cross-modal">跨模态数据集</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 基础数据集配置 -->
        <div v-if="formState.datasetType === 'basic'" class="dataset-config">
          <a-form-item label="数据集类型" name="basicDatasetType" required>
            <a-select
              v-model:value="formState.basicDatasetType"
              :getPopupContainer="(node) => node.parentNode"
              placeholder="请选择数据集类型"
              style="width: 100%"
            >
              <a-select-option
                v-for="type in datasetTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            label="上传数据集"
            name="basicDatasetFile"
            :rules="[
              {
                required: true,
                validator: validateFileUpload('basic'),
                trigger: 'change',
              },
            ]"
          >
            <a-upload
              v-model:file-list="fileList.basic"
              :beforeUpload="() => false"
              :maxCount="1"
              @remove="() => clearFiles('basic')"
              action=""
            >
              <a-button v-if="fileList.basic.length === 0">
                <upload-outlined />
                选择文件
              </a-button>
            </a-upload>
          </a-form-item>
        </div>

        <!-- 跨模态数据集配置 -->
        <div
          v-if="formState.datasetType === 'cross-modal'"
          class="cross-modal-config"
        >
          <!-- 第一个数据集 -->
          <div class="dataset-upload-section">
            <h4>数据集 A</h4>
            <a-form-item label="数据集类型" name="crossModalTypeA" required>
              <a-select
                v-model:value="formState.crossModalTypeA"
                :getPopupContainer="(node) => node.parentNode"
                placeholder="请选择数据集类型"
                style="width: 100%"
              >
                <a-select-option
                  v-for="type in datasetTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item
              label="上传数据集"
              name="datasetFileA"
              :rules="[
                {
                  required: true,
                  validator: validateFileUpload('datasetA'),
                  trigger: 'change',
                },
              ]"
            >
              <a-upload
                v-model:file-list="fileList.datasetA"
                :beforeUpload="() => false"
                :maxCount="1"
                @remove="() => clearFiles('datasetA')"
                action=""
              >
                <a-button v-if="fileList.datasetA.length === 0">
                  <upload-outlined />
                  选择文件
                </a-button>
              </a-upload>
            </a-form-item>
          </div>

          <!-- 第二个数据集 -->
          <div class="dataset-upload-section">
            <h4>数据集 B</h4>
            <a-form-item label="数据集类型" name="crossModalTypeB" required>
              <a-select
                v-model:value="formState.crossModalTypeB"
                :getPopupContainer="(node) => node.parentNode"
                placeholder="请选择数据集类型"
                style="width: 100%"
              >
                <a-select-option
                  v-for="type in datasetTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item
              label="上传数据集"
              name="datasetFileB"
              :rules="[
                {
                  required: true,
                  validator: validateFileUpload('datasetB'),
                  trigger: 'change',
                },
              ]"
            >
              <a-upload
                v-model:file-list="fileList.datasetB"
                :beforeUpload="() => false"
                :maxCount="1"
                @remove="() => clearFiles('datasetB')"
                action=""
              >
                <a-button v-if="fileList.datasetB.length === 0">
                  <upload-outlined />
                  选择文件
                </a-button>
              </a-upload>
            </a-form-item>
          </div>

          <!-- 元数据 -->
          <div class="dataset-upload-section">
            <h4>元数据（数据集关系）</h4>
            <a-form-item
              label="上传元数据"
              name="metadataFile"
              :rules="[
                {
                  required: true,
                  validator: validateFileUpload('metadata'),
                  trigger: 'change',
                },
              ]"
            >
              <a-upload
                v-model:file-list="fileList.metadata"
                :beforeUpload="() => false"
                :maxCount="1"
                @remove="() => clearFiles('metadata')"
                action=""
              >
                <a-button v-if="fileList.metadata.length === 0">
                  <upload-outlined />
                  选择文件
                </a-button>
              </a-upload>
            </a-form-item>
          </div>
        </div>

        <!-- 提交按钮 -->
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="onSubmit" :loading="loading"
              >完成</a-button
            >
            <a-button @click="onCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from "vue";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

// 定义文件列表的键类型
type FileListKey = "basic" | "datasetA" | "datasetB" | "metadata";

// 定义数据集类型
interface DatasetTypeOption {
  label: string;
  value: string;
}

export default defineComponent({
  components: {
    UploadOutlined,
    DeleteOutlined,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "submit", "cancel"],
  setup(props, { emit }) {
    const formRef = ref();
    const loading = ref(false);

    // 数据集类型配置 - 抽离为独立配置，方便管理
    const datasetTypes = ref<DatasetTypeOption[]>([
      { label: "关系表", value: "relation" },
      { label: "文本", value: "text" },
      { label: "图像", value: "image" },
      { label: "语音", value: "audio" },
      { label: "适配", value: "adapter" },
      { label: "图数据", value: "graph" },
      { label: "程序代码", value: "code" },
    ]);

    // 表单状态
    const formState = reactive({
      taskName: "",
      datasetType: "basic", // basic 或 cross-modal
      basicDatasetType: undefined,
      crossModalTypeA: undefined,
      crossModalTypeB: undefined,
    });

    // 文件列表
    const fileList = reactive({
      basic: [],
      datasetA: [],
      datasetB: [],
      metadata: [],
    });

    // 表单验证规则
    const rules = {
      taskName: [
        { required: true, message: "请输入任务名称", trigger: "blur" },
      ],
      basicDatasetType: [
        { required: true, message: "请选择数据集类型", trigger: "change" },
      ],
      crossModalTypeA: [
        { required: true, message: "请选择数据集A类型", trigger: "change" },
      ],
      crossModalTypeB: [
        { required: true, message: "请选择数据集B类型", trigger: "change" },
      ],
    };

    // 数据集类型变更处理
    const onDatasetTypeChange = () => {
      // 重置相关字段
      if (formState.datasetType === "basic") {
        formState.crossModalTypeA = undefined;
        formState.crossModalTypeB = undefined;
        fileList.datasetA = [];
        fileList.datasetB = [];
        fileList.metadata = [];
      } else {
        formState.basicDatasetType = undefined;
        fileList.basic = [];
      }
    };

    // 清空指定类型的文件列表
    const clearFiles = (type: FileListKey) => {
      fileList[type] = [];
    };

    // 文件上传验证器
    const validateFileUpload = (fileType: FileListKey) => {
      return (_rule: any, _value: any, callback: (error?: string) => void) => {
        if (fileType === "basic" && formState.datasetType === "basic") {
          // 只验证当前选中的数据集类型
          if (fileList.basic.length === 0) {
            callback("请上传数据集文件");
          } else {
            callback();
          }
        } else if (formState.datasetType === "cross-modal") {
          // 跨模态数据集验证
          if (fileType === "datasetA" && fileList.datasetA.length === 0) {
            callback("请上传数据集A文件");
          } else if (
            fileType === "datasetB" &&
            fileList.datasetB.length === 0
          ) {
            callback("请上传数据集B文件");
          } else if (
            fileType === "metadata" &&
            fileList.metadata.length === 0
          ) {
            callback("请上传元数据文件");
          } else {
            callback();
          }
        } else {
          // 不是当前选中的数据集类型，直接通过验证
          callback();
        }
      };
    };

    // 提交表单
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          // 检查文件是否上传 - 这部分逻辑保留作为双重保障
          if (
            formState.datasetType === "basic" &&
            fileList.basic.length === 0
          ) {
            return message.error("请上传基础数据集文件");
          }

          if (formState.datasetType === "cross-modal") {
            if (fileList.datasetA.length === 0) {
              return message.error("请上传数据集A文件");
            }
            if (fileList.datasetB.length === 0) {
              return message.error("请上传数据集B文件");
            }
            if (fileList.metadata.length === 0) {
              return message.error("请上传元数据文件");
            }
          }

          loading.value = true;

          // 构建提交数据
          const submitData = {
            taskName: formState.taskName,
            datasetType: formState.datasetType,
            files: {},
          };

          if (formState.datasetType === "basic") {
            submitData.files = {
              type: formState.basicDatasetType,
              dataset: fileList.basic,
            };
          } else {
            submitData.files = {
              datasetA: {
                type: formState.crossModalTypeA,
                files: fileList.datasetA,
              },
              datasetB: {
                type: formState.crossModalTypeB,
                files: fileList.datasetB,
              },
              metadata: fileList.metadata,
            };
          }

          // 发送事件
          emit("submit", submitData);

          // 模拟后端响应
          setTimeout(() => {
            loading.value = false;
            // 关闭弹窗
            emit("update:visible", false);
          }, 1000);
        })
        .catch((error: any) => {
          console.log("表单验证失败", error);
        });
    };

    // 取消
    const onCancel = () => {
      emit("cancel");
      emit("update:visible", false);
    };

    // 监听文件列表变化，触发表单验证
    watch(
      fileList,
      (newVal) => {
        // 延迟验证，避免过早触发
        setTimeout(() => {
          if (formRef.value) {
            if (formState.datasetType === "basic") {
              formRef.value.validateFields(["basicDatasetFile"]);
            } else {
              formRef.value.validateFields([
                "datasetFileA",
                "datasetFileB",
                "metadataFile",
              ]);
            }
          }
        }, 100);
      },
      { deep: true }
    );

    return {
      formRef,
      formState,
      fileList,
      rules,
      loading,
      datasetTypes,
      validateFileUpload, // 新增自定义验证器
      onDatasetTypeChange,
      clearFiles,
      onSubmit,
      onCancel,
    };
  },
});
</script>

<style lang="less" scoped>
.task-config-form {
  padding: 0 20px;

  .dataset-config,
  .cross-modal-config {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .cross-modal-config {
    .dataset-upload-section {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #eaeaea;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      h4 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #333;
        font-size: 16px;
      }
    }
  }

  :global(.ant-select-dropdown) {
    position: absolute !important;
    top: 40px !important;
    left: 0 !important;
  }

  /* 添加上传提示样式 */
  .upload-hint {
    font-size: 12px;
    color: #666;
    padding: 4px 8px;
  }
}
</style>
