<template>
    <a-layout id="leafer-editor-layout" class="layout-main" style="height: 100vh;">
        <a-layout-header class="border-bottom">
            <Header :sloganName="sloganName" :logoUrl="logoUrl"></Header>
        </a-layout-header>
        <a-layout class="content-box">
            <PanelLeft></PanelLeft>
            <a-layout>
                <a-layout-content>
                    <CanvasEdit></CanvasEdit>
                </a-layout-content>
                <Footer></Footer>
            </a-layout>
            <PanelRight></PanelRight>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import { onErrorCaptured, onUnmounted, provide, markRaw } from 'vue'
import { useI18n } from "vue-i18n";
import { locales } from "./locales";

import type { LeaferEditorOptions } from '../core'
import { createLeaferEditor } from '../index'
import {
    RulerPlugin,
    ShortcutPlugin,
    ContextMenuPlugin,
    ToolBarPlugin,
    SnapPlugin,
} from '../plugins'
import type { EditorRulerOptions, ShortcutPluginOptions } from '../plugins'

import { LEAFFER_EDITOR_KEY } from './editorContext'
import { initSelectedProxyData } from './selectedProxyData'
import { LAYOUT_OPTIONS_KEY, LAYOUT_API_KEY, mergeLayoutOptions, type LayoutOptions, type LayoutApiOptions } from './layoutOptions'

import CanvasEdit from './canvasEdit/index.vue'
import PanelRight from './panel/right/index.vue'
import PanelLeft from './panel/left/index.vue'
import Header from './header/index.vue'
import Footer from './footer/index.vue'
const i18n = useI18n();
for (const key in locales) {
    i18n.mergeLocaleMessage(key, locales[key]);
}

export interface EditorLayoutOptions extends LeaferEditorOptions {
    ruler?: EditorRulerOptions
    shortcut?: ShortcutPluginOptions
}

const props = defineProps<{
    editorOptions?: EditorLayoutOptions
    sloganName: string
    logoUrl: string
    apis?: LayoutApiOptions
    options?: LayoutOptions
}>()

const { ruler, shortcut, ...coreOptions } = props.editorOptions ?? {}
const editor = markRaw(createLeaferEditor(coreOptions))

editor.use(new RulerPlugin(), ruler)
editor.use(new ShortcutPlugin(), shortcut)
editor.use(new ContextMenuPlugin())
editor.use(new ToolBarPlugin())
editor.use(new SnapPlugin())

defineExpose({ editor })

const layoutOpts = mergeLayoutOptions(editor, props.options)

provide(LEAFFER_EDITOR_KEY, editor)
provide(LAYOUT_OPTIONS_KEY, layoutOpts)
provide(LAYOUT_API_KEY, props.apis)

const cleanupSelectedProxy = initSelectedProxyData(editor)

onUnmounted(() => {
    cleanupSelectedProxy()
    editor.destroy()
})

onErrorCaptured((err, vm, info) => {
    console.error("Global LeaferEditor Error:", err, vm, "; \n", "Component Info:", info);
    console.log(new Error().stack)
    return false
})
</script>
<style scoped lang="less">
@import "./styles/layouts";
@import "./styles/classes";

.layout-main :deep(.arco-layout-header),
.layout-main :deep(.arco-layout-footer),
.layout-main :deep(.arco-layout-sider-children),
.layout-main :deep(.arco-layout-content) {
    display: flex;
    flex-direction: column;
    font-size: 16px;
}

.layout-main :deep(.arco-layout-content) {
    overflow: hidden;
}

.layout-main :deep(.arco-layout-header) {
    height: @header-height;
    justify-content: center;
}

.layout-main :deep(.arco-layout-sider) {
    width: @RightPanelWidth;
}

.content-box {
    height: @panelHeight;
}
</style>
