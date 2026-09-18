<script setup lang="ts">
import { shallowRef, watch } from "vue";
import Panel from './panel.vue'

import { useLeaferEditor } from '../../../../editorContext';
import { useActiveObjectModel } from "../useActiveObjectModel";
import SwipeNumber from '../../../../components/swipeNumber.vue';
import { useLayoutOptions } from '../../../../layoutOptions';

const editor = useLeaferEditor();
const drawStyle = shallowRef(editor.mode.penStyle)
const strokePresets = useLayoutOptions().draw!.strokePresets


const strokeWidth = useActiveObjectModel<number>(editor, drawStyle.value.strokeWidth as number, (value) => {
    drawStyle.value = { ...drawStyle.value, strokeWidth: value };
})
const stroke = useActiveObjectModel<string>(editor, drawStyle.value.stroke as string, (value) => {
    drawStyle.value = { ...drawStyle.value, stroke: value };
})
watch(drawStyle, (value) => {
    editor.mode.setPenStyle(value);
});


const setValue = (v: any) => {
    strokeWidth.value.onChange(v);
}
const onColorChange = (color: string) => {
    stroke.value.onChange(color);
}
</script>

<template>
    <Panel :title="$t('leaferEditorLayouts.panelRight.attribute.draw.title')" hidden-add>
        <a-row :gutter="[4, 4]" align="center">
            <a-col :span="13">
                <SwipeNumber size="small" v-bind="strokeWidth" :step="1" :min="1" style="padding: 0 6px"
                    label-class="text-left" label-width="60px">
                    <template #label>
                        <div>{{ $t('leaferEditorLayouts.panelRight.attribute.draw.strokeWidth') }}</div>
                    </template>
                </SwipeNumber>
            </a-col>
            <a-col :span="11">
                <a-radio-group size="small" type="button" v-model="strokeWidth.modelValue" @change="setValue">
                    <a-radio v-for="v in strokePresets" :key="v" :value="v">{{ v }}</a-radio>
                </a-radio-group>
            </a-col>
            <a-col :span="17">
                <a-color-picker v-model="stroke.modelValue" size="mini" @change="onColorChange" @mousedown="(e: MouseEvent) => e.preventDefault()">
                    <a-input size="mini" v-model="stroke.modelValue">
                        <template #prefix>
                            {{ $t('leaferEditorLayouts.panelRight.attribute.draw.strokeColor') }}<div class="w18px h18px ml5px"
                                :style="{ backgroundColor: (stroke.modelValue as string) }">
                            </div>
                        </template>
                    </a-input>
                </a-color-picker>
            </a-col>
        </a-row>
    </Panel>
</template>