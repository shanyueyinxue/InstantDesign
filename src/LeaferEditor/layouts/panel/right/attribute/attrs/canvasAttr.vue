<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useLeaferEditor } from '../../../../editorContext';
import SwipeNumber from '../../../../components/swipeNumber.vue';
import { useActiveObjectModel } from "../useActiveObjectModel";


const editor = useLeaferEditor();

const width = useActiveObjectModel(editor, editor.page.current.width, (v: any) => {
    editor.page.current.width = v;
    // editor.canvasResize(v, editor.page.current.height);
})
const height = useActiveObjectModel(editor, editor.page.current.height, (v: any) => {
    editor.page.current.height = v;
    // editor.history.disable();
    // editor.canvasResize(editor.page.current.width, v);
    // editor.history.enable();
})
const overflowCheck = ref(!editor.page.current.overflowShow)
watch(overflowCheck, (v) => {
    editor.page.current.overflowShow = !v;
})

const setValue = () => {
    width.value.onChange(editor.page.current.width, false);
    height.value.onChange(editor.page.current.height, false);
    overflowCheck.value = !editor.page.current.overflowShow
}
setValue();
editor.eventBus.on(editor.Events.pageChangeAfter, setValue);
editor.eventBus.on(editor.Events.undoRedoStackChange, setValue);
editor.eventBus.on(editor.Events.canvasResize, setValue);
onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.pageChangeAfter, setValue);
    editor.eventBus.off(editor.Events.undoRedoStackChange, setValue);
    editor.eventBus.off(editor.Events.canvasResize, setValue);
});
</script>

<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <SwipeNumber size="small" :min="1" :precision="0" label="W" v-bind="width" />
            </a-col>
            <a-col :span="10">
                <SwipeNumber size="small" :min="1" :precision="0" label="H" v-bind="height" />
            </a-col>
            <a-col :span="16">
                <a-checkbox v-model="overflowCheck">{{ $t('leaferEditorLayouts.panelRight.attribute.canvas.overflowHidden')
                    }}</a-checkbox>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped lang="less"></style>
