<template>
    <template v-for="(com, index) in componentList" :key="com.name">
        <template v-if="com.show()">
            <a-divider :margin="0" v-if="index !== 0" />
            <component :is="com.component" />
        </template>
    </template>
</template>

<script setup lang="ts">
import canvasAttr from "./attrs/canvasAttr.vue";
import canvasAutoSizeAttr from './attrs/canvasAutoSizeAttr.vue';
import canvasBgAttr from './attrs/canvasBgAttr.vue';
import drawAttr from './attrs/drawAttr.vue';
import canvasLocalUpload from './attrs/canvasLocalUpload.vue';
import { useLeaferEditor } from '../../../editorContext';
import { useLayoutOptions, resolveSlotList, type AttrSlotItem } from '../../../layoutOptions';
import { computed, onUnmounted, ref } from "vue";
import { createCounter } from "../../../../utils";

const editor = useLeaferEditor();
const layoutOptions = useLayoutOptions();

const componentList = computed((): AttrSlotItem[] => {
    const order = createCounter(100, 100)

    const builtin: AttrSlotItem[] = [
        {
            name: "canvasAttr",
            component: canvasAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "canvasAutoSizeAttr",
            component: canvasAutoSizeAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "canvasLocalUpload",
            component: canvasLocalUpload,
            order: order(),
            show: () => true,
        },
        {
            name: "canvasBgAttr",
            component: canvasBgAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "drawAttr",
            component: drawAttr,
            order: order(),
            show: () => editMode.value === "draw",
        },
    ]
    return resolveSlotList(builtin, layoutOptions.slots?.attributeZero).map((item) => ({
        ...item,
        show: item.show ?? (() => true),
    }))
})

const editMode = ref(editor.mode.current)

const updataEditMode = (mode: string) => {
    editMode.value = mode;
}
editor.eventBus.on(editor.Events.changeMode, updataEditMode)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.changeMode, updataEditMode)
})
</script>

<style scoped></style>