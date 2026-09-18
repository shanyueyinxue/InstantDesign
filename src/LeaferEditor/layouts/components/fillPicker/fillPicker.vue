<template>
    <a-trigger v-model="visible" :position="position" :trigger="trigger" @popup-visible-change="handleVisibleChanget">
        <!-- <a-input placeholder="Click/Hover/Focus on me" /> -->
        <div style="width: fit-content" class="flex-center">
            <DefaultTrigger @change="handleChange" :disabled="disabled" />
        </div>
        <template #content>
            <fillPickerPanel v-bind="{ ...options, ...$attrs }" :visible="visible" @format-data="updateFormatData"
                :default-value="defaultValue" />
        </template>
    </a-trigger>
</template>
<script lang="ts" setup>
import { ref, provide, computed, watch, type Ref } from 'vue';
import DefaultTrigger from './trigger.vue';
import fillPickerPanel from './fillPickerPanel.vue';
import { defaultValueKey, labelsKey, IMAGE_FILL_KEY, type solidType, type fillType, type FillPickerLabels, type ImageFillConfig, DEFAULT_LABELS } from "./interface";

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
    visible?: boolean;
    position?: 'br' | 'rt' | 'tr' | 'top' | 'right' | 'bottom' | 'left' | 'tl' | 'bl' | 'lt' | 'lb' | 'rb';
    trigger?: 'click' | 'focus' | 'contextMenu' | 'hover' | ('click' | 'focus' | 'contextMenu' | 'hover')[];
    disabled?: boolean;
    defaultValue?: () => fillType;
    labels?: Partial<FillPickerLabels>;
    options?: {
        showSolid?: boolean;
        showLinear?: boolean;
        showRadial?: boolean;
        showImage?: boolean;
    };
    imageFillConfig?: ImageFillConfig;
}>(), {
    visible: false,
    position: 'left',
    trigger: 'click',
    disabled: false,
    defaultValue: () => ((): fillType => ({
        type: 'solid',
        color: '#FFFFFF',
    })),
    options: () => ({
        showSolid: true,
        showLinear: true,
        showRadial: true,
        showImage: true,
    })
});
const emit = defineEmits(['update:modelValue', 'visible-change', 'format-data', 'change'])


const visible = ref(props.visible);
const position = ref(props.position);
const trigger = ref(props.trigger);
const disabled = ref(props.disabled);
const defaultValue = ref(props.defaultValue) as Ref<() => fillType>;

const mergedLabels = computed(() => {
    const overrides = props.labels || {}
    return {
        typeLabels: { ...DEFAULT_LABELS.typeLabels, ...overrides.typeLabels },
        fillTypeLabels: { ...DEFAULT_LABELS.fillTypeLabels, ...overrides.fillTypeLabels },
        degree: overrides.degree ?? DEFAULT_LABELS.degree,
        imagePanel: {
            ...DEFAULT_LABELS.imagePanel,
            ...overrides.imagePanel,
            modeOptions: { ...DEFAULT_LABELS.imagePanel.modeOptions, ...overrides.imagePanel?.modeOptions },
        },
    }
})
provide(labelsKey, mergedLabels)

watch(() => props.imageFillConfig, (v) => {
    if (v) provide(IMAGE_FILL_KEY, v)
}, { immediate: true })

provide(defaultValueKey, (): fillType => {
    const value = defaultValue.value!();
    if (typeof value === 'string') {
        return {
            type: 'solid',
            color: value,
        }
    }
    return value;
})

const handleVisibleChanget = (v: boolean) => {
    visible.value = v;
    emit('visible-change', v);    
}

const updateFormatData = (data: fillType) => {
    emit('format-data', data)
}

const handleChange = (data: solidType) => {
    emit('format-data', data)
    emit('change', data)
}
</script>
<style lang="less" scoped>
.fill-picker {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
        background-color: #e6e6e6;
    }
}

.fill-picker-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: #999;
}
</style>
