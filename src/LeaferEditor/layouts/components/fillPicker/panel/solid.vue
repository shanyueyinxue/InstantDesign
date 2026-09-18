<template>
    <!-- 纯色选择器 -->
    <div class="solid-picker" @mousedown="(e)=>e.preventDefault()">
        <a-color-picker class="color-picker" v-model="solidColor" hideTrigger />
    </div>
</template>
<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { defaultValueKey, type solidType, type GetDefaultFill } from "../interface";


const emit = defineEmits(['format-data'])
const getDefaultValue = inject(defaultValueKey) as GetDefaultFill
const defaultVal = getDefaultValue('solid') as solidType

const solidColor = ref(defaultVal.color)

watch(solidColor, (newVal) => {
    emit('format-data', {
        type: 'solid',
        color: newVal,
    })
}, { immediate: false })
</script>
