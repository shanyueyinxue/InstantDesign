<template>
    <div class="degree">
        <div class="flex degree-box">
            <div class="degree-label">{{ degreeLabel }}: </div>
            <a-slider :default-value="degree" style="width: 100%" :max="360" show-input size="mini"
                @change="handleChange" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { inject, computed, type Ref } from 'vue'
import { labelsKey, type FillPickerLabels } from "../interface";

const labels = inject(labelsKey) as Ref<FillPickerLabels>
const degreeLabel = computed(() => labels.value.degree)

const props = defineProps<{
    degree: number,
}>()
const emit = defineEmits<{
    (event: 'change', value: number): void
}>()

const handleChange = (v: number | [number, number]) => {
    emit('change', Array.isArray(v) ? v[0] : v)
}
</script>
<style lang="less" scoped>
.degree {
    padding: 0 10px 10px;

    &-box {
        display: flex;
        align-items: center;
    }

    &-label {
        width: 66px;
    }
}
</style>
