<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <swipeNumber size="small" :precision="0"
                    :label="$t('leaferEditorLayouts.panelRight.attribute.some.swipeNumber.xLabel')" v-bind="x" />
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" :precision="0"
                    :label="$t('leaferEditorLayouts.panelRight.attribute.some.swipeNumber.yLabel')" v-bind="y" />
            </a-col>
            <!--  -->
            <a-col :span="10">
                <swipeNumber size="small" :label="$t('leaferEditorLayouts.panelRight.attribute.some.swipeNumber.rxLabel')"
                    v-bind="rx">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" :label="$t('leaferEditorLayouts.panelRight.attribute.some.swipeNumber.ryLabel')"
                    v-bind="ry">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" v-bind="rotation" :step="0.1" :range-loop="[-180, 180]">
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
                        <a-button size="small" @click="triggerShortcut('shift+h')">
                            <template #icon>
                                <!-- <BxReflectHorizontal /> -->
                                <div class="i-svg:bx-reflect-vertical w1.2em h1.2em"></div>
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey
                                :content="$t('leaferEditorLayouts.panelRight.attribute.some.transform.horizontalFlip')"
                                :keys="['Shift', 'H']" />
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="triggerShortcut('shift+v')">
                            <template #icon>
                                <div class="i-svg:bx-reflect-horizontal w1.2em h1.2em"></div>
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey
                                :content="$t('leaferEditorLayouts.panelRight.attribute.some.transform.verticalFlip')"
                                :keys="['Shift', 'V']" />
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { ShortcutPluginServiceName, type IShortcutPluginService } from "../../../../../plugins"
import TipContentKey from "../../../../components/tooltip";
import BxRevision from "../../../../assets/icons/bx-revision.svg";
import { useLeaferEditor } from '../../../../editorContext';
import { useActiveObjectModel } from "../useActiveObjectModel";
import { toFixed } from "../../../../../utils/math";
import swipeNumber from '../../../../components/swipeNumber.vue';

const editor = useLeaferEditor();

const triggerShortcut = (combo: string) =>
    editor.getService<IShortcutPluginService>(ShortcutPluginServiceName)?.trigger(combo);

const x = useActiveObjectModel(editor, editor.app.editor.element!.x, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.x = v;
})
const y = useActiveObjectModel(editor, editor.app.editor.element!.y, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.y = v;
})

const rx = useActiveObjectModel(editor, editor.app.editor.element!.skewX, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.skewX = v;
})
const ry = useActiveObjectModel(editor, editor.app.editor.element!.skewY, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.skewY = v;
})

const rotation = useActiveObjectModel(editor, editor.app.editor.element!.rotation, (v: any, oldValue: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.rotateOf("center", v - (oldValue || 0));
    // editor.app.editor.element!.rotation = v;
})

const setValue = () => {
    x.value.onChange(toFixed(editor.app.editor.element?.x as number, 0));
    y.value.onChange(toFixed(editor.app.editor.element?.y as number, 0));
    rx.value.onChange(editor.app.editor.element?.skewX);
    ry.value.onChange(editor.app.editor.element?.skewY);
    rotation.value.onChange(editor.app.editor.element?.rotation, false);
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