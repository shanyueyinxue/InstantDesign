<template>
    <!-- 图片选择器 -->
    <div class="upload-box" style="height: 100%;width: 260px;">
        <div class="p-20px">
            <Upload :upload-image-callback="handleUpload" :size="imageFill.uploadPreviewSize" @upload-success="onSuccess"
                @upload-error="onError" @delete="onRemove" :previewUrl="previewUrl"
                :accept="imageFill.accept"
                :maxImageSize="imageFill.maxImageSize" />
        </div>
        <a-row>
            <a-col>
                <a-select v-model="fit" :options="options" style="width: 100%" @change="onChange">
                    <template #prefix>
                        {{ fillModeLabel }}
                    </template>
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col>
                <swipeNumber size="small" v-model="newOpacity" :min="0" :max="100" :step="1" style="padding: 0 12px"
                    label-width="68px">
                    <template #label>
                        <div style="text-align: right;padding-right: 12px">
                            <icon-mosaic style="margin-right: 2px" />
                            {{ opacityLabel }}
                        </div>
                    </template>
                    <template #suffix>
                        <div>%</div>
                    </template>
                </swipeNumber>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue'
import { defaultValueKey, labelsKey, IMAGE_FILL_KEY, type imageType, type GetDefaultFill, type FillPickerLabels, type ImageFillConfig } from "../interface";
import swipeNumber from "../../swipeNumber.vue";
import Upload from "../../upload.vue";

const imageFill = inject(IMAGE_FILL_KEY) as ImageFillConfig

interface UploadResult {
    url: string
    width?: number
    height?: number
    name?: string
}

const emit = defineEmits([
    'format-data',
    'update:modelValue',
    'upload-success',
    'upload-error',
    'delete',
])

const getDefaultValue = inject(defaultValueKey) as GetDefaultFill
const labels = inject(labelsKey) as Ref<FillPickerLabels>

const defaultVal = getDefaultValue('image') as imageType
const fillModeLabel = computed(() => labels.value.imagePanel.fillMode)
const opacityLabel = computed(() => labels.value.imagePanel.opacity)

const previewUrl = ref(defaultVal.url)
const options = computed(() => [
    { value: 'cover', label: labels.value.imagePanel.modeOptions.cover },
    { value: 'fit', label: labels.value.imagePanel.modeOptions.fit },
    { value: 'stretch', label: labels.value.imagePanel.modeOptions.stretch },
    { value: 'clip', label: labels.value.imagePanel.modeOptions.clip },
    { value: 'repeat', label: labels.value.imagePanel.modeOptions.repeat },
])
const fit = ref(defaultVal.mode)
const opacity = ref(defaultVal.opacity || 1)
const newOpacity = ref(opacity.value * 100)

watch(newOpacity, (val) => {
    opacity.value = val / 100
    onChange()
})
const handleUpload = async (file: File): Promise<UploadResult> => {
    return imageFill.handleUpload(file)
}

const onChange = () => {
    const data = {
        type: 'image' as const,
        mode: fit.value,
        url: previewUrl.value,
        opacity: opacity.value,
    }
    emit('format-data', data)
    emit('update:modelValue', data)
}
const onSuccess = (res: UploadResult) => {
    previewUrl.value = res.url
    onChange()
    emit('upload-success', res)
}

const onError = (err: Error) => {
    emit('upload-error', err)
}
const onRemove = () => {
    emit('delete')
}
</script>

<style scoped>
.upload-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

:deep(.arco-row) {
    width: 100%;
}
</style>
