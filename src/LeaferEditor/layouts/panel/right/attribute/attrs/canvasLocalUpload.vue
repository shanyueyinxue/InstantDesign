<template>
    <div class="p2">
        <a-button :disabled="!hasLocalImages" @click="handleClick">{{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.uploadButton') }}</a-button>
        <a-tooltip mini position="lt">
            <icon-question-circle class="cursor-pointer" :size="14" style="color: rgb(var(--primary-6))" />
            <template #content>
                <p>
                    {{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.tooltipText1') }}
                    <br />
                    <br />
                    {{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.tooltipText2') }}
                </p>
            </template>
        </a-tooltip>
        <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
            <template #title>
                <span>{{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.modalTitle') }}</span>
            </template>
            <div>
                <a-button :disabled="startUploadDisabled" @click="startUpload">{{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.startUpload') }}</a-button>
                {{ t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.uploadedCount', { n: uploadImages.length }) }}
                <div class="flex">
                    <a-card v-for="img in uploadImages" :key="img.name" :style="{ width: '100px' }" :body-style="{
                        padding: '7px'
                    }">
                        <template #cover>
                            <div :style="{
                                height: '100px',
                                overflow: 'hidden',
                            }">
                                <a-image :style="{ width: '100%' }" fit="contain" :src="img.url" :title="img.name" />
                            </div>
                        </template>
                        <a-card-meta :title="img.name"> </a-card-meta>
                    </a-card>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useLeaferEditor } from '../../../../editorContext';
import { toFixed as _toFixed } from '../../../../../utils/math';
import type { IUI } from 'leafer-ui';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const editor = useLeaferEditor();
const hasLocalImages = ref(editor.image.hasLocalImages());
const visible = ref(false);
const startUploadDisabled = ref(false); // 用于控制开始上传按钮的禁用状态
const uploadImages = ref([] as { name: string, url: string }[]); // 用于存储上传的图片信息

const updateHasLocalImages = () => {
    hasLocalImages.value = editor.image.hasLocalImages();
};

const handleClick = () => {
    startUploadDisabled.value = false;
    uploadImages.value = [];
    visible.value = true;
};
const handleOk = () => {
    startUploadDisabled.value = false;
    updateHasLocalImages();
    uploadImages.value = [];
    visible.value = false;
};
const handleCancel = () => {
    startUploadDisabled.value = false;
    updateHasLocalImages();
    uploadImages.value = [];
    visible.value = false;
}

const _uploadImages = (record: { oldUrl: string; newUrl: string; ui: IUI }) => {
    uploadImages.value.push({
        name: record.ui.name || t('leaferEditorLayouts.panelRight.attribute.canvasLocalUpload.unnamed'),
        url: record.newUrl, // 这里假设上传成功后返回的新URL
    });
}
const startUpload = () => {
    editor.image.uploadLocalImages({ onUploaded: _uploadImages });
    startUploadDisabled.value = true; // 设置开始上传按钮为禁用状态
};

editor.eventBus.on(editor.Events.imageLocalUploadSuccess, updateHasLocalImages)
editor.eventBus.on(editor.Events.imageLocalUploadError, updateHasLocalImages)
editor.eventBus.on(editor.Events.pageChangeAfter, updateHasLocalImages) // 监听页面变化事件，更新本地图片状态
onMounted(() => {
    updateHasLocalImages();
});
onUnmounted(() => {
    editor.eventBus.off(editor.Events.imageLocalUploadSuccess, updateHasLocalImages);
    editor.eventBus.off(editor.Events.imageLocalUploadError, updateHasLocalImages);
    editor.eventBus.off(editor.Events.pageChangeAfter, updateHasLocalImages); // 清理事件监听器
});
</script>
