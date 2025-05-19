<template>
  <div class="aside-container">
    <!-- 折叠/展开按钮 -->
    <div class="collapse-button" @click="toggleCollapse">
      <menu-unfold-outlined v-if="collapsed" />
      <menu-fold-outlined v-else />
    </div>

    <div class="menu" :class="{ 'menu-collapsed': collapsed }">
      <!-- 一级菜单 -->
      <template v-for="menuItem in filteredMenuList" :key="menuItem.path">
        <div
          :class="`menu-item parent-item ${
            isMenuActive(menuItem)
              ? menuItem.children && menuItem.children.length
                ? 'parent-item--open'
                : 'parent-item--active'
              : ''
          }`"
          @click="handleClick(menuItem, menuItem.path)"
        >
          <div class="parent-box">
            <div class="icon">
              <Icon
                :name="handleGetIconName(menuItem.path)"
                :color="
                  isMenuActive(menuItem)
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(169, 173, 180, 1)'
                "
                :size="20"
              />
            </div>
            <span v-show="!collapsed">{{ menuItem.name }}</span>
          </div>
          <div v-if="hasChildren(menuItem) && !collapsed" class="arrow">
            <CaretUpFilled v-if="isMenuExpanded(menuItem)" />
            <CaretDownFilled v-else />
          </div>
        </div>

        <!-- 当菜单展开且有子菜单时显示子菜单 -->
        <div
          v-if="hasChildren(menuItem) && !collapsed"
          :class="`child-box ${
            isMenuExpanded(menuItem) ? 'child-box-show' : ''
          }`"
        >
          <template
            v-for="childMenuItem in getVisibleChildren(menuItem)"
            :key="childMenuItem.path"
          >
            <div
              :class="`menu-item child-item ${
                isMenuActive(childMenuItem)
                  ? hasChildren(childMenuItem)
                    ? 'child-item--open'
                    : 'child-item--active'
                  : ''
              }`"
              @click="
                handleClick(
                  childMenuItem,
                  `${menuItem.path}/${childMenuItem.path}`
                )
              "
            >
              <div class="child-box-content">
                <span>{{ getName(childMenuItem) }}</span>
                <div v-if="hasChildren(childMenuItem)" class="arrow">
                  <CaretUpFilled v-if="isMenuExpanded(childMenuItem)" />
                  <CaretDownFilled v-else />
                </div>
              </div>
            </div>

            <!-- 递归渲染三级菜单 -->
            <div
              v-if="hasChildren(childMenuItem)"
              :class="`child-box ${
                isMenuExpanded(childMenuItem) ? 'child-box-show' : ''
              }`"
            >
              <template
                v-for="grandChildMenuItem in getVisibleChildren(childMenuItem)"
                :key="grandChildMenuItem.path"
              >
                <div
                  :class="`menu-item child-item child-item--grand  ${
                    isMenuActive(grandChildMenuItem) ? 'child-item--active' : ''
                  }`"
                  @click="
                    handleClick(
                      grandChildMenuItem,
                      `${menuItem.path}/${childMenuItem.path}/${grandChildMenuItem.path}`
                    )
                  "
                >
                  {{ getName(grandChildMenuItem) }}
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- 悬浮提示 - 当侧边栏折叠时显示 -->
    <div v-if="collapsed" class="tooltip-container">
      <div
        v-for="menuItem in filteredMenuList"
        :key="menuItem.path"
        class="tooltip-trigger"
        @mouseenter="showTooltip(menuItem)"
        @mouseleave="hideTooltip"
      >
        <a-tooltip
          :title="menuItem.name"
          placement="right"
          :visible="hoveredMenu === menuItem.name"
        >
          <div class="tooltip-placeholder"></div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// filepath: d:\project\web\domain-data-preparation-system\src\components\Aside\index.vue
import {
  defineComponent,
  computed,
  watch,
  onMounted,
  reactive,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import {
  CaretUpFilled,
  CaretDownFilled,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons-vue";
import Icon from "../Icon/index.vue";
import ASIDE_ICON_MAP from "./icon";
import { routes as baseRoutes } from "/@/router";

export default defineComponent({
  components: {
    CaretUpFilled,
    CaretDownFilled,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    Icon,
  },

  // 添加 emits 声明
  emits: ["collapse-change"],

  setup(props, { emit }) {
    const router = useRouter();
    const currentPath = computed(() => router.currentRoute.value.path);

    // 侧边栏折叠状态
    const collapsed = ref(false);

    // 当前悬浮的菜单项
    const hoveredMenu = ref("");

    // 存储展开的菜单项
    const expandedMenus = reactive(new Set());

    // 存储当前激活页面的完整路径数组
    const activeItemArray = reactive<string[]>([]);

    // 切换侧边栏折叠状态
    const toggleCollapse = () => {
      collapsed.value = !collapsed.value;

      // 通过事件通知父组件侧边栏状态变化
      emit("collapse-change", collapsed.value);
    };

    // 显示提示
    const showTooltip = (menuItem: any) => {
      hoveredMenu.value = menuItem.name;
    };

    // 隐藏提示
    const hideTooltip = () => {
      hoveredMenu.value = "";
    };

    // 过滤后的菜单列表
    const filteredMenuList = computed(() => {
      // 获取管理后台路由
      const managerRoutes = baseRoutes.find(
        (route) => route.name === "领域数据制备管理后台"
      );
      if (!managerRoutes || !managerRoutes.children) return [];

      // 返回需要显示的菜单项
      return managerRoutes.children.filter((item) => {
        // 过滤掉需要隐藏的菜单项
        return !item.meta?.hide;
      });
    });

    /** 获取菜单的可见子项 */
    const getVisibleChildren = (menuItem: any) => {
      if (!menuItem.children) return [];
      return menuItem.children.filter((item: any) => !item.meta?.hide);
    };

    /** 判断菜单项是否处于激活状态 */
    const isMenuActive = (menuItem: any) => {
      return activeItemArray.includes(menuItem.name);
    };

    /** 判断菜单项是否展开 */
    const isMenuExpanded = (menuItem: any) => {
      return expandedMenus.has(menuItem.name);
    };

    /** 处理侧边栏点击事件 */
    const handleClick = (menu: any, path: string) => {
      // 如果菜单已折叠，点击一级菜单时直接跳转到对应路由或展开菜单
      if (collapsed.value) {
        if (menu.redirect) {
          router.push(menu.redirect);
          return;
        }

        if (!hasChildren(menu)) {
          router.push(path.startsWith("/") ? path : `/${path}`);
          return;
        }

        // 如果有子菜单，则展开侧边栏
        collapsed.value = false;
        document.documentElement.style.setProperty("--aside-width", "218px");
        expandedMenus.add(menu.name);
        return;
      }

      // 常规逻辑保持不变
      if (hasChildren(menu)) {
        const visibleChildren = getVisibleChildren(menu);
        if (visibleChildren.length > 0) {
          if (expandedMenus.has(menu.name)) {
            expandedMenus.delete(menu.name);
          } else {
            expandedMenus.add(menu.name);
          }
        } else if (menu.redirect) {
          router.push(menu.redirect);
        } else {
          router.push(path.startsWith("/") ? path : `/${path}`);
        }
      } else {
        router.push(path.startsWith("/") ? path : `/${path}`);
      }
    };

    /** 获取菜单项名称 */
    const getName = (menuItem: { name: string; meta?: { name: string } }) => {
      return menuItem.meta?.name || menuItem.name;
    };

    /** 通过路径获取图标名称 */
    const handleGetIconName = (path: string): string => {
      return ASIDE_ICON_MAP.get(path) || "flag";
    };

    /** 判断菜单项是否有子项 */
    const hasChildren = (menu: any) => {
      return menu.children && getVisibleChildren(menu).length > 0;
    };

    /** 初始化展开的菜单 */
    const initExpandedMenus = () => {
      expandedMenus.clear();
      activeItemArray.length = 0;

      const expandMenusByPath = (menuList: any[], pathParts: string[]) => {
        menuList.forEach((menu) => {
          const menuPath = menu.path.replace(/^\//, "");
          if (pathParts[0] === menuPath) {
            expandedMenus.add(menu.name);
            activeItemArray.push(menu.name);
            if (pathParts.length > 1 && menu.children) {
              expandMenusByPath(menu.children, pathParts.slice(1));
            }
          }
        });
      };

      const currentPathParts = currentPath.value.split("/").filter(Boolean);
      if (currentPathParts.length > 0) {
        expandMenusByPath(filteredMenuList.value, currentPathParts);
      }
    };

    // 监听路由变化
    watch(
      () => currentPath.value,
      () => {
        initExpandedMenus();
      }
    );

    // 组件挂载时初始化
    onMounted(() => {
      initExpandedMenus();
      // 初始化侧边栏宽度变量
      document.documentElement.style.setProperty("--aside-width", "218px");
    });

    return {
      filteredMenuList,
      isMenuActive,
      isMenuExpanded,
      handleClick,
      getName,
      handleGetIconName,
      hasChildren,
      getVisibleChildren,
      // 新增
      collapsed,
      toggleCollapse,
      hoveredMenu,
      showTooltip,
      hideTooltip,
    };
  },
});
</script>

<style lang="less" scoped>
.aside-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.collapse-button {
  position: absolute;
  right: -15px;
  top: 20px;
  width: 30px;
  height: 30px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: @primary-color;
  transition: all 0.3s;

  &:hover {
    background-color: @primary-color;
    color: #fff;
  }
}

.menu {
  overflow-y: auto;
  height: calc(100% - 106px);
  width: 100%;
  transition: all 0.3s;

  &-collapsed {
    .parent-item {
      padding-left: 22px;
      justify-content: center;

      .icon {
        margin-right: 0;
      }
    }

    .arrow {
      display: none;
    }
  }
}

.menu-item {
  cursor: pointer;
  padding-right: 15px;
  height: 58px;
  font-size: 16px;
  line-height: 22px;
  color: rgba(169, 173, 180, 1);
  .flex-type(space-between);
  transition: all 0.3s;

  .arrow {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
}

.parent-item {
  background-color: rgba(40, 49, 67, 1);
  padding-left: 19px;

  .parent-box {
    .flex-type();
    transition: all 0.3s;
  }

  .icon {
    flex-shrink: 0;
    position: relative;
    margin-right: 8px;
    overflow: hidden;
    .set-size(20px);
    transition: all 0.3s;
  }

  &--open,
  &:hover:not(.parent-item-active) {
    color: @primary-color;
    transition: all 0.2s ease-in-out;

    :deep(.iconfont) {
      color: @primary-color !important;
      transition: all 0.2s ease-in-out;
    }
  }

  &--active {
    color: @white-color;
    background-color: @primary-color;
    transition: all 0.2s ease-in-out;
  }
}

.child-item {
  background-color: rgba(27, 34, 46, 1);
  padding-left: 45px;

  .child-box-content {
    width: 100%;
    .flex-type(space-between);
  }

  &--active {
    color: @white-color;
    background: @primary-color;
    transition: all 0.2s ease-in-out;
  }

  &--open,
  &:hover:not(&-active) {
    color: @primary-color;
    transition: all 0.2s ease-in-out;
  }

  &--grand {
    padding-left: calc(45px + 1em);
  }
}

.child-box {
  overflow: hidden;
  pointer-events: none;
  display: none;
  transition: all 0.2s linear;

  &-show {
    pointer-events: auto;
    display: block;
    transition: all 0.5s linear;
  }
}

.tooltip-container {
  position: absolute;
  top: 106px;
  left: 0;
  height: calc(100% - 106px);
  width: 100%;
  pointer-events: none;
}

.tooltip-trigger {
  height: 58px;
  width: 100%;
  pointer-events: auto;
  position: relative;
}

.tooltip-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}
</style>
