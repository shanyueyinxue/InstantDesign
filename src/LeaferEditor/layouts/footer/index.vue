<template>
    <a-layout-footer id="footer" class="footer">
        <div class="bg-white page-box not-select">
            <a-space class="p-r-20px">
                <a-tooltip v-for="(item, index) in pagesData" @click="changePage(item)" :key="item.name" effect="dark"
                    :content="item.title || t('leaferEditorLayouts.footer.page.defaultName', { index: item.index + 1 })"
                    mini>
                    <div class="page-view " @click="onSelect(item)" @contextmenu.stop="openContextMenu($event, item)"
                        :class="{ 'page-selected': currentPageID === item.name }" :key="index" :title="item.name"
                        :style="ops.isShowFooterPageViewThumbnail ? {
                            'background-image': `url(${item?.cover})`,
                            'background-size': 'contain',
                            'background-position': 'center',
                            'background-repeat': 'no-repeat',
                        } : {}">
                        <a-avatar class="page-ava" :class="item.cover ? 'opacity-0' : 'opacity-1'" :size="40"
                            shape="square">{{ index + 1 }}</a-avatar>
                    </div>
                    <div v-if="ops.isShowPageText" class="t11-nowrap">
                        <div class="page-title">{{ item.title || t('leaferEditorLayouts.footer.page.defaultName', {
                            index: item.index + 1
                        }) }}</div>
                    </div>
                </a-tooltip>
                <div v-if="pageAddable" class="flex-col-center">
                    <div class="page-add page-view" @click="addOnClick">
                        <icon-plus size="20" />
                    </div>
                    <div v-if="ops.isShowPageText" class="t11-nowrap">
                        {{ $t('leaferEditorLayouts.footer.addPage') }}
                    </div>
                </div>
            </a-space>
        </div>
    </a-layout-footer>
    <div v-if="ops.isShowFooterBar"
        style="background: #f1f2f4; padding: 5px; display: flex; justify-content: center; align-items: center;">
        <div class="flex justify-center flex-items-center" style="color: var(--color-text-2)">
            <span>{{ $t('leaferEditorLayouts.footer.copyright') }}</span>
            <a-divider direction="vertical" />

            <span>{{ $t('leaferEditorLayouts.footer.cdn') }}</span>
            <a-divider direction="vertical" />
            <a-link :hoverable="false" target="_blank" href="https://beian.miit.gov.cn/">
                {{ $t('leaferEditorLayouts.footer.icp') }}
            </a-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useLeaferEditor } from '../editorContext';
import contextMenu from '../components/contextMenu'
import { useI18n } from 'vue-i18n';
import type { Canvas } from '../../../LeaferEditor/core/canvas';
import { useLayoutOptions } from '../layoutOptions';
import promptInput from '../components/promptInput';
import { Message } from '@arco-design/web-vue';

const { t } = useI18n();

interface PageData {
    index: number
    name: string
    cover?: string
    title?: string
}
const ops = useLayoutOptions()
const pageAddable = ref(!!ops.pageAddable)
const editor = useLeaferEditor();
const pagesData = ref<PageData[]>([]);
const currentPageID = ref(editor.page.currentID)

const thumbnail = (page: Canvas) => {
    const max = page.width > page.height ? "width" : "height"
    // return page.exportSync('jpg', {
    return page.exportSyncContentAndSky('jpg', {
        size: {
            [max]: ops.thumbnail!.footerPage,
        }
    }).data
}
const getCover = (page: Canvas) => {
    if (!page) return ''
    return ops.isShowFooterPageViewThumbnail ? page.metaData?.cover || thumbnail(page) : ''
}
const updatePagesData = () => {
    const pagesCanvas = editor.page.list()
    const value = []
    let n = 0
    for (let page of pagesCanvas) {
        const data: PageData = {
            index: n,
            name: page.name,
            cover: getCover(page),
            // cover: page?.metaData?.cover || thumbnail(page) || '',
            // cover: page?.metaData?.cover || page.exportSync('jpg')?.data || '',
            // cover: page?.exportSyncContentAndSky('jpg')?.data,
            title: page?.metaData?.title,
        }
        value.push(data)
        n++
    }
    // @ts-ignore
    pagesData.value = value
    currentPageID.value = editor.page.currentID
}
const updateCurrentPage = () => {
    const page = editor.page.current
    if (!page) return
    const currentPageData = pagesData.value.find(item => item.name === page.name)
    if (!currentPageData) return
    currentPageData.cover = getCover(page)
    currentPageID.value = editor.page.currentID
}

