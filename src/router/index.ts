import { ref } from "vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { beforeEnter } from "./beforeEnter";
import _ from "lodash";
import path from "path-browserify";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
    name: "领域数据制备管理后台",
    component: () => import("/@/views/layout/index.vue"),
    beforeEnter,
    children: [
      {
        path: "/home",
        name: "数据制备任务",
        component: () => import("/@/views/router.vue"),
        meta: {
          name: "数据制备任务",
        },
        children: [
          {
            path: "list",
            name: "数据制备任务列表",
            component: () => import("/@/views/preparation/list/index.vue"),
            meta: {},
          },
          {
            path: "create",
            name: "创建数据制备任务",
            component: () => import("/@/views/preparation/create/index.vue"),
            meta: {
              hide: true,
              mode: "create",
            },
          },
          {
            path: "detail/:id",
            name: "数据制备任务详情",
            component: () => import("/@/views/preparation/create/index.vue"),
            meta: {
              hide: true,
              mode: "detail",
            },
          },
        ],
      },
    ],
  },

  {
    path: "/login",
    name: "登录页",
    component: () => import("/@/views/login/manager/index.vue"),
  },
];

export const oldRoutes = _.cloneDeep(routes);

// 二级以上的菜单降级成二级菜单
const formatRouter = (
  routes: RouteRecordRaw[],
  basePath = "/",
  list: RouteRecordRaw[] = [],
  parent: any = undefined
) => {
  routes.map((item: any) => {
    item.path = path.resolve(basePath, item.path);
    const meta = item.meta || {};
    if (!meta.parent && parent) {
      meta.parent = parent.path;
      item.meta = meta;
    }
    if (item.redirect) item.redirect = path.resolve(basePath, item.redirect);
    if (item.children && item.children.length > 0) {
      const arr = formatRouter(item.children, item.path, list, item);
      delete item.children;
      list.concat(arr);
    }
    list.push(item);
  });
  return list;
};

// 菜单降级
export const getFlatRoutes = (routes: RouteRecordRaw[]) => {
  return routes.map((child: RouteRecordRaw) => {
    if (child.children && child.children.length > 0) {
      child.children = formatRouter(child.children, child.path, [], child);
    }
    return child;
  });
};

const newRoutes = getFlatRoutes(oldRoutes);

const router = createRouter({
  history: createWebHashHistory(),
  routes: newRoutes,
});

/** 面包屑导航路径数组 */
export const crumbPaths = ref(new Array<any>());

/** 面包屑页面跳转逻辑 */
router.afterEach((to, from) => {
  const currentLevel = crumbPaths.value.length;
  const targetLevel = to.meta.level as number;
  if (targetLevel) {
    if (targetLevel > currentLevel) {
      crumbPaths.value.push(to);
    } else if (targetLevel === currentLevel) {
      crumbPaths.value[currentLevel - 1] = to;
    } else {
      const tmpPaths = crumbPaths.value.slice(0, targetLevel - 1);
      tmpPaths.push(to);
      crumbPaths.value = tmpPaths;
    }
  } else {
    crumbPaths.value = [];
  }
});

export default router;
