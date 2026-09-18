<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import type { TreeNodeData } from '@arco-design/web-vue';
import type { IUI } from 'leafer-ui';
import Panel from './panel.vue'
import { useLeaferEditor } from '../../../../editorContext';
import { activeObject } from '../../../../selectedProxyData';
import { Tag } from '../../../../../core/interfaces';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const editor = useLeaferEditor();

const version = ref(0)

// BUG：Pen 内部使用Path 时，会自动添加一个 Path 的父节点，导致树结构不正确
// 解决方法：递归生成全新的树快照数据，保留多层级，仅对 Pen 节点裁剪其内部子节点，避免直接修改 activeObject
const mapNode = (child: IUI): TreeNodeData => ({
    key: child.innerId,
    name: child.name,
    visible: child.visible,
    mask: child.mask,
    eraser: child.eraser,
    ui: child,
    children: (child.children && child.tag !== Tag.Pen)
        ? child.children.map(mapNode).reverse() || [] // 逆序排列，确保父节点在子节点之前
        : undefined,
} as unknown as TreeNodeData)

const children = computed<TreeNodeData[]>(() => {
    void version.value
    if (!activeObject.value) {
        return []
    }
    return (activeObject.value.children ?? []).map(mapNode).reverse() || [] // 逆序排列，确保父节点在子节点之前
})

const toggleVisible = (nodeData: TreeNodeData & { ui: IUI }) => {
    nodeData.ui.visible = !nodeData.ui.visible
    version.value++
}

const toggleMask = (nodeData: TreeNodeData & { ui: IUI }) => {
    nodeData.ui.mask = !nodeData.ui.mask
    version.value++
    const currentScale = editor.currentScale
    editor.zoom(currentScale + 1)
    editor.zoom(currentScale)
}

const toggleEraser = (nodeData: TreeNodeData & { ui: IUI }) => {
    nodeData.ui.eraser = !nodeData.ui.eraser
    version.value++
    const currentScale = editor.currentScale
    editor.zoom(currentScale + 1)
    editor.zoom(currentScale)
}

const _updateChildren = () => {
    version.value++
}
editor.eventBus.on(editor.Events.historyStateSavedAfter, _updateChildren)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.historyStateSavedAfter, _updateChildren)
})
</script>
<template>
    <div>
        <Panel hidden-add>
            <template #title>
                <div>
                    {{ t('leaferEditorLayouts.panelRight.attribute.group.title') }}
                    <a-tooltip mini position="lb">
                        <icon-question-circle class="cursor-pointer" :size="14" style="color: rgb(var(--primary-6))" />
                        <template #content>
                            <a-divider orientation="left">
                                {{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.visibility') }}</a-divider>
                            <p>{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.visibilityDesc') }}</p>
                            <a-divider orientation="left">{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.mask') }}</a-divider>
                            <p>{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.maskDesc') }}</p>
                            <a-divider orientation="left">{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.eraser')
                                }}</a-divider>
                            <p>{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.eraserDesc') }}</p>
                            <a-divider orientation="left"></a-divider>
                            <p>{{ t('leaferEditorLayouts.panelRight.attribute.group.tooltip.note') }}</p>
                        </template>
                    </a-tooltip>
                </div>
            </template>
            <a-space direction="vertical" style="width: 100%">
                <a-row :gutter="[8, 4]">
                    <a-col :span="24">
                        <div style="width: 100%; padding: 2px;max-height: 100%">
                            <a-tree :data="children" style="overflow-x: auto;" size="small">
                                <template #title="nodeData">
                                    <span :title="nodeData.name" class="name">{{ nodeData.name }}</span>
                                </template>
                                <template #extra="nodeData">
                                    <div style="position: absolute; right: 8px; font-size: 12px; color: #3370ff;">
                                        <!-- 显隐按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="t('leaferEditorLayouts.panelRight.attribute.group.tooltip.visibility')">
                                            <a-button size="small" class="icon-btn" @click="toggleVisible(nodeData)">
                                                <template #icon>
                                                    <icon-eye v-if="nodeData.visible === true" />
                                                    <icon-eye-invisible v-else />
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <!-- 遮罩按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="nodeData.mask ? `${nodeData.mask}` : t('leaferEditorLayouts.panelRight.attribute.group.tooltip.mask')">
                                            <a-button size="small" class="icon-btn" @click="toggleMask(nodeData)">
                                                <template #icon>
                                                    <div class="i-svg:mask icon"
                                                        :class="{ 'arco-icon-check': nodeData.mask }"></div>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <!-- 擦除按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="t('leaferEditorLayouts.panelRight.attribute.group.tooltip.eraser')">
                                            <a-button size="small" class="icon-btn" @click="toggleEraser(nodeData)">
                                                <template #icon>
                                                    <div class="i-svg:eraser icon"
                                                        :class="{ 'arco-icon-check': nodeData.eraser }"></div>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>
<style scoped lang="less">
.name {
    overflow: hidden;
}

:deep(.arco-tree-node) {
    padding-right: 10px;

    .arco-tree-node-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        // .arco-tree-node-title-text {
        // }
    }
}

.arco-icon-check {
    color: rgb(var(--primary-6));
}
</style>
