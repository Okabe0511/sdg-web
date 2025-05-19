<template>
  <div class="header">
    <div class="crumbs">
      <template v-if="paths.length > 1">
        <div class="crumbs-back" @click="handleBack">
          <img src="../../assets/images/header/left-arrow.png" />
          <div>返回</div>
        </div>
        <div class="crumbs-title">
          <template v-for="(pathItem, index) in paths" :key="index">
            <div class="crumbs-title-item" @click="handleNavigate(index)">
              {{ getRouteName(pathItem) }}
            </div>
            <img
              v-if="getRouteName(pathItem) && index !== paths.length - 1"
              src="../../assets/images/header/right-arrow.png"
            />
          </template>
        </div>
      </template>
      <template v-else-if="paths.length === 1">
        <div class="crumbs-single-title">
          {{ getRouteName(paths[0]) }}
        </div>
      </template>
      <template v-else>
        <div class="crumbs-single-title">
          {{ router.currentRoute.value.name }}
        </div>
      </template>
    </div>
    <div class="operation">
      <a-dropdown>
        <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
          <a-avatar>
            <template #icon>
              <img src="../../assets/images/default-avatar.png" />
            </template>
          </a-avatar>
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="handleLogout">退出登录</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { UserOutlined, DownOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { crumbPaths } from "/@/router";
import { useStore } from "vuex";
import { Modal } from "ant-design-vue";

export default defineComponent({
  components: { UserOutlined, DownOutlined },

  props: {},

  emits: ["logout"],

  setup(_, { emit }) {
    const store = useStore();
    const regionLevel: number = Number(store.state.regionLevel);
    const showTooltip = ref(localStorage.getItem("showQATooltip") === "true");
    const router = useRouter();
    const isShowButton =
      localStorage.getItem("SuperMangerProfileType") === "SUPER_ADMIN";

    const handleCloseTooltip = () => {
      localStorage.setItem("showQATooltip", "false");
      showTooltip.value = false;
    };

    const handleLogout = () => {
      emit("logout");
    };

    const paths = computed(() => {
      return crumbPaths.value;
    });

    const handleBack = () => {
      const lastPage = paths.value.slice(-2)[0];
      router.push(lastPage.path);
    };

    const handleNavigate = (index: number) => {
      if (index < paths.value.length - 1) {
        const targetPage = paths.value[index];
        router.push(targetPage.path);
      }
    };

    const getRouteName = (r: any) => {
      return r?.meta?.name ?? r.name;
    };

    const handleGoQA = () => {
      router.push("/projectManager/project/list");
    };

    return {
      showTooltip,
      paths,
      handleCloseTooltip,
      handleLogout,
      handleBack,
      handleNavigate,
      handleGoQA,
      isShowButton,
      router,
      getRouteName,
    };
  },
});
</script>

<style lang="less" scoped>
.header {
  .flex-type(space-between);
}

.operation {
  .flex-type();
  &-tooltip {
    margin-right: 25px;

    &__content {
      .flex-type(space-between);

      > span {
        user-select: none;
      }

      &-close-icon {
        cursor: pointer;
        padding: 5px 0 5px 5px;
        box-sizing: content-box;
        .set-size(12px);

        &:hover {
          .set-size(15px);
        }
      }
    }
  }
}

.crumbs {
  margin-left: 50px;
  .flex-type();

  &-back {
    color: @primary-color;
    font-size: 18px;
    line-height: 25px;
    height: 30px;
    padding-right: 20px;
    border-right: 2px solid rgba(238, 238, 238, 1);
    cursor: pointer;
    .flex-type();

    img {
      margin-right: 4px;
      .set-size(40px);
    }
  }

  &-title {
    font-size: 16px;
    margin-left: 20px;
    .flex-type();

    img {
      margin-right: 10px;
      .set-size(20px);
    }

    &-item {
      &:last-child {
        color: @primary-color;
      }

      &:not(:last-child) {
        cursor: pointer;
        margin-right: 10px;
      }
    }
  }

  &-single-title {
    color: @primary-color;
    font-size: 18px;
  }
}

.ant-dropdown-menu {
  position: relative;
  left: -20px;
  background-color: @white-color;
  .set-size(108px,114px);
  .flex-type(center);
}

:deep(.ant-dropdown-menu-item) {
  width: 100%;
  font-size: 16px;
  line-height: 44px;
  text-align: center;

  &:hover {
    background-color: rgba(0, 155, 164, 0.2);
  }
}

.ant-dropdown-link {
  margin-right: 60px;
}

.ant-avatar {
  margin-right: 10px;
}

.instruction-btn {
  cursor: pointer;
  margin-right: 40px;
  .set-size(36px);
}
</style>
