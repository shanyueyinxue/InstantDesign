<template>
    <div class="p2 layer-panel" @contextmenu.stop="(e) => e.preventDefault()">
        <DraggableTree style="margin-bottom: 24px;" v-model:items="layerList" v-model:selected-keys="selectedKeys"
            @drag-change="onDragChange" @drag-start="onDragStart" @drag-end="onDragEnd" @select="handleSelectionChange"
            @toggle="onToggle" @contextmenu.stop="onContextMenu">
            <template #actions="{ node }">
                <div class="actions">
                    <a-button size="small" class="icon-btn" @click="changeVisible(node, !isVisible(node))">
                        <template #icon>
                            <icon-eye v-if="isVisible(node)" />
                            <icon-eye-invisible v-else />
                        </template>
                    </a-button>
                    <a-button size="small" class="icon-btn" @click="changeLocked(node, !isLocked(node))">
                        <template #icon>
                            <icon-lock v-if="isLocked(node)" />
                            <icon-unlock v-else />
                        </template>
                    </a-button>
                </div>
            </template>
        </DraggableTree>
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useLeaferEditor } from '../../../editorContext';
import { useLayoutOptions } from '../../../layoutOptions';
import contextMenu from '../../../components/contextMenu'
import DraggableTree from "./DraggableTree";
import { useI18n } from "vue-i18n";
import type { IUI } from 'leafer-ui';
import { Tag } from '../../../../core/interfaces';
import promptInput from '../../../components/promptInput'
import { Message } from '@arco-design/web-vue';

const { t } = useI18n();

const editor = useLeaferEditor();
const opts = useLayoutOptions()
const layerList = ref<(any[])>([]);
const selectedKeys = ref<string[]>();

const isVisible = (item: any) => {
    const ui = editor.page.current.contentFrame.findOne("#" + item.id) as IUI
    if (!ui) return false
    return ui.visible
}
const changeVisible = (item: any, visible: boolean) => {
    const ui = editor.page.current.contentFrame.findOne("#" + item.id) as IUI
    ui.visible = visible
    editor.history.save()
    editor.select(ui)
}
const isLocked = (item: any) => {
    const ui = editor.page.current.contentFrame.findOne("#" + item.id) as IUI
    if (!ui) return false
    return ui.locked
}
const changeLocked = (item: any, locked: boolean) => {
    const ui = editor.page.current.contentFrame.findOne("#" + item.id) as IUI
    ui.locked = locked
    editor.history.save()
    editor.select(ui)
}

const onDragChange = (e: any, items: any[], parentID: string) => {
    let key = ""
    if (e.added) key = 'added'
    if (e.moved) key = 'moved'
    if (!key) return
    const tarID = e[key].element.id
    const target = items.find((i) => i.id === tarID)
    if (!target) return
    let parent
    if (parentID) {
        parent = editor.page.current.contentFrame.findOne("#" + parentID) as IUI
    } else {
        parent = editor.page.current.contentFrame
    }
    const ui = editor.page.current.contentFrame.findOne("#" + tarID) as IUI
    ui.zIndex = 0
    // ui.remove()
    // parent.add(ui)
    ui.dropTo(parent)
    const index = e[key].newIndex || 0
    if (index === items.length - 1) {
        const targetUI = editor.page.current.contentFrame.findOne("#" + items[index - 1].id) as IUI
        editor.layer.moveAfter(ui, targetUI)
    } else {
        const targetUI = editor.page.current.contentFrame.findOne("#" + items[index + 1].id) as IUI
        editor.layer.moveBefore(ui, targetUI)
    }
    editor.removeEmptyGroup()
    updateLayerList()
}

const handleSelectionChange = (e: any, el: any[]) => {
    selectedKeys.value = el
    editor.select(el.map(item => editor.page.current.contentFrame.findOne("#" + item) as IUI));
}

const onSelect = () => {
    const selected = editor.selected;
    if (selected.length > 0) {
        selectedKeys.value = [];
        selectedKeys.value = selected.map((item) => {
            return item.id!;
        });
    }
}
const onCancelSelected = () => {
    selectedKeys.value = [];
}

