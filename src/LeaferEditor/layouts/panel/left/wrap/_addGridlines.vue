<template>
    <div class="add-gridlines">
        <a-form ref="formRef" :model="gridlinesForm">
            <a-form-item field="type" :label="t('leaferEditorLayouts.panelLeft.add.gridlines.direction')">
                <a-radio-group v-model="gridlinesForm.type">
                    <a-radio value="h">{{ t('leaferEditorLayouts.panelLeft.add.gridlines.horizontal') }}</a-radio>
                    <a-radio value="v">{{ t('leaferEditorLayouts.panelLeft.add.gridlines.vertical') }}</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item field="pixelRatio" :label="t('leaferEditorLayouts.panelLeft.add.gridlines.position')">
                <a-input-number v-model="gridlinesForm.position" allow-clear hide-button style="width: 150px">
                    <template #suffix>
                        px
                    </template>
                </a-input-number>
            </a-form-item>
            <a-form-item :label="t('leaferEditorLayouts.panelLeft.add.gridlines.confirm')">
                <a-button type="primary" @click="addGridlines" style="width: 50%;">{{
                    t('leaferEditorLayouts.panelLeft.add.gridlines.addButton')
                }}</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
    Button as AButton,
    Radio as ARadio,
    RadioGroup as ARadioGroup,
    InputNumber as AInputNumber,
    Form as AForm,
    FormItem as AFormItem
} from "@arco-design/web-vue";
import { Message } from '@arco-design/web-vue';

import { LeaferEditor, useLeaferEditorRulerPluginService } from '../../../../index';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
    editor: LeaferEditor
}>();

const editor = props.editor;

const gridlinesForm = ref({
    type: 'h' as 'h' | 'v',
    position: 1,
});

const addGridlines = () => {
    const gridlinePluginService = useLeaferEditorRulerPluginService(editor)
    if (gridlinePluginService) {
        const line = gridlinePluginService.newGridLine(gridlinesForm.value.position, gridlinesForm.value.type)
        gridlinePluginService.addGridLine(line)
        Message.success(t('leaferEditorLayouts.panelLeft.add.gridlines.addSuccess'))
    }
}
</script>

<style lang="less" scoped>
.add-gridlines {
    min-width: 280px;
    min-height: 200px;
    padding: 10px;
}
</style>