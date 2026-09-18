<script setup lang="ts">
import Panel from './panel.vue'
import fillPicker from "../../../../components/fillPicker";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';  
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import { useImageFill } from "./imageFillMixin";
import { useLayoutTheme } from "../../../../layoutOptions";
import { useFillPickerLabels } from "./useFillPickerLabels";
const { t } = useI18n()

const editor = useLeaferEditor()
const imageFill = useImageFill()
const layoutTheme = useLayoutTheme()

const fillPickerLabels = useFillPickerLabels()

const stroke = selectedProxyData(editor, 'stroke')
const strokeWidth = selectedProxyData(editor, 'strokeWidth')
const strokeAlign = selectedProxyData(editor, 'strokeAlign', undefined, true)
const strokeJoin = selectedProxyData(editor, 'strokeJoin', undefined, true)
const strokeCap = selectedProxyData(editor, 'strokeCap', undefined, true)
 
const options = computed(() => [
    { value: 'inside', label: t('leaferEditorLayouts.panelRight.attribute.stroke.alignOptions.inside') },
    { value: 'center', label: t('leaferEditorLayouts.panelRight.attribute.stroke.alignOptions.center') },
    { value: 'outside', label: t('leaferEditorLayouts.panelRight.attribute.stroke.alignOptions.outside') },
])

const strokeJoinOptions = computed(() => [
    { value: 'miter', label: t('leaferEditorLayouts.panelRight.attribute.stroke.joinOptions.miter') },
    { value: 'bevel', label: t('leaferEditorLayouts.panelRight.attribute.stroke.joinOptions.bevel') },
    { value: 'round', label: t('leaferEditorLayouts.panelRight.attribute.stroke.joinOptions.round') },
])

const strokeCapOptions = computed(() => [
    { value: 'none', label: t('leaferEditorLayouts.panelRight.attribute.stroke.capOptions.none') },
    { value: 'round', label: t('leaferEditorLayouts.panelRight.attribute.stroke.capOptions.round') },
    { value: 'square', label: t('leaferEditorLayouts.panelRight.attribute.stroke.capOptions.square') },
])

const strokeArray = ref<any[]>([])
watchEffect(() => {
    if (stroke.value.modelValue) {
        const s = stroke.value.modelValue
        if (!s || typeof s === 'string') {
            strokeArray.value = [
                {
                    type: 'solid',
                    color: s,
                }
            ]
        } else {
            strokeArray.value = s
        }
    } else {
        strokeArray.value = []
    }
})

const refreshStroke = () => {
    stroke.value.onChange(strokeArray.value.length <= 0 ? [] : strokeArray.value)
}

const addStroke = () => {
    strokeArray.value.push({
        type: 'solid',
        color: layoutTheme.defaultStrokeColor ?? '#66CCFF',
    })
    refreshStroke()
    stroke.value.onEnd()
}
const removeStroke = (index: number) => {
    strokeArray.value.splice(index, 1)
    refreshStroke()
    stroke.value.onEnd()
}
const updateFormatData = (data: any, index: number) => {
    strokeArray.value[index] = data
    refreshStroke()
}
const onVisibleChange = (visible: boolean) => {
    if (visible) return
    stroke.value.onEnd()
}
</script>

<template>
    <Panel :title="t('leaferEditorLayouts.panelRight.attribute.stroke.title')" @click-add="addStroke">
        <a-space direction="vertical">
            <a-row v-if="strokeArray.length > 0" :gutter="[4, 4]">
                <a-col :span="10">
                    <swipeNumber size="small" :min="1" :label="t('leaferEditorLayouts.panelRight.attribute.stroke.widthLabel')"
                        v-bind="strokeWidth" :hide-button="false" />
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeJoin" :options="strokeJoinOptions">
                        <template #prefix>
                            {{ t('leaferEditorLayouts.panelRight.attribute.stroke.joinPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeAlign" :options="options">
                        <template #prefix>
                            {{ t('leaferEditorLayouts.panelRight.attribute.stroke.alignPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeCap" :options="strokeCapOptions">
                        <template #prefix>
                            {{ t('leaferEditorLayouts.panelRight.attribute.stroke.capPrefix') }}
                        </template>
                    </a-select>
                </a-col>
            </a-row>
            <a-row :gutter="[8, 4]" v-for="(item, index) in strokeArray" :key="index" :align="'center'">
                <a-col :span="18">
                    <fillPicker :defaultValue="() => strokeArray[index]" :labels="fillPickerLabels"
                        @format-data="(data) => updateFormatData(data, index)" @change="(data) => {
                            updateFormatData(data, index)
                            stroke.onEnd()
                        }" @visible-change="onVisibleChange" :options="{
                            showSolid: true,
                            showLinear: true,
                            showRadial: true,
                            showImage: true,
                        }" :imageFillConfig="imageFill" />
                </a-col>
                <a-col :span="3.5" class="mlauto">
                    <a-button size="small" class="icon-btn" @click="removeStroke(index)">
                        <template #icon>
                            <icon-minus />
                        </template>
                    </a-button>
                </a-col>
            </a-row>
        </a-space>
    </Panel>
</template>