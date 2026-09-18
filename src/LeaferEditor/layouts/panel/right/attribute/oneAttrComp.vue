<template>
    <template v-for="(com, index) in componentList" :key="com.name">
        <template v-if="com.show()">
            <a-divider :margin="0" v-if="index !== 0" />
            <component :is="com.component" />
        </template>
    </template>
    <br>
</template>

<script setup lang="ts">
import alignTool from "./attrs/alignTool.vue";
import canvasAlignTool from "./attrs/canvasAlignTool.vue";
import baseAttr from "./attrs/baseAttr.vue";
// import originAttr from "./attrs/originAttr.vue";
import layerAttr from "./attrs/layerAttr.vue";
import layerNameAttr from "./attrs/layerNameAttr.vue";
import groupAttr from "./attrs/groupAttr.vue";
import ungroupAttr from "./attrs/ungroupAttr.vue";
import imageAttr from "./attrs/imageAttr.vue";
import textAttr from "./attrs/textAttr.vue";
import fillAttr from "./attrs/fillAttr.vue";
import strokeAttr from "./attrs/strokeAttr.vue";
import shadowAttr from "./attrs/shadowAttr.vue";
import barcodeAttr from "./attrs/barcodeAttr.vue";
import qrcodeAttr from "./attrs/qrcodeAttr.vue";
import lineAttr from "./attrs/lineAttr.vue";
import arrowAttr from "./attrs/arrowAttr.vue";
import rectAttr from "./attrs/rectAttr.vue";
import ellipseAttr from "./attrs/ellipseAttr.vue";
import polygonAttr from "./attrs/polygonAttr.vue";
import starAttr from "./attrs/starAttr.vue";

import { computed } from "vue";
import { Tag } from "../../../../core/interfaces";
import { useLeaferEditor } from '../../../editorContext';
import { selectedProxyData } from '../../../selectedProxyData';
import { useLayoutOptions, resolveSlotList, type AttrSlotItem } from '../../../layoutOptions';
import { createCounter } from "../../../../utils";

const editor = useLeaferEditor()
const layoutOptions = useLayoutOptions()
const tag = selectedProxyData(editor, 'tag')


const componentList = computed((): AttrSlotItem[] => {
    const order = createCounter(100, 100)

    const builtin: AttrSlotItem[] = [
        {
            name: "baseAttr",
            component: baseAttr,
            order: order(),
            show: () => true,
        },
        // {
        //     name: "originAttr",
        //     component: originAttr,
        //     order:order(),
        //     show: () => false,
        // },
        {
            name: "ungroupAttr",
            component: ungroupAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "alignTool",
            component: alignTool,
            order: order(),
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "canvasAlignTool",
            component: canvasAlignTool,
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
            name: "layerNameAttr",
            component: layerNameAttr,
            order: order(),
            show: () => true,
        },
        {
            name: "groupAttr",
            component: groupAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "textAttr",
            component: textAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Text,
        },
        {
            name: "imageAttr",
            component: imageAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Image,
        },
        {
            name: "barcodeAttr",
            component: barcodeAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.BarCode,
        },
        {
            name: "qrcodeAttr",
            component: qrcodeAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.QrCode,
        },
        {
            name: "lineAttr",
            component: lineAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Line,
        },
        {
            name: "arrowAttr",
            component: arrowAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Arrow,
        },
        {
            name: "rectAttr",
            component: rectAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Rect,
        },
        {
            name: "ellipseAttr",
            component: ellipseAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Ellipse,
        },
        {
            name: "polygonAttr",
            component: polygonAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Polygon,
        },
        {
            name: "starAttr",
            component: starAttr,
            order: order(),
            show: () => tag.value.modelValue === Tag.Star,
        },
        {
            name: "fillAttr",
            component: fillAttr,
            order: order(),
            show: () => {
                return !(([Tag.Image, Tag.Pen, Tag.Group, Tag.Line, Tag.QrCode, Tag.BarCode, Tag.Arrow]).includes(tag.value.modelValue))
            },
        },
        {
            name: "strokeAttr",
            component: strokeAttr,
            order: order(),
            show: () => {
                return !(([Tag.Pen, Tag.Group]).includes(tag.value.modelValue))
            },
        },
        {
            name: "shadowAttr",
            component: shadowAttr,
            order: order(),
            show: () => {
                return !(([Tag.Pen, Tag.Group]).includes(tag.value.modelValue))
            },
        },
    ]
    return resolveSlotList(builtin, layoutOptions.slots?.attributeOne).map((item) => ({
        ...item,
        show: item.show ?? (() => true),
    }))
})

</script>

<style scoped></style>