<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  reactive,
  provide,
  nextTick,
  watch,
  computed,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import Aside from "/@/components/Aside/index.vue";
import Header from "/@/components/Header/index.vue";
import Router from "/@/views/router.vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export default defineComponent({
  name: "App",

  components: {
    Aside,
    Header,
    Router,
  },

  setup() {
    const store = useStore();
    const router = useRouter();

    // 修改登出处理函数
    const handleLogout = () => {
      store.dispatch("logout").then(() => {
        message.success("退出登录成功");
        router.push("/login");
      });
    };

    const showAside = ref(true);

    const scrollRootRef: any = ref(null);

    const rect = reactive({
      scrollTop: 0,
    });

    provide("scrollRootRect", rect);

    const handleScroll = () => {
      rect.scrollTop = scrollRootRef.value?.scrollTop;
    };

    onMounted(() => {
      document
        .querySelector(".layout-container")
        ?.setAttribute(
          "style",
          `min-width: ${window.screen.width}px;overflow-x: hidden`
        );

      window.addEventListener("resize", () => {
        document
          .querySelector(".layout-container")
          ?.setAttribute(
            "style",
            `min-width: ${window.screen.width}px;overflow-x: hidden`
          );
      });
    });

    onUnmounted(() => {
      window.removeEventListener("resize", () => {});
    });

    watch(
      () => store.state.extraRoute,
      (val) => {
        showAside.value = false;
        nextTick(() => {
          showAside.value = true;
        });
      }
    );

    // 侧边栏展开状态
    const isCollapsed = ref(false);
    const siderWidth = computed(() => (isCollapsed.value ? "64px" : "218px"));
    const contentWidth = computed(() => `calc(100% - ${siderWidth.value})`);
    const showLogo = computed(() => !isCollapsed.value);

    // 处理侧边栏折叠状态变化
    const handleCollapseChange = (collapsed: boolean) => {
      isCollapsed.value = collapsed;
    };

    return {
      showAside,
      locale: zhCN,
      handleLogout,
      handleScroll,
      scrollRootRef,
      // 新增
      siderWidth,
      contentWidth,
      showLogo,
      handleCollapseChange,
      siderCollapsed: isCollapsed,
    };
  },
});
</script>

<template>
  <!-- filepath: d:\project\web\domain-data-preparation-system\src\views\layout\index.vue -->
  <a-config-provider :locale="locale">
    <section class="layout-container">
      <a-layout-sider
        :trigger="null"
        collapsible
        :collapsed="siderCollapsed"
        :width="siderCollapsed ? 64 : 218"
      >
        <div class="logo" :class="{ 'logo-collapsed': siderCollapsed }">
          <!-- 动态显示文字内容 -->
          <h1 class="logo-text" v-if="!siderCollapsed">领域数据制备系统</h1>
          <!-- 窄侧边栏显示图标 -->
          <Icon v-else name="data-panel_line" color="#fff" :size="28" />
        </div>
        <Aside v-if="showAside" @collapse-change="handleCollapseChange" />
      </a-layout-sider>
      <section
        class="content-box"
        :style="{ width: `calc(100% - ${siderCollapsed ? '64px' : '218px'})` }"
      >
        <a-layout-header class="header-container">
          <Header @logout="handleLogout" />
        </a-layout-header>
        <div ref="scrollRootRef" class="content" @scroll="handleScroll">
          <Router />
        </div>
      </section>
    </section>
  </a-config-provider>
</template>

<style lang="less" scoped>
/* 添加全局CSS变量来控制侧边栏宽度 */
:root {
  --aside-width: 218px;
}

.layout-container {
  height: 100%;
  display: flex;
  flex: auto;
  flex-direction: row;

  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: rgba(24, 144, 255, 1);
    }
  }

  .logo {
    padding: 22px 15px 0;
    margin-bottom: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;

    // 新增logo文本样式
    .logo-text {
      color: @white-color;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      line-height: 24px;
      letter-spacing: 1px;
      white-space: nowrap;
      // 添加文本渐变效果
      background: rgb(240, 254, 255, 1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      // 添加文本阴影效果增强可读性
      text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
      transition: all 0.3s;
    }

    &-collapsed {
      padding: 22px 10px 0;
      margin-bottom: 20px;
    }
  }
}

.content-box {
  background-color: rgba(238, 238, 238, 1);
  display: flex;
  flex: auto;
  flex-direction: column;
  min-height: 0;
  /* 将固定宽度改为动态计算 */
  width: calc(100% - var(--aside-width));
  transition: all 0.3s;

  .header-container {
    line-height: 64px;
    height: 60px;
    background: rgba(255, 255, 255, 1);
    padding: 0;
  }

  .content {
    overflow: auto;
  }
}

.ant-layout-sider {
  background-color: rgba(40, 49, 67, 1);
}

.title {
  color: rgba(37, 37, 37, 1);
  font-weight: 600;
  font-size: 22px;
  line-height: 30px;
  margin-bottom: 20px;
  .flex-type(start);

  &::before {
    position: relative;
    left: 0;
    margin-right: 12px;
    background-color: @primary-color;
    content: "";
    .set-size(4px, 20px);
  }
}
</style>
