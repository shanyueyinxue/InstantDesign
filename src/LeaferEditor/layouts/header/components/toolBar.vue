<template>
    <div>
        <a-tooltip v-for="tool in tooltips" :key="tool.name" effect="dark" :content="tool.content" mini>
            <a-button class="icon-btn pd-5px" @click="tool.onClick(editor)" :disabled="tool.disabled(editor)">
                <div class="icon" :class="tool.iconClass"></div>
            </a-button>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'

import { useLeaferEditor } from '../../editorContext';
import { selectedProxyData, activeObject } from '../../selectedProxyData';
import { useLayoutOptions, resolveSlotList, type ToolBarSlotItem } from '../../layoutOptions';
import { createCounter } from "../../../utils";

const { t } = useI18n()

const editor = useLeaferEditor();
const layoutOptions = useLayoutOptions();
const tag = selectedProxyData(editor, 'tag')


const tooltips = computed((): ToolBarSlotItem[] => {
    const order = createCounter(100, 100)
    const builtin: ToolBarSlotItem[] = [
        {
            name: 'group',
            content: t('leaferEditorLayouts.header.toolBar.group'),
            iconClass: 'i-svg:object-group',
            order: order(),
            onClick: () => handleGroupBtnClick(),
            disabled: () => !isGroupBtnEnabled.value,
        },
        {
            name: 'ungroup',
            content: t('leaferEditorLayouts.header.toolBar.ungroup'),
            iconClass: 'i-svg:object-ungroup',
            order: order(),
            onClick: () => handleUnGroupBtnClick(),
            disabled: () => !isUnGroupBtnEnabled.value,
        },
    ]
    return resolveSlotList(builtin, layoutOptions.slots?.toolBar).map((item) => ({
        ...item,
        disabled: item.disabled ?? (() => false),
    }))
})

watch(activeObject, (newValue) => {
    if (newValue === null) {
        isGroupBtnEnabled.value = true
    } else {
        isGroupBtnEnabled.value = false
    }
})
const isGroupBtnEnabled = ref(activeObject.value === null)

const isUnGroupBtnEnabled = computed(() => {
    return tag.value.modelValue === 'Group' && tag.value.modelValue !== 'Pen'
})

const handleGroupBtnClick = () => {
    if (isGroupBtnEnabled) {
        editor.group()
    }
};
const handleUnGroupBtnClick = () => {
    if (isUnGroupBtnEnabled) {
        editor.ungroup()
    }
};
</script>

<style scoped lang="less">
svg {
    display: inline-block;
    touch-action: none;
    text-align: center;
}

.icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
}
</style>