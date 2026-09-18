<script setup lang="ts">
import Panel from './panel.vue'
import strInput from '../../../../components/strInput.vue';
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import { selectFiles } from "../../../../../utils/file";
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import { ImageSourceTag } from "../../../../../core";
import { useLayoutOptions } from "../../../../layoutOptions";

const { t } = useI18n();

const editor = useLeaferEditor();
const layoutOptions = useLayoutOptions();
const url = selectedProxyData(editor, 'url')
const loading = ref(false)

const upload = () => {
    const acceptTypes = layoutOptions.image?.acceptTypes
        ?? editor.options.image?.fileTypes
        ?? ['.png', '.jpg', '.jpeg']
    selectFiles({
        accept: acceptTypes.join(','),
        multiple: false
    }).then(async files => {
        if (files && files.length > 0) {
            const file = files[0]!;
            const maxSize = layoutOptions.image?.maxSize ?? editor.options.image?.maxSize
            if (maxSize && file.size > maxSize) {
                Message.error(t('leaferEditorLayouts.panelRight.attribute.image.errorImageSize', { size: maxSize / 1024 / 1024 }))
                return
            }
            let res: any = null;
            loading.value = true
            res = await editor.options.image?.uploadCallback!(file, ImageSourceTag.OpenImage, editor.selected[0])
            if (res) {
                url.value.onChange(res.url)
                url.value.onEnd()
            }
            loading.value = false
        }
    })
}
</script>

<template>
    <Panel :title="t('leaferEditorLayouts.panelRight.attribute.image.title')" hidden-add>
        <a-spin :loading="loading" :tip="t('leaferEditorLayouts.panelRight.attribute.image.uploadingTip')">
            <a-row :gutter="[8, 4]" align="center">
                <a-col :span="6">
                    <a-button @click="upload" style="font-size: 12px; margin-right: 5px; height: 30px; width: 55px;">{{
                        t('leaferEditorLayouts.panelRight.attribute.image.uploadButton') }}</a-button>
                </a-col>
                <a-col :span="18">
                    <strInput v-bind="url" />
                </a-col>
            </a-row>
        </a-spin>
    </Panel>
</template>

<style lang="less" scoped>
.attr-panel {
    --color-secondary: #f2f3f5;
}
</style>