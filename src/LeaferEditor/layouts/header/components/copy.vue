<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { isDefined } from "@vueuse/core";

import contextMenu from '../../components/contextMenu'
import { useLeaferEditor } from '../../editorContext';
import { utils } from '../../../core';
import { runWhenIdleWithBudget } from '../../../utils/runWhenIdle';
import type { ButtonInstance } from "@arco-design/web-vue/es/button";
import type { MenuItem } from '../../components/contextMenu/ContextMenuDefine';
import Loading from '../../components/loading';

const loading = new Loading("Copying...");
const deepClone = utils.deepClone;
const { t } = useI18n()

const editor = useLeaferEditor();

const button = ref<ButtonInstance>()

function vhToPx(vh: number) {
    return window.innerHeight * (vh / 100);
}
const openMenu = (e: MouseEvent) => {
    if (editor.page.list().length <= 1) {
        return;
    }
    let x = e.clientX
    let y = e.clientY
    if (isDefined(button)) {
        const rect = button.value?.$el.getBoundingClientRect()
        x = Math.max(rect.x - 8, 0)
        y = rect.y + rect.height + 4
    }
    editor.cancel();
    contextMenu.showContextMenu({
        x,
        y,
        preserveIconWidth: false,
        maxHeight: vhToPx(80),
        items: [
            {
                label: t('leaferEditorLayouts.header.copy.all'),
                onClick: async () => {
                    loading.show(t('leaferEditorLayouts.header.copy.copying'))
                    editor.history.save();
                    const current = editor.page.current
                    const pages = editor.page.list().filter(p => p !== current);
                    let index = 0;
                    await runWhenIdleWithBudget(() => {
                        if (index >= pages.length) return false;
                        const page = pages[index]!;
                        page.contentFrame.clear();
                        page.replaceContent(current.contentLayers.map(child => {
                            return child.clone();
                        }))
                        page.contentFrame.fill = deepClone(current.contentFrame.fill);
                        page.contentFrame.blendMode = current.contentFrame.blendMode;
                        editor.page.setCurrent(page.name);
                        if (editor.eventBus.hasExternal("updateCurrentPageThumbnail"))
                            editor.eventBus.emitExternal("updateCurrentPageThumbnail")
                        editor.history.save();
                        index++;
                        return index < pages.length;
                    });
                    setTimeout(() => {
                        if (editor.eventBus.hasExternal("updatePagesThumbnail"))
                            editor.eventBus.emitExternal("updatePagesThumbnail")
                        editor.eventBus.emitExternal("copyToAllPageDone") // 触发事件 复制到其他页面完成
                    }, 200);
                    editor.page.setCurrent(current.name); // 触发事件更新
                    loading.close() // 关闭加载动画
                },
                divided: true,
            },
            ...copyToPage(),
        ],
    })
}
const copyToPage = () => {
    const current = editor.page.current
    // const currentContentFrame = editor.page.current.contentFrame
    const pages = editor.page.list()
    const items: MenuItem[] = []
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i]!
        if (page === current) {
            continue;
        }
        items.push({
            label: page.metaData.title || `page ${i + 1}`,
            onClick: async () => {
                loading.show(t('leaferEditorLayouts.header.copy.copying'))
                const clonedChildren = current.contentLayers.map(child => child.clone());
                const clonedFill = deepClone(current.contentFrame.fill);
                const clonedBlendMode = current.contentFrame.blendMode;
                let step = 0;
                let maxStep = 3;
                await runWhenIdleWithBudget(() => {
                    if (step >= maxStep) return false;
                    if (step === 0) {
                        page.contentFrame.clear();
                        page.replaceContent(clonedChildren);
                        page.contentFrame.fill = clonedFill;
                        page.contentFrame.blendMode = clonedBlendMode;
                    } else if (step === 1) {
                        editor.page.setCurrent(page.name);
                        if (editor.eventBus.hasExternal("updateCurrentPageThumbnail"))
                            editor.eventBus.emitExternal("updateCurrentPageThumbnail")
                        editor.history.save();
                    } else {
                        editor.page.setCurrent(current.name);
                    }
                    step++;
                    return step < maxStep;
                });
                setTimeout(() => {
                    if (editor.eventBus.hasExternal("updatePagesThumbnail"))
                        editor.eventBus.emitExternal("updatePagesThumbnail")
                    editor.eventBus.emitExternal("copyToPageDone") // 触发事件 复制到其他页面完成
                }, 200);
                loading.close()
            },
        })
    }
    return items;
}
</script>

<template>
    <a-button ref="button" class="icon-btn w60px" @click="openMenu">
        {{ t('leaferEditorLayouts.header.copy.copy') }}
        <icon-down class="ml1" />
    </a-button>
</template>

<style scoped lang="less"></style>
