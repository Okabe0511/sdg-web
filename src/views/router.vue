<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const getKey = () => {
      // 优化了嵌套路由后keepalive不能使用的问题 - jh
      // const key = `${router.currentRoute.value.fullPath}${Math.random() * 1000}`;
      const key = `${router.currentRoute.value.fullPath}${String(
        router.currentRoute.value.name
      )}`;
      Object.assign(router.currentRoute.value.meta, { key });
      return key;
    };
    return { router, getKey };
  },
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition>
      <keep-alive>
        <component
          v-if="router.currentRoute.value.meta.keepAlive"
          :is="Component"
          :key="getKey()"
        />
      </keep-alive>
    </transition>
    <component
      v-if="!router.currentRoute.value.meta.keepAlive"
      :is="Component"
      :key="getKey()"
    />
  </router-view>
</template>