const onContextMenu = (e: any, el: any) => {
    e.preventDefault()
    if (selectedKeys.value && selectedKeys.value.length !== 1 ||
        (selectedKeys.value && selectedKeys.value.length === 1 && selectedKeys.value[0] !== el.id)
    ) {
        selectedKeys.value = [el.id];
    }
    const ui = editor.page.current.contentFrame.findOne("#" + el.id) as IUI

    contextMenu.showContextMenu({
        x: e.clientX,
        y: e.clientY,
        preserveIconWidth: false,
        items: [
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.rename'),
                onClick: () => {
                    promptInput.open({
                        title: t('leaferEditorLayouts.panelRight.layer.contextMenu.rename'),
                        defaultValue: ui.name,
                        confirmText: t('leaferEditorLayouts.common.confirm'),
                        cancelText: t('leaferEditorLayouts.common.cancel'),
                        onConfirm: (value) => {
                            ui.name = value
                            editor.cancel();
                            editor.history.save();
                            editor.select(ui);
                            Message.success(t('leaferEditorLayouts.common.renameSuccess'))
                        },
                    })
                },
                divided: true,
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.createMask'),
                disabled: ui.parent === editor.page.current.contentFrame,
                hidden: !!ui.mask,
                onClick: () => {
                    ui.mask = true
                    editor.cancel();
                    editor.history.save();
                    editor.select(ui);
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.createClippingMask'),
                disabled: ui.parent === editor.page.current.contentFrame,
                hidden: !!ui.mask,
                onClick: () => {
                    ui.mask = 'clipping'
                    editor.cancel();
                    editor.history.save();
                    editor.select(ui);
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.cancelMask'),
                // disabled: ui.parent === editor.page.current.contentFrame,
                hidden: !ui.mask,
                onClick: () => {
                    ui.mask = false
                    editor.cancel();
                    editor.history.save();
                    editor.select(ui);
                },
                divided: true,
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.createEraser'),
                disabled: ui.parent === editor.page.current.contentFrame,
                hidden: !!ui.eraser,
                onClick: () => {
                    ui.eraser = true
                    editor.cancel();
                    editor.history.save();
                    editor.select(ui);
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.cancelEraser'),
                // disabled: ui.parent === editor.page.current.contentFrame,
                hidden: !ui.eraser,
                onClick: () => {
                    ui.eraser = false
                    editor.cancel();
                    editor.history.save();
                    editor.select(ui);
                },
                divided: true,
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.duplicate'),
                onClick: () => {
                    // const copy = ui.clone();
                    // editor.setNormalizeAttr(copy);
                    // copy.zIndex = 0;
                    // copy.name = `${ui.name}_copy`
                    // ui.parent!.add(copy);
                    editor.clipboard.copy([ui]);
                    const items = editor.clipboard.paste();
                    editor.addMany(items)
                    editor.select(items)

                    // editor.layer.moveBefore(copy, ui);
                    // editor.cancel();
                    // editor.history.save();
                    // editor.select(copy);
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.delete'),
                onClick: () => {
                    editor.remove(ui, true)
                    editor.cancel();
                    editor.history.save();
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.show'),
                hidden: !!ui.visible,
                onClick: () => {
                    ui.visible = true
                    editor.cancel();
                    editor.history.save();
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.hide'),
                hidden: !ui.visible,
                onClick: () => {
                    ui.visible = false
                    editor.cancel();
                    editor.history.save();
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.lock'),
                hidden: ui.locked,
                onClick: () => {
                    ui.locked = true
                    editor.cancel();
                    editor.history.save();
                },
            },
            {
                label: t('leaferEditorLayouts.panelRight.layer.contextMenu.unlock'),
                hidden: !ui.locked,
                onClick: () => {
                    ui.locked = false
                    editor.cancel();
                    editor.history.save();
                },
            },
        ],
    })
}

const thumbnailList: Record<string, string> = {
    [Tag.Image]: '/1.png',
}

const thumbnailSync = (ui: IUI) => {
    const max = ui.width! > ui.height! ? 'width' : 'height'
    const size = opts.thumbnail!.layer
    return ui.syncExport("jpg", { size: { [max]: size } })
}

const updateLayerList = () => {
    const transformToTreeData = (items: IUI[]): any[] => {
        return items
            .map(item => {
                const title = item.name || t('leaferEditorLayouts.panelRight.layer.defaultName', { tag: item.tag, id: item.innerId })
                return {
                    id: item.id,
                    label: title,
                    zIndex: item.zIndex,
                    children: (item.children && item.tag !== 'Pen') ? transformToTreeData(item.children) : undefined,
                    thumbnailURL: thumbnailSync(item).data,
                    itemClass: (item.locked ? 'locked' : '') + (!item.visible ? ' visible50' : '') + (item.mask ? ' mask' : '') + (item.eraser ? ' eraser' : ''),
                    // thumbnailURL: thumbnailList[item.tag],
                }
            })
            .sort((a, b) => b.zIndex! - a.zIndex!)
    }

    layerList.value = transformToTreeData(editor.page.current.contentLayers)
}
updateLayerList();

const onToggle = (e: any, el: any) => {
}
const onDragStart = (e: any, items: any[], parentID: string) => {
}
const onDragEnd = (e: any, items: any[], parentID: string) => {
}

editor.eventBus.on(editor.Events.selected, onSelect)
editor.eventBus.on(editor.Events.cancelSelected, onCancelSelected)

editor.eventBus.on(editor.Events.pageChangeAfter, updateLayerList)
editor.eventBus.on(editor.Events.canvasAddAfter, updateLayerList)
editor.eventBus.on(editor.Events.canvasRemoveAfter, updateLayerList)
editor.eventBus.on(editor.Events.undoRedoStackChange, updateLayerList)
editor.eventBus.on(editor.Events.historyStateSavedAfter, updateLayerList)

onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.pageChangeAfter, updateLayerList)
    editor.eventBus.off(editor.Events.canvasAddAfter, updateLayerList)
    editor.eventBus.off(editor.Events.canvasRemoveAfter, updateLayerList)
    editor.eventBus.off(editor.Events.undoRedoStackChange, updateLayerList)
    editor.eventBus.off(editor.Events.historyStateSavedAfter, updateLayerList)
    editor.eventBus.off(editor.Events.selected, onSelect)
    editor.eventBus.off(editor.Events.cancelSelected, onCancelSelected)
})
</script>
<style>
.locked {
    background-color: #f56c6c17 !important;
    color: rgb(245, 108, 108) !important;
}

.visible50 {
    opacity: 0.5;
}

.mask {
    background-color: #00000017;
    color: rgb(161, 161, 161);
}

.eraser {
    background-color: #6b6b6b17;
    color: rgb(216, 216, 216);
}
</style>