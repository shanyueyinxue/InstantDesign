<template>
    <div class="wrap w100% h100% ">
        <div class="w100% h100% overflow-auto scrollbar">
            <div class="p-20px flex flex-col">
                <div v-for="item in dataList">
                    <a-divider orientation="left">{{ item.label }}</a-divider>
                    <a-button v-for="item2 in item.items" :key="item2.label" @click="item2.onClick"
                        style="width: 78px;height: 78px" class="flex-col m-6px">
                        <i :class="item2.icon" style="width: 78px;height: 78px;margin: 8px;"></i>
                        <span>
                            {{ item2.label ? item2.label : item.label }}
                        </span>
                    </a-button>
                </div>
            </div>
            <br>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLeaferEditor } from '../../../editorContext';
import { useLayoutOptions, useLayoutTheme } from '../../../layoutOptions';
import { predefine } from "../../../../core/utils";
import BarCode from "../../../../core/shapes/BarCode";
import QrCode from "../../../../core/shapes/QrCode";
import addGridlines from "./_addGridlines.vue";
import Dialog from "../../../components/dialog";
import type { IUI } from 'leafer-ui';
import { setCenter } from "./utils";

const { t } = useI18n();
const editor = useLeaferEditor()
const layoutTheme = useLayoutTheme()
const opts = useLayoutOptions()
const shape = opts.shape!
const fontOpts = opts.font!
let _addGridlinesDialog: any = null

