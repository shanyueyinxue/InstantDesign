<template>
    <a-space class="save-oper">
        <component :is="comp" v-for="(comp, idx) in headerActions" :key="idx" />

        <help>
            <icon-question-circle class="icon" />
            <!-- <span class="title">帮助</span> -->
        </help>

        <a-divider direction="vertical" />

        <a-button @click="preview()">
            <template #icon>
                <icon-eye />
            </template>
            {{ t('leaferEditorLayouts.header.saveOper.preview') }}
        </a-button>
        <a-button type="primary" @click="handleSave()">
            <template #icon>
                <icon-save />
            </template>
            {{ t('leaferEditorLayouts.header.saveOper.save') }}
        </a-button>
        <a-dropdown-button v-if="showDownloadImage" class="m-r-0!" type="primary" @select="handleSelect"
            @click="handleDownload()">
            <icon-download class="m-r-8px" />{{ t('leaferEditorLayouts.header.saveOper.download') }}
            <template #icon>
                <icon-down />
            </template>
            <template #content>
                <a-doption value="png">{{ t('leaferEditorLayouts.header.saveOper.saveAsPng') }}</a-doption>
                <a-doption v-if="showContentJSON" value="json">{{ t('leaferEditorLayouts.header.saveOper.contentSaveAsJSON')
                    }}</a-doption>
                <a-doption v-if="showCurrentPageJSON" value="currentCanvas">{{
                    t('leaferEditorLayouts.header.saveOper.currentPageSaveAsJSON') }}</a-doption>
            </template>
        </a-dropdown-button>
    </a-space>
    <a-image-preview :src="previewUrl" v-model:visible="visiblePreview" />
    <a-modal v-model:visible="exportVisible" :title="t('leaferEditorLayouts.header.saveOper.downloadOption')"
        @ok="handleExport()" width="600px" :top="50" :align-center="false">
        <a-form ref="formRef" :model="exportForm" :rules="rules">
            <a-form-item field="fileType" :label="t('leaferEditorLayouts.header.saveOper.exportType')">
                <a-radio-group v-model="exportForm.fileType" type="button" :options="exportFileTypes"></a-radio-group>
            </a-form-item>
            <a-form-item field="quality" :label="t('leaferEditorLayouts.header.saveOper.quality')"
                v-if="['jpg', 'webp'].includes(exportForm.fileType!)">
                <a-space>
                    <a-radio-group v-model="exportForm.quality" type="button" :options="scQtaRate"></a-radio-group>
                    <a-input-number v-model="exportForm.quality" mode="button" style="width: 120px" :max="1" :step="0.1"
                        :min="0.1" placeholder="1"></a-input-number>
                </a-space>
            </a-form-item>
            <a-form-item field="scale" :label="t('leaferEditorLayouts.header.saveOper.scale')"
                :extra="t('leaferEditorLayouts.header.saveOper.scaleExtra')">
                <a-space>
                    <a-radio-group v-model="exportForm.scale" type="button" :options="scQtaRate"></a-radio-group>
                    <a-input-number v-model="exportForm.scale" mode="button" style="width: 120px" :max="1" :step="0.1"
                        :min="0.1" placeholder="1"></a-input-number>
                </a-space>
            </a-form-item>
            <a-form-item field="pixelRatio" :label="t('leaferEditorLayouts.header.saveOper.pixelRatio')"
                :extra="t('leaferEditorLayouts.header.saveOper.pixelRatioExtra')">
                <a-input-number v-model="exportForm.pixelRatio" allow-clear hide-button style="width: 200px"
                    :placeholder="t('leaferEditorLayouts.header.saveOper.pixelRatioPlaceholder')">
                    <template #suffix>
                        {{ t('leaferEditorLayouts.header.saveOper.pixelRatioUnit') }}
                    </template>
                </a-input-number>
            </a-form-item>
            <a-form-item field="trim" :label="t('leaferEditorLayouts.header.saveOper.trim')">
                <a-switch type="round" v-model="exportForm.trim">
                    <template #checked>
                        {{ t('leaferEditorLayouts.header.saveOper.yes') }}
                    </template>
                    <template #unchecked>
                        {{ t('leaferEditorLayouts.header.saveOper.no') }}
                    </template>
                </a-switch>
            </a-form-item>
            <a-form-item field="exportType" :label="t('leaferEditorLayouts.header.saveOper.export')">
                <a-radio-group v-model="exportForm.exportType" type="button" :options="exportTypes"></a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { Notification } from "@arco-design/web-vue";
import { computed, reactive, ref } from "vue";
import JsZip from "jszip";

import { useLeaferEditor } from '../../editorContext';
import { useLayoutOptions, DEFAULT_EXPORT } from '../../layoutOptions';
import { downFile } from "../../../utils/file";
import { generateID } from "../../../core/utils";
import help from "./help.vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const editor = useLeaferEditor();
const opts = useLayoutOptions()
const headerActions = computed(() => opts.headerActions ?? [])
const exportOptions = opts.export!

