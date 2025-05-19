<script lang="ts">
import { defineComponent, nextTick, ref, provide } from "vue";
export default defineComponent({
  setup() {
    const isRouterAlice = ref(true);

    const reload = () => {
      isRouterAlice.value = false;
      nextTick(() => {
        isRouterAlice.value = true;
      });
    };

    provide("reload", reload);

    return {
      isRouterAlice,
    };
  },
});
</script>

<template>
  <router-view v-if="isRouterAlice" />
</template>
