<template>
    <a-popover trigger="click" position="rt">
        <div>
            <slot />
        </div>
        <template #content>
            <div style="width: 450px">
                <a-tabs>
                    <a-tab-pane key="1">
                        <template #title>
                            <icon-command />
                            {{ $t('leaferEditorLayouts.header.help.shortcuts') }}
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                <a-descriptions v-for="item in datas" :key="item.key" :label-style="labelStyle"
                                    :data="item.data" :title="item.title" :column="1" />
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                    <a-tab-pane key="2">
                        <template #title>
                            <icon-customer-service />
                            {{ $t('leaferEditorLayouts.header.help.about') }}
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                {{ $t('leaferEditorLayouts.header.help.about-text') }}
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </template>
    </a-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'
import { useLayoutOptions } from '../../layoutOptions'

const { t } = useI18n()
const opts = useLayoutOptions()

const labelStyle = { width: '140px' }

const builtinShortcuts = computed(() => [
    {
        key: 'common',
        title: t('leaferEditorLayouts.header.help.datas.common'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.copy'),
                value: 'Ctrl + C',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.paste'),
                value: 'Ctrl + V',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.cut'),
                value: 'Ctrl + X',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.allSelect'),
                value: 'Ctrl + A',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.undo'),
                value: 'Ctrl + Z',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.redo'),
                value: 'Ctrl + Y / Ctrl + Shift + Z',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.delete'),
                value: 'Delete / Backspace',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.escape'),
                value: 'ESC',
            },
        ]
    },
    {
        key: 'canvas',
        title: t('leaferEditorLayouts.header.help.datas.canvas'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.moveCanvas'),
                value: t('leaferEditorLayouts.header.help.datas.moveCanvasInfo'),
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.zoomCanvas'),
                value: t('leaferEditorLayouts.header.help.datas.zoomCanvasInfo'),
            },
        ]
    },
    {
        key: 'item',
        title: t('leaferEditorLayouts.header.help.datas.item'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.select'),
                value: t('leaferEditorLayouts.header.help.datas.selectInfo'),
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.moveDown'),
                value: '[',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.moveUp'),
                value: ']',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.moveToBottom'),
                value: 'Ctrl + [',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.moveToTop'),
                value: 'Ctrl + ]',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.group'),
                value: 'Ctrl + G',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.ungroup'),
                value: 'Ctrl + Shift + G',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.lock-unlock'),
                value: 'L',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.horizontalFlip'),
                value: 'Shift + H',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.verticalFlip'),
                value: 'Shift + V',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.move'),
                value: '[Shift] + ↑ / ↓ / ← / → / w / a / s / d ',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.rotate'),
                value: ', / . / Ctrl + , / Ctrl + .',
            }
        ]
    },
    {
        key: 'gridlines',
        title: t('leaferEditorLayouts.header.help.datas.gridlines'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.showOrHide'),
                value: 'H',
            },
        ]
    },
    {
        key: 'zoom',
        title: t('leaferEditorLayouts.header.help.datas.zoom'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.zoomIn'),
                value: '+',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.zoomOut'),
                value: '-',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.percent100'),
                value: 'Ctrl + 1',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.percent50'),
                value: '0 0',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.zoomFit'),
                value: 'Ctrl + 0',
            },
        ]
    },
    {
        key: 'mode',
        title: t('leaferEditorLayouts.header.help.datas.mode'),
        data: [
            {
                label: t('leaferEditorLayouts.header.help.datas.selectMode'),
                value: 'v',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.previewMode'),
                value: 'm',
            },
            {
                label: t('leaferEditorLayouts.header.help.datas.pencilMode'),
                value: 'p',
            },
        ]
    }
])

const extraShortcuts = (opts.helpShortcuts ?? []).map(s => ({
    key: s.section,
    title: s.section,
    data: s.items.map(i => ({ label: i.description, value: i.keys }))
}))

const datas = computed(() => [...builtinShortcuts.value, ...extraShortcuts])
</script>
