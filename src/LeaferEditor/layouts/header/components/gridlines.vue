<script setup lang="ts">
import { ref, onUnmounted, watch, shallowRef } from 'vue';

import TipContentKey from "../../components/tooltip";
import dropdownButton from "../../components/dropdownButton.vue";
import { useLeaferEditor } from '../../editorContext';
import { useLeaferEditorRulerPluginService } from '../../../index';
const editor = useLeaferEditor();
const gridLineService = useLeaferEditorRulerPluginService(editor);
const isShow = ref(gridLineService.gridLinesIsShow());

const sky = shallowRef(editor.page.current.skyFrame);

const onClick = () => {

    if (gridLineService.gridLines.length === 0) return
    if (gridLineService.gridLinesIsShow()) {
        gridLineService.gridLinesHide()
        isShow.value = false
    } else {
        gridLineService.gridLinesShow()
        isShow.value = true
    }
}
const onSelect = (value: string | number | Record<string, any> | undefined, ev: Event) => {
    if (value === 'clear') {
        gridLineService.clearGridLines()
        isShow.value = false
    }
}

const onPageChange = () => {
    isShow.value = gridLineService.gridLinesIsShow()
    sky.value = editor.page.current.skyFrame
}
editor.eventBus.on(editor.Events.pageChangeAfter, onPageChange)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.pageChangeAfter, onPageChange)
})
</script>

<template>
    <a-space>
        <dropdownButton @select="onSelect">
            <a-tooltip mini position="bottom" effect="dark">
                <a-button :type="isShow ? 'text' : 'secondary'" class="icon-btn pd-5px" @click="onClick">
                    <!-- <component class="m0px" :is="item.icon"  /> -->
                    <div class="i-svg:gridlines icon"></div>
                </a-button>
                <template #content>
                    <TipContentKey :content="$t('leaferEditorLayouts.header.gridlines.showOrHide')"
                        :keys="['H']" />
                </template>
            </a-tooltip>
            <template #content>
                <a-doption value="clear">
                    {{ $t('leaferEditorLayouts.header.gridlines.clear') }}
                </a-doption>
            </template>
        </dropdownButton>
    </a-space>

</template>

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
    // stroke: #6cf !important;
}
</style>
