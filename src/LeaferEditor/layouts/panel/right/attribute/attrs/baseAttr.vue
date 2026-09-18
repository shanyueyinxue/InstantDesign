<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <swipeNumber size="small" label="X" v-bind="x" :disabled="disabled" :readonly="readonly" :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="Y" v-bind="y" :disabled="disabled" :readonly="readonly" :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10" v-if="tag.modelValue !== 'Group' && tag.modelValue !== 'Pen'">
                <swipeNumber size="small" label="W" v-bind="width" :min="1" :disabled="disabled" :readonly="readonly"
                    :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10" v-if="tag.modelValue !== 'Group' && tag.modelValue !== 'Pen'">
                <swipeNumber size="small" label="H" v-bind="height" :min="1" :disabled="disabled" :readonly="readonly"
                    :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="RX" v-bind="rx" :disabled="disabled" :readonly="readonly">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="RY" v-bind="ry" :disabled="disabled" :readonly="readonly">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" v-bind="rotation2" :step="0.1" :disabled="disabled" :readonly="readonly"
                    :range-loop="[-180, 180]">
                    <template #label>
                        <BxRevision />
                    </template>
                    <template #suffix>
                        <div class="absolute top-1 right-1">°</div>
                    </template>
                </swipeNumber>
            </a-col>
            <a-col :span="8">
                <a-space size="mini">
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="triggerShortcut('shift+h')" :disabled="disabled"
                            :readonly="readonly">
                            <template #icon>
                                <div class="i-svg:bx-reflect-vertical w1.2em h1.2em"></div>
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('leaferEditorLayouts.panelRight.attribute.some.transform.horizontalFlip')"
                                :keys="['Shift', 'H']" />
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="() => {
                            triggerShortcut('shift+v')
                        }" :disabled="disabled" :readonly="readonly">
                            <template #icon>
                                <div class="i-svg:bx-reflect-horizontal w1.2em h1.2em"></div>
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('leaferEditorLayouts.panelRight.attribute.some.transform.verticalFlip')"
                                :keys="['Shift', 'V']" />
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </div>
    <div class="attr">
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { ShortcutPluginServiceName, type IShortcutPluginService } from "../../../../../plugins"
import TipContentKey from "../../../../components/tooltip";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData, activeObject } from '../../../../selectedProxyData';

import BxRevision from "../../../../assets/icons/bx-revision.svg";
import { useActiveObjectModel } from "../useActiveObjectModel";

const readonly = ref(false)
const disabled = ref(false)

const editor = useLeaferEditor()

const triggerShortcut = (combo: string) =>
    editor.getService<IShortcutPluginService>(ShortcutPluginServiceName)?.trigger(combo);

const width = selectedProxyData(editor, "width")
const height = selectedProxyData(editor, "height");
const x = selectedProxyData(editor, "x");
const y = selectedProxyData(editor, "y");

const rotation = selectedProxyData(editor, 'rotation')
const rx = selectedProxyData(editor, 'skewX')
const ry = selectedProxyData(editor, 'skewY')
const tag = selectedProxyData(editor, 'tag')

const locked = selectedProxyData(editor, 'locked', false)

const rotation2 = useActiveObjectModel(editor, activeObject.value!.rotation, (v: any, oldValue: any) => {
    if (!activeObject.value!) return;
    activeObject.value!.rotateOf("center", v - (oldValue || 0));
})

watch(() => activeObject.value, (value) => {
    if (!value) return
    rotation2.value.onChange(value.rotation, false)
})

readonly.value = locked.value.modelValue
disabled.value = locked.value.modelValue
watch(locked, (value) => {
    readonly.value = value.modelValue
    disabled.value = value.modelValue
})

const setValue = () => {
    rotation2.value.onChange(activeObject.value!.rotation, false);
}
setValue();
editor.eventBus.on(editor.Events.canvasChange, setValue);
onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.canvasChange, setValue);
});

</script>
<style scoped>
svg {
    display: inline-block;
    vertical-align: -3.5px;
    width: 20px;
    height: 20px;
    touch-action: none;
    text-align: center;
    fill: currentColor;
}
</style>