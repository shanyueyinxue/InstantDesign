<template>
  <div class="search__wrap">
    <a-input-group>
      <a-dropdown v-if="cateList && cateList.length > 0" placement="bottom-start">
        <div class="search__type">
          <icon-menu />
        </div>
        <template #content>
          <a-doption v-for="(item, index) in cateList" :key="index" @click.stop="action('changeCate', item, index)">
            <span :class="['cate__text', { 'cate--select': currentIndex === index }]">{{
              item.label
            }}</span>
          </a-doption>
        </template>
      </a-dropdown>
      <a-input-search v-model="searchValue" :placeholder="placeholder" @search="onSearch" />
    </a-input-group>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'

export default defineComponent({
  props: {
    cateList: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入关键字搜索'
    },
  },
  emits: ['update:modelValue', 'search', 'changeCate'],
  setup(props, context) {

    interface State {
      searchValue: string
      currentIndex: number
    }

    const state: State = reactive({
      searchValue: '',
      currentIndex: 0,
    })

    const cateList = computed(() => (props.cateList as any[]) ?? [])

    watch(
      () => state.searchValue,
      () => {
        context.emit('update:modelValue', state.searchValue)
      },
    )

    function action(fn: 'update:modelValue' | 'search' | 'changeCate', item: any, currentIndex: number | string) {
      state.currentIndex = currentIndex as number
      context.emit(fn, item, currentIndex)
    }

    function onSearch(value: string, ev: MouseEvent) {
      context.emit('search', value, ev)
    }

    return {
      ...toRefs(state),
      cateList,
      action,
      onSearch,
    }
  },
})
</script>

<style lang="less" scoped>
:deep(.el-input__suffix) {
  padding-top: 9px;
}

.search__wrap {
  padding: 16px 1rem 0rem 0rem;
  display: flex;
  cursor: pointer;
  justify-content: center;
}

.search {
  &__type {
    border: 1px solid #e8eaec;
    color: #666666;
    width: 44px;
    margin: 0 0.6rem 0 1rem;
    border-radius: 4px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;

    .iconfont {
      font-size: 20px;
    }
  }

  &__type:hover {
    color: rgb(var(--primary-6));
  }
}

.cate {
  &__text {
    font-weight: bold;
  }

  &--select {
    color: rgb(var(--primary-6));
  }
}
</style>