const setCenterXY = (ui: IUI) => {
    setCenter(editor.page.current.width, editor.page.current.height, ui)
}
const dataList = computed(() => [
    {
        label: t('leaferEditorLayouts.panelLeft.add.divider.gridLine'),
        items: [
            {
                icon: 'i-svg:gridlines',
                label: t('leaferEditorLayouts.panelLeft.add.button.newGridLine'),
                onClick: (e: MouseEvent) => {
                    if (_addGridlinesDialog) {
                        _addGridlinesDialog.close()
                    }
                    _addGridlinesDialog = Dialog.open({
                        title: t('leaferEditorLayouts.panelLeft.add.divider.gridLine'),
                        width: shape.dialog!.width,
                        height: shape.dialog!.height,
                        top: shape.dialog!.top,
                        left: shape.dialog!.left,
                        body: () => { return h(addGridlines, { editor }) }
                    })
                }
            }
        ]
    },
    {
        label: t('leaferEditorLayouts.panelLeft.add.image.label'),
        items: [
            {
                icon: 'i-svg:image',
                label: t('leaferEditorLayouts.panelLeft.add.image.add'),
                onClick: (e: MouseEvent) => {
                    editor.image.open().then(img => {
                        editor.add(img)
                    })
                }
            }
        ]
    },
    {
        label: t('leaferEditorLayouts.panelLeft.add.divider.text'),
        items: [
            {
                icon: 'i-svg:title',
                label: t('leaferEditorLayouts.panelLeft.add.button.addTitle'),
                onClick: () => {
                    const tObj = predefine.text({
                        fill: fontOpts.defaultTextColor!,
                        text: t('leaferEditorLayouts.panelLeft.add.default.titleText'),
                        x: 0,
                        y: 0,
                        resizeFontSize: true,
                        fontSize: shape.title!.fontSize,
                        editable: true,
                        fontWeight: shape.title!.fontWeight as any,
                        lineHeight: {
                            type: 'percent',
                            value: shape.title!.lineHeight!
                        },
                    })
                    setCenterXY(tObj)
                    editor.add(tObj)
                }
            },
            {
                icon: 'i-svg:text',
                label: t('leaferEditorLayouts.panelLeft.add.button.addBody'),
                onClick: () => {
                    const tObj = predefine.text({
                        fill: fontOpts.defaultTextColor!,
                        text: t('leaferEditorLayouts.panelLeft.add.default.bodyText'),
                        x: 0,
                        y: 0,
                        fontSize: shape.body!.fontSize,
                        editable: true,
                        lineHeight: {
                            type: 'percent',
                            value: shape.body!.lineHeight!
                        },
                    })
                    setCenterXY(tObj)
                    editor.add(tObj)
                }
            },
            {
                icon: 'i-svg:paragraph',
                label: t('leaferEditorLayouts.panelLeft.add.button.addParagraph'),
                onClick: () => {
                    const tObj = predefine.text({
                        fill: fontOpts.defaultTextColor!,
                        text: t('leaferEditorLayouts.panelLeft.add.default.paragraphText'),
                        x: 0,
                        y: 0,
                        width: shape.subtitle!.width,
                        height: shape.subtitle!.height,
                        fontSize: shape.subtitle!.fontSize,
                        editable: true,
                    })
                    setCenterXY(tObj)
                    editor.add(tObj)
                }
            }
        ]
    },
    {
        label: t('leaferEditorLayouts.panelLeft.add.divider.element'),
        items: [
            {
                icon: 'i-svg:line',
                label: t('leaferEditorLayouts.panelLeft.add.button.line'),
                onClick: () => {
                    const line = predefine.line({
                        width: shape.line!.width,
                        strokeWidth: shape.line!.strokeWidth,
                        stroke: layoutTheme.defaultStrokeColor ?? '#66CCFF',
                        rotation: shape.line!.rotation,
                    })
                    setCenterXY(line)
                    editor.setNormalizeAttr(line)
                    editor.add(line)
                }
            },
            {
                icon: 'i-svg:arrow',
                label: t('leaferEditorLayouts.panelLeft.add.button.arrow'),
                onClick: () => {
                    const arrow = predefine.arrow({
                        width: shape.arrow!.width,
                        strokeWidth: shape.arrow!.strokeWidth,
                        stroke: layoutTheme.defaultStrokeColor ?? '#66CCFF',
                        rotation: shape.arrow!.rotation,
                    })
                    setCenterXY(arrow)
                    editor.setNormalizeAttr(arrow)
                    editor.add(arrow)
                }
            }
        ]
    },
    {
        label: t('leaferEditorLayouts.panelLeft.add.divider.shape'),
        items: [
            {
                icon: 'i-svg:rectangle',
                label: t('leaferEditorLayouts.panelLeft.add.button.rectangle'),
                onClick: () => {
                    const rect = predefine.rect({
                        width: shape.rect!.width,
                        height: shape.rect!.height,
                        fill: layoutTheme.defaultFillColor ?? '#66CCFF',
                        stroke: layoutTheme.defaultStrokeColor ?? '#66CCFF',
                        strokeWidth: shape.rect!.strokeWidth,
                    })
                    setCenterXY(rect)
                    editor.setNormalizeAttr(rect)
                    editor.add(rect)
                }
            },
            {
                icon: 'i-svg:circle',
                label: t('leaferEditorLayouts.panelLeft.add.button.circle'),
                onClick: () => {
                    const ellipse = predefine.ellipse({
                        width: shape.circle!.width,
                        height: shape.circle!.height,
                        fill: layoutTheme.defaultFillColor ?? '#66CCFF'
                    })
                    setCenterXY(ellipse)
                    editor.setNormalizeAttr(ellipse)
                    editor.add(ellipse)
                }
            },
            {
                icon: 'i-svg:ellipse',
                label: t('leaferEditorLayouts.panelLeft.add.button.ellipse'),
                onClick: () => {
                    const ellipse = predefine.ring({
                        width: shape.ring!.width,
                        height: shape.ring!.height,
                        innerRadius: shape.ring!.innerRadius,
                        fill: layoutTheme.defaultFillColor ?? '#66CCFF'
                    })
                    setCenterXY(ellipse)
                    editor.setNormalizeAttr(ellipse)
                    editor.add(ellipse)
                }
            },
            {
                icon: 'i-svg:polygon',
                label: t('leaferEditorLayouts.panelLeft.add.button.polygon'),
                onClick: () => {
                    const polygon = predefine.polygon({
                        width: shape.polygon!.width,
                        height: shape.polygon!.height,
                        sides: shape.polygon!.sides,
                        fill: layoutTheme.defaultFillColor ?? '#66CCFF'
                    })
                    setCenterXY(polygon)
                    editor.setNormalizeAttr(polygon)
                    editor.add(polygon)
                }
            },
            {
                icon: 'i-svg:star',
                label: t('leaferEditorLayouts.panelLeft.add.button.star'),
                onClick: () => {
                    const star = predefine.star({
                        width: shape.star!.width,
                        height: shape.star!.height,
                        corners: shape.star!.corners,
                        fill: layoutTheme.defaultFillColor ?? '#66CCFF'
                    })
                    setCenterXY(star)
                    editor.setNormalizeAttr(star)
                    editor.add(star)
                }
            },
        ]
    },
    {
        label: t('leaferEditorLayouts.panelLeft.add.divider.barcodeTool'),
        items: [
            {
                icon: 'i-svg:barcode',
                label: t('leaferEditorLayouts.panelLeft.add.button.barcode'),
                onClick: () => {
                    const code = new BarCode({
                        editable: true,
                        x: 0,
                        y: 0,
                        text: shape.barcode!.text!,
                        codeHeight: shape.barcode!.codeHeight!,
                    })
                    setCenterXY(code)
                    editor.add(code)
                }
            },
            {
                icon: 'i-svg:qrcode',
                label: t('leaferEditorLayouts.panelLeft.add.button.qrcode'),
                onClick: () => {
                    const code = new QrCode({
                        editable: true,
                        x: 0,
                        y: 0,
                        text: shape.qrcode!.text!,
                        size: shape.qrcode!.size!,
                    })
                    setCenterXY(code)
                    editor.add(code)
                }
            }
        ]
    },
])

</script>

<style lang="less" scoped>
// 滚动条
.scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(201, 205, 212);
    border-radius: 4px;
}

.scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
}

.wrap {
    padding-right: 5px;
}
</style>