const onSelect = (item: PageData) => {
    if (!item.name) return
    if (item.name === editor.page.currentID) return
    editor.page.setCurrent(item.name)
}
const addOnClick = (e: PointerEvent) => {
    editor.page.add()
}
const changePage = (page: PageData) => {
    if (!page.name) return
    if (page.name === editor.page.currentID) return
    editor.page.setCurrent(page.name)
}
const scrollToRight = async () => {
    await nextTick(); // 等待 DOM 更新
    const container = document.getElementById('footer')
    if (container) {
        container.scrollLeft = container.scrollWidth;
    }
}
const scrollCurrentPageIntoView = async () => {
    await nextTick(); // 等待 .page-selected class 更新到 DOM
    const container = document.getElementById('footer')
    if (!container) return
    const selected = container.querySelector('.page-selected') as HTMLElement | null
    if (!selected) return
    const cRect = container.getBoundingClientRect()
    const sRect = selected.getBoundingClientRect()
    const padding = 20
    let left = container.scrollLeft
    if (sRect.left < cRect.left) {
        left -= (cRect.left - sRect.left) + padding
    } else if (sRect.right > cRect.right) {
        left += (sRect.right - cRect.right) + padding
    } else {
        return
    }
    container.scrollTo({ left, behavior: 'smooth' })
}
onMounted(() => {
    updatePagesData()
})
const updateDataSetTimeout = () => {
    setTimeout(() => {
        updatePagesData()
    }, 1000);
}

const updatePagesThumbnail = () => {
    setTimeout(() => {
        updatePagesData()
    }, 300);
}

editor.eventBus.on(editor.Events.loadJSONAfter, updateDataSetTimeout)
editor.eventBus.on(editor.Events.pageAddAfter, updatePagesData)
editor.eventBus.on(editor.Events.pageRemoveAfter, updatePagesData)
editor.eventBus.on(editor.Events.pageChangeBefore, updateCurrentPage)
editor.eventBus.on(editor.Events.pageChangeAfter, updateCurrentPage)
editor.eventBus.on(editor.Events.undoRedoStackChange, updateCurrentPage)
editor.eventBus.on(editor.Events.historyStateSavedAfter, updateCurrentPage)
// editor.eventBus.on(editor.Events.canvasChange, updatePagesData)
editor.eventBus.on(editor.Events.pageAddAfter, scrollToRight)
editor.eventBus.on(editor.Events.pageChangeAfter, scrollCurrentPageIntoView)
editor.eventBus.on(editor.Events.loadJSONAfter, scrollCurrentPageIntoView)
editor.eventBus.on(editor.Events.undoRedoStackChange, scrollCurrentPageIntoView)
editor.eventBus.on(editor.Events.historyStateSavedAfter, scrollCurrentPageIntoView)

editor.eventBus.onExternal('updatePagesThumbnail', updatePagesThumbnail)
editor.eventBus.onExternal('updateCurrentPageThumbnail', updateCurrentPage)

onUnmounted(() => {
    editor.eventBus.off(editor.Events.loadJSONAfter, updateDataSetTimeout)
    editor.eventBus.off(editor.Events.pageAddAfter, updatePagesData)
    editor.eventBus.off(editor.Events.pageRemoveAfter, updatePagesData)
    editor.eventBus.off(editor.Events.pageChangeBefore, updateCurrentPage)
    editor.eventBus.off(editor.Events.pageChangeAfter, updateCurrentPage)
    editor.eventBus.off(editor.Events.undoRedoStackChange, updateCurrentPage)
    editor.eventBus.off(editor.Events.historyStateSavedAfter, updateCurrentPage)
    // editor.eventBus.off(editor.Events.canvasChange, updatePagesData)
    editor.eventBus.off(editor.Events.pageAddAfter, scrollToRight)
    editor.eventBus.off(editor.Events.pageChangeAfter, scrollCurrentPageIntoView)
    editor.eventBus.off(editor.Events.loadJSONAfter, scrollCurrentPageIntoView)
    editor.eventBus.off(editor.Events.undoRedoStackChange, scrollCurrentPageIntoView)
    editor.eventBus.off(editor.Events.historyStateSavedAfter, scrollCurrentPageIntoView)

    editor.eventBus.offExternal('updatePagesThumbnail', updatePagesThumbnail)
    editor.eventBus.offExternal('updateCurrentPageThumbnail', updateCurrentPage)
});

