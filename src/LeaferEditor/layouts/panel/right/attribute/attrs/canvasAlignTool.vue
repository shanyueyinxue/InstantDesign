<template>
    <Panel :title="t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.title')" hidden-add>
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="20">
                <a-space>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasLeft">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-left"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.left') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasRight">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-right"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.right') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasTop">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-top"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.top') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasBottom">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-bottom"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.bottom') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasXCenter">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-center"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.xcenter') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="br">
                        <a-button size="small" @click="canvasYCenter">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-center"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('leaferEditorLayouts.panelRight.attribute.alignmentToCanvas.ycenter') }}
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </Panel>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLeaferEditor } from '../../../../editorContext';
import { activeObject } from '../../../../selectedProxyData';
import Panel from "./panel.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const editor = useLeaferEditor();

const active = computed(() => {
    return activeObject.value ? activeObject.value : editor.app.editor.element!;
})

// 左贴画布
const canvasLeft = () => {
    const children = editor.selected
    const canvasLeft = editor.page.current.contentFrame.x || 0;
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = canvasLeft + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};
// 右贴画布
const canvasRight = () => {
    const children = editor.selected
    const canvasRight = (editor.page.current.contentFrame.x || 0) + (editor.page.current.contentFrame.width || 0)
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = canvasRight - bounds.width + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};
// 顶贴画布
const canvasTop = () => {
    const children = editor.selected
    const canvasTop = editor.page.current.contentFrame.y || 0;
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = canvasTop + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};
// 底贴画布
const canvasBottom = () => {
    const children = editor.selected
    const canvasBottom = (editor.page.current.contentFrame.y || 0) + (editor.page.current.contentFrame.height || 0)
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = canvasBottom - bounds.height + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};

// 水平居中于画布
const canvasXCenter = () => {
    const children = editor.selected
    const canvasWidth = editor.page.current.contentFrame.width || 0;
    const canvasLeft = editor.page.current.contentFrame.x || 0;
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = canvasLeft + (canvasWidth - bounds.width) / 2 + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};
// 垂直居中于画布
const canvasYCenter = () => {
    const children = editor.selected
    const canvasHeight = editor.page.current.contentFrame.height || 0;
    const canvasTop = editor.page.current.contentFrame.y || 0;
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = canvasTop + (canvasHeight - bounds.height) / 2 + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.history.save()
};

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
