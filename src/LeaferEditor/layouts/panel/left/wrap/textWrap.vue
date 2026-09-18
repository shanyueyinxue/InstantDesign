<template>
    <div class="wrap">
        <a-tabs v-model:active-key="activeTab">
            <a-tab-pane :title="t('leaferEditorLayouts.panelLeft.text.publicFonts')" key="public">
            </a-tab-pane>
            <a-tab-pane :title="t('leaferEditorLayouts.panelLeft.text.myFonts')" key="my">
            </a-tab-pane>
        </a-tabs>
        <div v-if="activeTab === 'my'" class="upload-bar">
            <a-upload class="upload-inner" :auto-upload="false" :show-file-list="false" @change="handleUpload"
                accept=".ttf,.otf,.woff,.woff2">
                <template #upload-button>
                    <a-button class="w100%" type="primary" size="small" long>
                        <template #icon>
                            <icon-plus />
                        </template>
                        {{ t('leaferEditorLayouts.panelLeft.text.uploadFont') }}
                    </a-button>
                </template>
            </a-upload>
        </div>
        <div class="font-list-wrap">
            <a-list :max-height="'calc(100vh - 170px)'" @reach-bottom="fetchData" :scrollbar="true" :bordered="false">
                <template #scroll-loading>
                    <div v-if="page.noMore" class="no-more">{{ $t('leaferEditorLayouts.panelRight.infiniteScroll.noMore') }}
                    </div>
                    <a-spin v-else />
                </template>
                <div v-for="(item, index) in page.dataList" :key="item.code" class="font-item"
                    @click="handleSelectFont(item)">
                    <div class="font-preview" :style="{ fontFamily: item.name }">
                        {{ previewText }}
                    </div>
                    <div class="font-name">{{ item.name }}</div>
                </div>
                <a-empty v-if="page.dataList && page.dataList.length === 0 && !loading" />
            </a-list>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { Text } from 'leafer-ui'
import { useI18n } from 'vue-i18n'
import { useLeaferEditor } from '../../../editorContext'
import { useLayoutOptions, useLayoutTheme, resolvePaginationPageSize, useLayoutApis } from '../../../layoutOptions'
import usePagination from './usePagination'
import type { FontInfo } from '../../../../core/interfaces';
import { setCenter } from "./utils";

const { t } = useI18n()
const editor = useLeaferEditor()
const layoutTheme = useLayoutTheme()
const api = useLayoutApis()
const opts = useLayoutOptions()

const activeTab = ref('public')
const previewText = opts.font!.previewText
const loading = ref(false)

const { page } = usePagination<FontInfo>(resolvePaginationPageSize(opts.pagination, 'text'))

const fetchData = () => {
    if (page.noMore || loading.value) return
    loading.value = true
    const fetcher = (activeTab.value === 'public' ? api.queryFontList : api.queryMyFontList)!
    fetcher(page).then(res => {
        if (res.code === 200) {
            const newDataList: FontInfo[] = res.data.list || []
            if (newDataList.length > 0) {
                page.dataList!.push(...newDataList)
                page.pageNum += 1
                editor.font.addCustomFonts(newDataList)
                editor.eventBus.emitExternal('fontListChanged')
            }
            if (page.dataList!.length >= res.data.total) {
                page.noMore = true
            } else {
                page.noMore = false
            }
        }
    }).finally(() => {
        loading.value = false
    })
}

const resetList = () => {
    page.dataList = [...editor.font.defaultFonts]
    page.pageNum = 1
    page.noMore = false
    fetchData()
}
onMounted(() => {
    resetList() // 重置列表数据，加载默认字体
})


watch(activeTab, () => {
    resetList()
})

const handleSelectFont = (item: FontInfo) => {
    const text = new Text({
        text: previewText,
        x: 0,
        y: 0,
        fontSize: 24,
        fontFamily: item.name,
        fill: opts.font!.defaultTextColor || layoutTheme.defaultFillColor || '#333',
        editable: true,
        resizeFontSize: true,
    })
    setCenter(editor.page.current.width, editor.page.current.height, text)
    text.name = item.name + opts.font!.nameSuffix
    editor.add(text)
    editor.select(text)
}

const handleUpload = (fileItem: any) => {
    // console.log(fileItem);
    if (!fileItem || !fileItem.length) return
    const file = fileItem[0] as File
    if (!file) return
    api.uploadFont!(file).then(res => {
        if (res.code === 200) {
            activeTab.value = 'my'
            resetList()
            editor.font.addCustomFonts([{
                code: res.data.code,
                name: res.data.name,
                variants: res.data.variants || [],
            }])
            editor.eventBus.emitExternal('fontListChanged')
        }
    })
}
</script>

<style lang="less" scoped>
@import "../../../styles/layouts.less";

.wrap {
    width: 100%;
    height: 100%;
    min-width: @leftPanelWidth;
}

.upload-bar {
    padding: 10px 10px 0 10px;
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}

.upload-inner {
    width: 100%;
}

.font-list-wrap {
    padding: 0 8px;
}

.font-item {
    display: flex;
    flex-direction: column;
    padding: 10px 12px;
    margin: 4px 0;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;

    &:hover {
        border-color: rgb(var(--primary-6));
        background: rgba(var(--primary-6), 0.04);
    }
}

.font-preview {
    font-size: 20px;
    line-height: 1.4;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.font-name {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

.no-more {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 12px 0;
}
</style>
