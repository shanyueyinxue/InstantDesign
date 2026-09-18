import { reactive } from 'vue'

export default function usePagination<T = any>(pageSize = 10) {
    const page = reactive<{
        dataList?: T[],
        pageSize: number,
        pageNum: number,
        noMore?: boolean,
        query: object,
    }>({
        dataList: [],
        pageSize,
        pageNum: 1,
        noMore: false,
        query: {},
    });

    return {
        page
    };
}
