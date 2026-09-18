<template>
    <div class="color-picker-panel">
        <a-radio-group type="button" class="color-picker-tab" v-model="currentType"
            size="large">
            <a-radio type="button" v-for="type in tabTypes" :value="type">{{ typeLabels[type] }}</a-radio>
        </a-radio-group>

        <KeepAlive>
            <component :is="panelComponent" @format-data="updateFormatData" v-bind="panelProps" />
        </KeepAlive>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs, provide, reactive, watch, inject, type Ref } from 'vue'
import { defaultValueKey, labelsKey, FACTORY_DEFAULTS, type fillType, type fillTypes, type GetDefaultFill, type FillPickerLabels } from "./interface";

import solidPanel from "./panel/solid.vue";
import linearPanel from "./panel/linear.vue";
import radialPanel from "./panel/radial.vue";
import imagePanel from "./panel/image.vue";

const attrs = useAttrs()

const labels = inject(labelsKey) as Ref<FillPickerLabels>

const props = withDefaults(defineProps<{
    defaultValue: () => fillType,
    visible?: boolean,
    showSolid?: boolean,
    showLinear?: boolean,
    showRadial?: boolean,
    showImage?: boolean,
}>(), {
    showSolid: true,
    showLinear: true,
    showRadial: true,
    showImage: true,
})

const emit = defineEmits(['update:modelValue', 'change', 'format-data'])

const tabTypes = computed(() => {
    const types = []
    if (props.showSolid) types.push('solid')
    if (props.showLinear) types.push('linear')
    if (props.showRadial) types.push('radial')
    if (props.showImage) types.push('image')
    return types as ('solid' | 'linear' | 'radial' | 'image')[]
})

const typeLabels = computed(() => ({
    solid: labels.value.typeLabels.solid,
    linear: labels.value.typeLabels.linear,
    radial: labels.value.typeLabels.radial,
    image: labels.value.typeLabels.image
}))

const currentType = ref<fillTypes>(normalizeFill(props.defaultValue()).type || 'solid')

const panelComponent = computed(() => {
    switch (currentType.value) {
        case 'solid': return solidPanel
        case 'linear': return linearPanel
        case 'radial': return radialPanel
        case 'image': return imagePanel
    }
})

const panelProps = computed(() => {
    if (currentType.value === 'image') return attrs
    return {}
})

const sessionFillCache = reactive<Record<fillTypes, fillType | null>>({
    solid: null, linear: null, radial: null, image: null,
})

function normalizeFill(raw: fillType | string): fillType {
    if (typeof raw === 'string') return { type: 'solid', color: raw }
    return raw
}

function resetSessionCache() {
    const initFill = normalizeFill(props.defaultValue())
    sessionFillCache.solid = null
    sessionFillCache.linear = null
    sessionFillCache.radial = null
    sessionFillCache.image = null
    sessionFillCache[initFill.type] = { ...initFill } as fillType
    currentType.value = initFill.type
}

resetSessionCache()
watch(() => props.visible, (v) => { if (v) resetSessionCache() })

watch(currentType, (newType) => {
    const cached = sessionFillCache[newType]
    if (cached) {
        emit('format-data', { ...cached } as fillType)
    } else {
        emit('format-data', structuredClone(FACTORY_DEFAULTS[newType]) as fillType)
    }
})

provide(defaultValueKey, (type: fillTypes): fillType => {
    return sessionFillCache[type] ?? structuredClone(FACTORY_DEFAULTS[type])
})

const updateFormatData = (data: fillType) => {
    sessionFillCache[data.type] = { ...data }
    emit('format-data', data)
}
</script>
