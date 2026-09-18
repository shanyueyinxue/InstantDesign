<template>
    <layerAttr :title="$t('leaferEditorLayouts.panelRight.attribute.some.layerAttr.title')" :opacity="opacity"
        :blendMode="blendMode" :visible="visible"></layerAttr>
</template>
<script setup lang="ts">
import { useLeaferEditor } from '../../../../editorContext';
import { useActiveObjectModel } from "../useActiveObjectModel";
import layerAttr from "../attrs/_layerAttr.vue";

const editor = useLeaferEditor();


const everyEqual = (arr: any[], itemKey: string) => {
    return arr.every((item, index, arr) => {
        if (index === 0) return true;
        return item[itemKey] === arr[0][itemKey];
    });
}

const opacity = useActiveObjectModel(editor, everyEqual(editor.selected, 'opacity') ? editor.selected[0]!.opacity : 1, (v: any) => {
    editor.selected.forEach((item) => {
        item.opacity = v;
    });
})
const blendMode = useActiveObjectModel(editor, everyEqual(editor.selected, 'blendMode') ? editor.selected[0]!.blendMode : 'unknown', (v: any) => {
    editor.selected.forEach((item) => {
        item.blendMode = v;
    });
})
const visible = useActiveObjectModel(editor, everyEqual(editor.selected, 'visible') ? editor.selected[0]!.visible : true, (v: any) => {
    editor.selected.forEach((item) => {
        item.visible = v;
    });
})
</script>

<style scoped></style>