const openContextMenu = (e: MouseEvent, node: any) => {
    e.preventDefault()
    contextMenu.showContextMenu({
        x: e.clientX,
        y: e.clientY,
        preserveIconWidth: false,
        items: [
            {
                label: t('leaferEditorLayouts.footer.contextMenu.copy'),
                disabled: !pageAddable.value,
                hidden: !pageAddable.value,
                onClick: async () => {
                    if (!node.name) return
                    editor.page.setCurrent(node.name)
                    const data = editor.page.current.toJSON()
                    await editor.appendPagesFromJSON({ pages: [data] })
                },
            },
            {
                label: t('leaferEditorLayouts.footer.contextMenu.clear'),
                disabled: editor.page.current.name !== node.name,
                onClick: async () => {
                    if (!node.name) return
                    editor.clearContent()
                },
            },
            {
                label: t('leaferEditorLayouts.footer.contextMenu.delete'),
                // disabled: editor.pages().length <= 1 || editor.currentPage.name === node.name,
                disabled: editor.page.list().length <= 1 || !pageAddable.value,
                hidden: editor.page.list().length <= 1 || !pageAddable.value,
                onClick: () => {
                    if (!node.name) return
                    editor.page.remove(node.name)
                },
                // divided: true,
            },
            {
                label: t('leaferEditorLayouts.footer.contextMenu.rename'),
                disabled: editor.page.current.name !== node.name,
                onClick: () => {
                    // 弹窗
                    promptInput.open({
                        title: t('leaferEditorLayouts.footer.contextMenu.renameInputInfo'),
                        defaultValue: editor.page.current.metaData.title,
                        confirmText: t('leaferEditorLayouts.common.confirm'),
                        cancelText: t('leaferEditorLayouts.common.cancel'),
                        onConfirm: (value) => {
                            editor.page.current.metaData.title = value
                            updatePagesData()
                            Message.success(t('leaferEditorLayouts.common.renameSuccess'))
                        },
                    })
                },
            },
        ],
    })
}

let onWheel: ((e: WheelEvent) => void) | null
onMounted(() => {
    const footerEl = document.getElementById('footer')
    if (footerEl) {
        onWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                // 阻止默认的垂直滚动
                e.preventDefault();
                // 将垂直滚动转换为水平滚动
                footerEl.scrollLeft += e.deltaY;
            }
        }
        footerEl.addEventListener('wheel', onWheel);
        // footerEl.addEventListener('wheel', onWheel, { passive: true });
    }
})
onUnmounted(() => {
    const footerEl = document.getElementById('footer')
    if (footerEl && onWheel) {
        footerEl.removeEventListener('wheel', onWheel);
    }
})
</script>

<style scoped lang="less">
@import "../styles/layouts.less";

// 滚动条
.footer::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.footer::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 5px;
}

.footer::-webkit-scrollbar-track {
    background-color: #f1f1f1;
}

.footer {
    padding: 10px 20px 10px 20px;
    height: @footerBoxHeight;
    flex-direction: row;
    overflow: auto;

    .page-box {
        padding: 0 5px;
        height: 100%;
        align-items: center;
        display: flex;
    }

    .page-view {
        cursor: pointer;
        border: 2px solid var(--color-neutral-4);
        border-radius: 5px;
        padding: 5px;
        height: calc(@footerBoxHeight - 30px);
        align-items: center;
        align-content: center;
        display: flex;
    }

    .page-selected {
        border-color: rgb(var(--primary-6));
    }

    .page-add {
        height: calc(@footerBoxHeight - 30px);
        width: calc(@footerBoxHeight - 30px);
        text-align: center;
        align-items: center;
        display: flex;
        align-content: center;
        justify-content: center;
    }

    .page-add:hover {
        color: rgb(var(--primary-6));
        border-color: rgb(var(--primary-6));
        cursor: pointer;
    }

    // .page-ava {
    //     background-color: #3370ff;
    //     // opacity: 0;
    // }

    .opacity-0 {
        opacity: 0;
    }

    .opacity-1 {
        opacity: 1;
    }
}

:deep(.arco-space-item),
.flex-col-center {
    // margin-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.t11-nowrap {
    word-break: keep-all;
    font-size: 11px;
    white-space: nowrap;
    margin-left: 2px;
    margin-right: 2px;
}
</style>
