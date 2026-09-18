<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Panel from "./panel.vue";
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import { watchEffect } from "vue";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { useActiveObjectModel } from "../useActiveObjectModel";

const { t } = useI18n()

const editor = useLeaferEditor()

const cornerRadius = selectedProxyData(editor, 'cornerRadius', [0, 0, 0, 0])

const useRadiusDefaultVal = (idx: number) => {
    if (cornerRadius.value.modelValue && typeof cornerRadius.value.modelValue === 'number') {
        return cornerRadius.value.modelValue
    }
    return cornerRadius.value.modelValue && cornerRadius.value.modelValue[idx] || 0
}

const lt = useActiveObjectModel(editor,
    useRadiusDefaultVal(0),
    (value) => {
        cornerRadius.value.onChange([value, rt.value.modelValue, rb.value.modelValue, lb.value.modelValue])
    },
)
const rt = useActiveObjectModel(editor,
    useRadiusDefaultVal(1),
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, value, rb.value.modelValue, lb.value.modelValue])
    },
)
const lb = useActiveObjectModel(editor,
    useRadiusDefaultVal(3),
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, rt.value.modelValue, rb.value.modelValue, value])
    },
)
const rb = useActiveObjectModel(editor,
    useRadiusDefaultVal(2),
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, rt.value.modelValue, value, lb.value.modelValue])
    },
)

watchEffect(() => {
    let v = cornerRadius.value.modelValue
    if (!cornerRadius.value.modelValue) {
        v = [0, 0, 0, 0]
    } else if (v && typeof v === 'number') {
        v = [v, v, v, v]
    }

    lt.value.onChange(v[0], false)
    rt.value.onChange(v[1], false)
    rb.value.onChange(v[2], false)
    lb.value.onChange(v[3], false)
})
</script>

<template>
    <Panel :title="t('leaferEditorLayouts.panelRight.attribute.cornerRadius.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="12">
                <swipe-number v-bind="lt" :label="t('leaferEditorLayouts.panelRight.attribute.cornerRadius.labels.lt')"
                    :min="0" :labelWidth="'30px'" @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="rt" :label="t('leaferEditorLayouts.panelRight.attribute.cornerRadius.labels.rt')"
                    :min="0" :labelWidth="'30px'" @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="lb" :label="t('leaferEditorLayouts.panelRight.attribute.cornerRadius.labels.lb')"
                    :min="0" :labelWidth="'30px'" @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="rb" :label="t('leaferEditorLayouts.panelRight.attribute.cornerRadius.labels.rb')"
                    :min="0" :labelWidth="'30px'" @end="cornerRadius.onEnd" />
            </a-col>
        </a-row>
    </Panel>
</template>