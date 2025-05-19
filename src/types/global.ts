/**
 * 分页数据
 */
export interface IPagination {
  /**
   * 分页页码
   */
  page?: number;
  /**
   * 分页大小
   */
  pageSize?: number;
}

/**
 * 列表数据
 */
export interface IListData<T> {
  /**
   * 列表
   */
  dataList: Array<T>;
  /**
   * 查询总条数
   */
  total: number;
}

/**
 * 导出数据
 */
export interface IExportData {
  /**
   * 导出内容
   */
  data: Blob;
  /**
   * 导出名称
   */
  contentDisposition?: string;
}

/**
 * 请求错误数据
 */
export interface IResErrorData {
  /**
   * 错误码
   */
  code?: string;
  /**
   * 错误提示
   */
  message?: string;
}

/**
 * 请求状态枚举
 * @key 枚举属性：PENDING 初始态（结束态） | ONGOING 进行中
 */
export enum RequestStatusEnum {
  /**
   * 初始态（结束态）
   */
  PENDING,
  /**
   * 进行中
   */
  ONGOING,
}

/**
 * 数组项类型
 */
export type InArray<T> = T extends Array<any> ? T[number] : T;
