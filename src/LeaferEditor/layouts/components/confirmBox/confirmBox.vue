<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { Button as AButton } from '@arco-design/web-vue'

const props = withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
}>(), {
  confirmText: '确认',
  cancelText: '取消',
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleCancel()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter') {
    handleConfirm()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="confirm-overlay" @click="onOverlayClick">
    <div class="confirm-box">
      <div v-if="title" class="confirm-title">{{ title }}</div>
      <div class="confirm-actions">
        <a-button size="small" @click="handleCancel">{{ cancelText }}</a-button>
        <a-button size="small" type="primary" @click="handleConfirm">{{ confirmText }}</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-box {
  background: var(--color-bg-4, #fff);
  border: 1px solid var(--color-border-2, #e5e6eb);
  border-radius: 8px;
  padding: 20px 24px;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.confirm-title {
  margin-bottom: 18px;
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
