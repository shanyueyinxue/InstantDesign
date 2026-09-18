<template>
    <template v-for="(com, index) in componentList" :key="com.name">
        <template v-if="com.show()">
            <a-divider :margin="0" v-if="index !== 0" />
            <component :is="com.component" />
        </template>
    </template>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useLayoutOptions, resolveSlotList, type AttrSlotItem } from '../../../layoutOptions';
import alignTool from "./attrs/alignTool.vue";
import canvasAlignTool from "./attrs/canvasAlignTool.vue";
import baseAttr from "./someAttrs/baseAttr.vue";
import layerAttr from "./someAttrs/layerAttr.vue";
import groupAttr from "./someAttrs/groupAttr.vue";
import { createCounter } from "../../../../utils";

const layoutOptions = useLayoutOptions();

// const tag = selectedProxyData(editor, 'tag')
const componentList = computed((): AttrSlotItem[] => {
    const order = createCounter(100, 100)
    const builtin: AttrSlotItem[] = [
        {
            name: "baseAttr",
            component: baseAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "layerAttr",
            component: layerAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "groupAttr",
            component: groupAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "alignTool",
            component: alignTool,
            order: order(),
            show: () => true,
        },
        {
            name: "canvasAlignTool",
            component: canvasAlignTool,
            order: order(),
            show: () => true,
        },
    ]
    return resolveSlotList(builtin, layoutOptions.slots?.attributeSome).map((item) => ({
        ...item,
        show: item.show ?? (() => true),
    }))
})
</script>
