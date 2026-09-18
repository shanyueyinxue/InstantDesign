<script setup lang="ts">
import Panel from "./panel.vue";
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import swipeNumber from '../../../../components/swipeNumber.vue';

const editor = useLeaferEditor()

const innerRadius = selectedProxyData(editor, 'innerRadius')
const startAngle = selectedProxyData(editor, 'startAngle')
const endAngle = selectedProxyData(editor, 'endAngle')
</script>

<template>
    <Panel :title="$t('leaferEditorLayouts.panelRight.attribute.ellipse.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="innerRadius" :label="$t('leaferEditorLayouts.panelRight.attribute.ellipse.innerRadius')" :min="0" :max="1" :step="0.01" :labelWidth="'75px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="startAngle" :label="$t('leaferEditorLayouts.panelRight.attribute.ellipse.startAngle')" :min="0" :max="360" :step="0.5" :labelWidth="'75px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="endAngle" :label="$t('leaferEditorLayouts.panelRight.attribute.ellipse.endAngle')" :min="0" :max="360" :step="0.5" :labelWidth="'75px'" />
            </a-col>
        </a-row>
    </Panel>
</template>