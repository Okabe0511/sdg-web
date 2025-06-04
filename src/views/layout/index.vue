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
      <section class="content-box">
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
.layout-container {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex: auto;
  flex-direction: row;
}

.content-box {
  background-color: rgba(238, 238, 238, 1);
  display: flex;
  flex: auto;
  flex-direction: column;
  min-height: 0;
  width: 100%;

  .header-container {
    line-height: 64px;
    height: 60px;
    background: rgba(255, 255, 255, 1);
    padding: 0;
  }

  .content {
    overflow: hidden;
    height: 100%;
  }
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
