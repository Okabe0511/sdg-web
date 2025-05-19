import axios from "axios";
import { message } from "ant-design-vue";
import { store } from "/@/store";
import router from "/@/router";
import { globalData } from "/@/setting/global";

axios.defaults.headers["Content-Type"] = "application/json";
let config = {
  baseURL: globalData.apiUrl,
  timeout: 60 * 1000,
};

const http = axios.create(config);

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("TOKEN");

    if (token) {
      config.headers.Token = token;
    }

    return config;
  },
  (error) => {
    // 拦截axios错误
    if (error instanceof axios.Cancel) return;
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    // 处理新的响应格式
    const responseData = response.data;
    if (responseData.code === 0) {
      const data = { dataList: responseData.data, headers: {} };
      return Promise.resolve({
        data: Object.keys(data.headers).length ? data : responseData.data,
        status: responseData.code,
        headers: response.headers,
        statusText: responseData.message,
        config: response.config,
        request: response.request,
      });
    } else {
      if (responseData.code === 401) {
        message.error("登录已失效");
        router.push(`/login`);
      } else if (responseData.code === 403) {
        message.error("权限不足");
      } else if (responseData.code === 404) {
        message.error("请求路径或数据不存在");
      } else if (responseData.code === 500) {
        message.error("网络错误");
      } else if (responseData.code === undefined) {
        // 排除不能识别code的blob格式报错
        if (!(responseData.data instanceof Blob)) {
          message.error("网络错误");
        }
      } else {
        message.error("网络错误");
      }
    }

    return Promise.reject({
      data: responseData,
      status: responseData.code,
    });
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

/**
 * 获取token
 * @param response
 */
export const getToken = (token: string) => {
  if (token) {
    localStorage.setItem("TOKEN", token);
    store.commit("setToken", token);
  }
};

export default http;
