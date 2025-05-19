import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  getTaskList,
  deleteTask as deleteTaskApi,
} from "/@/serve/api/preparation";
import { message } from "ant-design-vue";

// 定义任务状态类型
export type TaskStatus = "completed" | "running" | "unconfigured";
export type TabType = "all" | TaskStatus;

// 定义任务接口
export interface Task {
  id: number;
  name: string;
  createTime: string;
  fileCount: number;
  dataCount: number;
  status: TaskStatus;
}

/**
 * 任务列表相关钩子函数
 * @returns 任务列表相关状态和方法
 */
export const useTaskList = () => {
  const router = useRouter();
  const activeTab = ref<TabType>("all");
  const searchValue = ref("");
  const taskList = ref<Task[]>([]);
  const loading = ref(false);

  // 获取任务列表
  const fetchTaskList = async () => {
    loading.value = true;
    try {
      const res = await getTaskList();
      taskList.value = res.data;
    } catch (error) {
      console.error("获取任务列表失败", error);
      message.error("获取任务列表失败");
    } finally {
      loading.value = false;
    }
  };

  // 初始加载数据
  fetchTaskList();

  // 过滤任务列表
  const filteredTaskList = () => {
    return taskList.value.filter((task) => {
      // 根据标签过滤
      if (activeTab.value !== "all" && task.status !== activeTab.value) {
        return false;
      }
      // 根据搜索关键词过滤
      if (
        searchValue.value &&
        !task.name.toLowerCase().includes(searchValue.value.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  };

  // 切换标签
  const handleTabChange = (tab: TabType) => {
    activeTab.value = tab;
  };

  // 查看任务详情
  const viewTaskDetail = (id: number) => {
    router.push(`/home/detail/${id}`);
  };

  // 删除任务
  const deleteTask = async (id: number) => {
    try {
      await deleteTaskApi(id);
      message.success("删除任务成功");
      // 重新获取列表
      fetchTaskList();
    } catch (error) {
      console.error("删除任务失败", error);
      message.error("删除任务失败");
    }
  };

  // 添加新任务
  const addNewTask = () => {
    router.push("/home/create");
  };

  return {
    activeTab,
    searchValue,
    taskList,
    loading,
    filteredTaskList,
    handleTabChange,
    viewTaskDetail,
    deleteTask,
    addNewTask,
    fetchTaskList,
  };
};
