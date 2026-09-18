<template>
    <div class="wrap">
        <!-- <a-upload :custom-request="customRequest" /> -->
        <search-header :cateList="cateList" v-model="keyword"
            :placeholder="t('leaferEditorLayouts.components.search.placeholder')" @changeCate="changeCate"
            @search="onSearch" />
        <div class="other-text-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :noMore="page.noMore"
                max-height="calc(100vh - 115px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow"
                        :body-style="{ padding: '0px' }">
                        <div class="">
                            <LazyImg :url="url" class="img" />
                        </div>
                        <!-- <div class="p5px">
                            <span class="name truncated">{{ item.original }}</span>
                        </div> -->
                    </a-card>
                </template>
            </comp-list-wrap>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { LazyImg } from '../../../components/vue-waterfall-plugin-next'

import { Image, ImageEvent } from "leafer-ui";

import CompListWrap from "./CompListWrap.vue";
import usePagination from "./usePagination";

import SearchHeader from "../../../components/searchHeader.vue";
import { onMounted, ref } from 'vue';
import { useLeaferEditor } from '../../../editorContext';
import { useLayoutOptions, resolvePaginationPageSize, useLayoutApis, type CategoryItem } from '../../../layoutOptions';
import { setCenter } from "./utils";
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const editor = useLeaferEditor()
const api = useLayoutApis()
const opts = useLayoutOptions()
const keyword = ref();
const cateList = ref<CategoryItem[]>([])
const selectedCategory = ref<string>('-1')

onMounted(async () => {
    try {
        const res = await api.queryImageCategories!()
        if (res.code === 200 && res.data.list?.length) {
            cateList.value = [...res.data.list]
        }
    } catch (err) {
        console.error('Failed to load image categories:', err)
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
const { page } = usePagination(resolvePaginationPageSize(opts.pagination, 'image'))
const fetchData = () => {
    api.queryImageMaterialList!({ ...page, category: selectedCategory.value, keyword: keyword.value }).then(res => {
        if (res.code === 200) {
            const newDataList: any[] = res.data.list || []
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
const handleClick = (item: Image) => {
    const image = new Image({
        editable: true,
        x: 0,
        y: 0,
        ...item,
    })
    // console.log('image=', image.toString());

    image.load()
    setCenter(editor.page.current.width, editor.page.current.height, image)
    editor.setNormalizeAttr(image)
    image.once(ImageEvent.LOADED, (e: ImageEvent) => {
        console.log('image loaded=', image.width, image.height, e.image.width, e.image.height);
        image.width = 0
        image.height = 0
        image.width = e.image.width
        image.height = e.image.height
        console.log('image loaded=', image.width, image.height);
    })
    editor.cancel()
    editor.add(image)
    editor.select(image)
}


</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}
</style>
