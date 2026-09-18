<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { Input as AInput, Button as AButton } from '@arco-design/web-vue'

const props = withDefaults(defineProps<{
  title?: string
  defaultValue?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
}>(), {
  confirmText: '确认',
  cancelText: '取消',
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const inputValue = ref(props.defaultValue || '')
const inputRef = ref<InstanceType<typeof AInput>>()

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})

const handleConfirm = () => {
  emit('confirm', inputValue.value)
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
  }
}
</script>

<template>
  <div class="prompt-overlay" @click="onOverlayClick" @keydown="onKeydown">
    <div class="prompt-box">
      <div v-if="title" class="prompt-title">{{ title }}</div>
      <a-input
        ref="inputRef"
        allow-clear
        v-model="inputValue"
        :placeholder="placeholder"
        @keydown.enter="handleConfirm"
      />
      <div class="prompt-actions">
        <a-button size="small" @click="handleCancel">{{ cancelText }}</a-button>
        <a-button size="small" type="primary" @click="handleConfirm">{{ confirmText }}</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prompt-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-box {
  background: var(--color-bg-4, #fff);
  border: 1px solid var(--color-border-2, #e5e6eb);
  border-radius: 8px;
  padding: 16px 20px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.prompt-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
  white-space: nowrap;
}

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}
</style>
