import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ant from "ant-design-vue";
import { store } from "./store";
import { setupGlobDirectives } from "/@/directives";
// 引入 TDesign 组件
import TDesignChat from "@tdesign-vue-next/chat"; // 引入chat组件

import "ant-design-vue/dist/reset.css";
import "/@/assets/styles/views/app.less";
import "/@/assets/styles/ant/base.less";
import "/@/assets/styles/base/global.less";
// 引入 TDesign 样式
import "@tdesign-vue-next/chat/es/style/index.css"; // 引入chat组件的少量全局样式变量

const app = createApp(App);
// Register global directive
setupGlobDirectives(app);

app.use(router).use(store).use(ant).use(TDesignChat).mount("#app");
