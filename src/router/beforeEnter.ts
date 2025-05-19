import { store } from "/@/store";

/**
 * 登录跳转拦截器
 * @param to 起始路径
 * @param from 目标路径
 * @param next 跳转函数
 */

export const beforeEnter = (to: any, from: any, next: Function) => {
  const lowerCasePath = from.fullPath.toLowerCase();
  next();
};
