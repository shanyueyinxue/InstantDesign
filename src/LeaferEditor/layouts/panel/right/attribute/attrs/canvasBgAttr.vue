<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import Panel from './panel.vue'
import { useLeaferEditor } from '../../../../editorContext';
import fillPicker from "../../../../components/fillPicker";
import { useFillPickerLabels } from "./useFillPickerLabels";
import { useActiveObjectModel } from "../useActiveObjectModel";
import { useImageFill } from "./imageFillMixin";
import { useLayoutTheme } from "../../../../layoutOptions";

const editor = useLeaferEditor();
const imageFill = useImageFill();
const layoutTheme = useLayoutTheme();

const fillPickerLabels = useFillPickerLabels()

// const fill = selectedProxyData("fill")

const fill = useActiveObjectModel(editor, editor.page.current.contentFrame.fill as any, (value) => {
    editor.page.current.contentFrame.fill = value;
});

const fillArray = ref([fill.value.modelValue])

const updateFormatData = (data: any, index: number) => {
    fillArray.value[index] = data
    refreshFill()
}

const refreshFill = () => {
    fill.value.onChange(fillArray.value.length <= 0 ? [] : fillArray.value)
}
const addFill = () => {
    fill.value.onChange([])
    fillArray.value.push({
        type: 'solid',
        color: layoutTheme.defaultFillColor ?? '#66CCFF',
    })
    refreshFill()
}
const removeFill = (index: number) => {
    fillArray.value.splice(index, 1)
    refreshFill()
}
const onVisibleChange = (visible: boolean) => {
    if (visible) return
    fill.value.onEnd()
}
const onColorChange = () => {
    const fillcolor = editor.page.current.contentFrame.fill
    if (!fillcolor || typeof fillcolor === 'string') {
        fillArray.value = [
            {
                type: 'solid',
                color: fillcolor || "transparent",
            }
        ]
    } else {
        // @ts-ignore
        fillArray.value = fillcolor
    }
    refreshFill()
}
onColorChange()
editor.eventBus.on(editor.Events.pageChangeAfter, onColorChange)
editor.eventBus.on(editor.Events.undoRedoStackChange, onColorChange)
onBeforeUnmount(() => {
    fill.value.onEnd()
    editor.eventBus.off(editor.Events.pageChangeAfter, onColorChange)
    editor.eventBus.off(editor.Events.undoRedoStackChange, onColorChange)
})
</script>

<template>
    <Panel :title="$t('leaferEditorLayouts.panelRight.attribute.canvas.background')" @click-add="addFill">
        <a-space direction="vertical">
            <a-row :gutter="[8, 4]" v-for="(item, index) in fillArray" :key="index" :align="'center'">
                <a-col :span="18">
                    <fillPicker :defaultValue="() => fillArray[index]" :labels="fillPickerLabels"
                        @format-data="(data) => updateFormatData(data, index)" @change="(data) => {
                            updateFormatData(data, index)
                            fill.onEnd()
                        }" @visible-change="onVisibleChange" :imageFillConfig="imageFill" />
                </a-col>
                <a-col :span="3.5" class="mlauto">
                    <a-button size="small" class="icon-btn" v-if="index !== 0" @click="removeFill(index)">
                        <template #icon>
                            <icon-minus />
                        </template>
                    </a-button>
                </a-col>
            </a-row>
        </a-space>
    </Panel>
</template>

<style scoped lang="less">
:deep(.arco-row-align-center) {
    align-items: normal;
}
</style>
