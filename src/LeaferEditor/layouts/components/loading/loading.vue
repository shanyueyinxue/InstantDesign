<script lang="ts" setup>
import { Spin as ASpin } from "@arco-design/web-vue";

defineProps<{
  tip?: string
}>()
</script>

<template>
  <a-spin :loading="true" :tip="tip" class="loading-overlay" />
</template>

<style scoped>
.loading-overlay {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.6);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
