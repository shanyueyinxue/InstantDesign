<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" :placeholder="t('leaferEditorLayouts.components.search.placeholder')" @changeCate="changeCate" @search="onSearch" />
        <div class="temp-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore"
                max-height="calc(100vh - 115px)">
                <template #item="{ item }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow"
                        :body-style="{ padding: '0px' }">
                        <div class="">
                            <div class="tags">
                                <div class="tag">VIP</div>
                            </div>
                            <LazyImg :url="item.pages[item.currentCanvas].metaData.cover" class="img" />
                        </div>
                        <!-- <div class="p5px">
                            <span class="name truncated">{{ item.name }}</span>
                        </div> -->
                    </a-card>
                </template>
            </comp-list-wrap>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { LazyImg } from '../../../components/vue-waterfall-plugin-next'
import searchHeader from "../../../components/searchHeader.vue";

import CompListWrap from "./CompListWrap.vue";
import usePagination from "./usePagination";
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLeaferEditor } from '../../../editorContext';
import { useLayoutOptions, resolvePaginationPageSize, useLayoutApis, type CategoryItem } from '../../../layoutOptions';
import confirmBox from '../../../components/confirmBox'
import { Message } from '@arco-design/web-vue';

const { t } = useI18n()

const editor = useLeaferEditor()
const api = useLayoutApis()
const opts = useLayoutOptions()

const config = {
    imgSelector: 'cover',
}


const keyword = ref();
const cateList = ref<CategoryItem[]>([])
const selectedCategory = ref<string>('-1')

onMounted(async () => {
    try {
        const res = await api.queryTemplateCategories!()
        if (res.code === 200 && res.data.list?.length) {
            cateList.value = [...res.data.list]
        }
    } catch (err) {
        console.error('Failed to load template categories:', err)
    }
    fetchData()
})

const changeCate = (e: {
    label: string;
    value: string;
}) => {
    selectedCategory.value = e.value
    page.dataList = []
    page.pageNum = 1
    page.noMore = false
    fetchData()
}
const onSearch = (_value: string, _ev: PointerEvent) => {
    page.dataList = []
    page.pageNum = 1
    page.noMore = false
    fetchData()
}
const { page } = usePagination(resolvePaginationPageSize(opts.pagination, 'template'))
const fetchData = () => {
    api.queryTemplateList!({ ...page, category: selectedCategory.value, keyword: keyword.value }).then(res => {
        if (res.code === 200) {
            const newDataList = res.data.list || []
            if (newDataList.length > 0) {
                page.dataList!.push(...newDataList)
                page.pageNum += 1
            }
            if (page.dataList!.length >= res.data.total) {
                page.noMore = true
            } else {
                page.noMore = false
            }
        }
    })
}
const handleClick = async (item: any) => {
    console.log('item=', item);
    confirmBox.open({
        title: t('leaferEditorLayouts.panelLeft.template.confirmOpen'),
        confirmText: t('leaferEditorLayouts.common.confirm'),
        cancelText: t('leaferEditorLayouts.common.cancel'),
        onConfirm: async () => {
            const ok = await editor.reloadFromJSON(item)
            if (ok) {
                Message.success(t('leaferEditorLayouts.panelLeft.template.success'))
            } else {
                Message.error(t('leaferEditorLayouts.panelLeft.template.fail'))
            }
        },
    })
}
</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}

.temp-wrap .tags {
    .tag {
        background-color: rgba(0, 0, 0, .6);
        //background-color:  rgb(var(--primary-6));
        border-radius: 8px;
        top: 6px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .16);
        color: #fff;
        font-size: 12px;
        height: 16px;
        line-height: 16px;
        padding: 0 6px;
        position: absolute;
        left: 6px;
        z-index: 11;
    }
}
</style>
