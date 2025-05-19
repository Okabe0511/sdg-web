import { reactive } from 'vue';

export const useGlobalTable = () => {
  const globalOptions = reactive({
    scroll: { y: document.body.clientHeight - 300 },
  });

  const basePagination = {
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
    pageSizeOptions: ['5', '10', '15', '20'],
    showTotal: (total: number) => `共 ${total} 条记录`,
  };

  return { globalOptions, basePagination };
};