const visiblePreview = ref(false)
const previewUrl = ref()
const exportTypes = computed(() => [
    { value: 'currentPage', label: t('leaferEditorLayouts.header.saveOper.currentPage') },
    { value: 'ALL', label: t('leaferEditorLayouts.header.saveOper.all') },
])
const exportFileTypes = reactive(exportOptions.fileTypes ?? DEFAULT_EXPORT.fileTypes)
const scQtaRate = computed(() => exportOptions.qualityPresets ?? DEFAULT_EXPORT.qualityPresets)
const exportVisible = ref(false)
const exportForm = ref({
    fileType: exportOptions.defaultForm?.fileType ?? DEFAULT_EXPORT.defaultForm.fileType,
    quality: exportOptions.defaultForm?.quality ?? DEFAULT_EXPORT.defaultForm.quality,
    scale: exportOptions.defaultForm?.scale ?? DEFAULT_EXPORT.defaultForm.scale,
    pixelRatio: exportOptions.defaultForm?.pixelRatio ?? DEFAULT_EXPORT.defaultForm.pixelRatio,
    trim: exportOptions.defaultForm?.trim ?? DEFAULT_EXPORT.defaultForm.trim,
    exportType: exportOptions.defaultForm?.exportType ?? DEFAULT_EXPORT.defaultForm.exportType,
});
const rules = {

}
const resetForm = () => {
    exportForm.value = {
        fileType: exportOptions.defaultForm?.fileType ?? DEFAULT_EXPORT.defaultForm.fileType,
        quality: exportOptions.defaultForm?.quality ?? DEFAULT_EXPORT.defaultForm.quality,
        scale: exportOptions.defaultForm?.scale ?? DEFAULT_EXPORT.defaultForm.scale,
        pixelRatio: exportOptions.defaultForm?.pixelRatio ?? DEFAULT_EXPORT.defaultForm.pixelRatio,
        trim: exportOptions.defaultForm?.trim ?? DEFAULT_EXPORT.defaultForm.trim,
        exportType: exportOptions.defaultForm?.exportType ?? DEFAULT_EXPORT.defaultForm.exportType,
    }
}
const handleSave = () => {
    if (exportOptions.onSave) {
        exportOptions.onSave(editor)
    } else {
        saveJSON()
    }
}
const previewFormat = computed(() => exportOptions.preview?.format ?? 'png')
const showDownloadImage = computed(() => exportOptions.showDownloadImage ?? true)
const showContentJSON = computed(() => exportOptions.showContentJSON ?? true)
const showCurrentPageJSON = computed(() => exportOptions.showCurrentPageJSON ?? true)
const preview = async () => {
    const result = await editor.export(previewFormat.value, {
        blob: true,
        pixelRatio: 1,
        clip: {
            x: 0,
            y: 0,
            width: editor.page.current.width,
            height: editor.page.current.height,
        }
    })
    const url = URL.createObjectURL(result.data);
    previewUrl.value = url
    visiblePreview.value = true
}
const saveJSON = () => {
    Notification.info({
        closable: true,
        content: t('leaferEditorLayouts.header.saveOper.saveAsJSON')
    })
    let json = editor.toJSON()
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = `${generateID()}-${editor.page.list().length}P-${Date.now()}.json`;
    downFile(url, fileName)
}
const exportCurrentJSON = () => {
    const json: Record<string, any> = editor.toJSON()
    json.pages = [editor.page.current.toJSON()]
    json.currentCanvas = editor.page.current.name

    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${editor.page.current.metaData.title || editor.page.currentID || generateID()}-${Date.now()}.json`;
    a.click();
}

const handleDownload = () => {
    resetForm()
    exportVisible.value = true
}

const handleExport = () => {
    const exportType = exportForm.value.exportType
    if (exportType === 'currentPage') {
        editor.export(`${generateID()}.${exportForm.value.fileType}`, exportForm.value)
    } else if (exportType === 'ALL') {
        const pages = editor.page.list()
        const zip = new JsZip();
        pages.forEach((page, index) => {
            page.export(exportForm.value.fileType!, { blob: true, ...exportForm.value }).then((res) => {
                const fn = `${index + 1}-page-${Date.now()}.${exportForm.value.fileType!}`
                zip.file(fn, res.data)
                if (index === pages.length - 1) {
                    zip.generateAsync({ type: "blob" }).then((content) => {
                        const url = URL.createObjectURL(content);
                        const fileName = `${generateID()}-${editor.page.list().length}P-${Date.now()}.zip`;
                        downFile(url, fileName)
                    })
                }
            })
        })
    }
}

const handleSelect = (v: string) => {
    let fileName = generateID()
    switch (v) {
        case 'png':
            editor.page.current.contentFrame.export(fileName + '.png')
            break
        case 'jpg':
            editor.page.current.contentFrame.export(fileName + '.jpg')
            break
        case 'webp':
            editor.page.current.contentFrame.export(fileName + '.webp')
            break
        case 'json':
            saveJSON()
            break
        case 'currentCanvas':
            exportCurrentJSON()
            break
        default:
            editor.page.current.contentFrame.export(fileName + '.jpg')
            break
    }
};
</script>

<style scoped lang="less"></style>
