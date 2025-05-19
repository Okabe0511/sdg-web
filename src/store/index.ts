import { createStore } from "vuex";
import router from "../router";

interface State {
  token: string;
}

export const store = createStore({
  state() {
    return {
      token: localStorage.getItem("token") || "",
    };
  },

  mutations: {
    // 设置token
    setToken(state, token: string) {
      state.token = token;
      localStorage.setItem("token", token);
    },

    // 清除token
    clearToken(state) {
      state.token = "";
      localStorage.removeItem("token");
    },

    // 清除路由
    clearExtraRoute(state) {
      // 空实现，已经在beforeEnter.ts中使用
    },
  },

  actions: {
    // 登出
    logout({ commit }) {
      commit("clearToken");
      router.push("/login");
    },
  },
});
