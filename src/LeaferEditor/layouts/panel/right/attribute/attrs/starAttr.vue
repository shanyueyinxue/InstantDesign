<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Panel from "./panel.vue";
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import swipeNumber from '../../../../components/swipeNumber.vue';

const { t } = useI18n()

const editor = useLeaferEditor()

const corners = selectedProxyData(editor, 'corners')
const innerRadius = selectedProxyData(editor, 'innerRadius')
const cornerRadius = selectedProxyData(editor, 'cornerRadius')
</script>

<template>
    <Panel :title=" t('leaferEditorLayouts.panelRight.attribute.star.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="corners" :label=" t('leaferEditorLayouts.panelRight.attribute.star.corners')" :min="3" :labelWidth="'80px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="cornerRadius" :label=" t('leaferEditorLayouts.panelRight.attribute.star.cornerRadius')" :min="0" :labelWidth="'80px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="innerRadius" :label=" t('leaferEditorLayouts.panelRight.attribute.star.innerRadius')" :min=".01" :max="1" :step="0.05"
                    :labelWidth="'80px'" />
            </a-col>
        </a-row>
    </Panel>
</template>