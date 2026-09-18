<script setup lang="ts">
import Panel from "./panel.vue";
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const editor = useLeaferEditor()

const startArrow = selectedProxyData(editor, 'startArrow', undefined, true);
const endArrow = selectedProxyData(editor, 'endArrow', undefined, true);

const arrowList = computed(() => [
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.none'), value: 'none' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.angle'), value: 'angle' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.angle-side'), value: 'angle-side' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.arrow'), value: 'arrow' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.triangle'), value: 'triangle' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.triangle-flip'), value: 'triangle-flip' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.circle'), value: 'circle' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.circle-line'), value: 'circle-line' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.square'), value: 'square' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.square-line'), value: 'square-line' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.diamond'), value: 'diamond' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.diamond-line'), value: 'diamond-line' },
    { label: t('leaferEditorLayouts.panelRight.attribute.arrow.options.mark'), value: 'mark' },
]);
</script>
<template>
    <Panel :title="t('leaferEditorLayouts.panelRight.attribute.arrow.title')" :hiddenAdd="true">
        <div class="line-attr">
            <a-row :gutter="[4, 4]">
                <a-col :span="24">
                    <a-select size="small" :placeholder="t('leaferEditorLayouts.panelRight.attribute.arrow.startPlaceholder')"
                        v-bind="startArrow" :options="arrowList" allow-search>
                        <template #prefix>
                            {{ t('leaferEditorLayouts.panelRight.attribute.arrow.startPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="24">
                    <a-select size="small" :placeholder="t('leaferEditorLayouts.panelRight.attribute.arrow.endPlaceholder')"
                        v-bind="endArrow" :options="arrowList" allow-search>
                        <template #prefix>
                            {{ t('leaferEditorLayouts.panelRight.attribute.arrow.endPrefix') }}
                        </template>
                    </a-select>
                </a-col>
            </a-row>
        </div>
    </Panel>
</template>
