<template>
    <div class="header-box">
        <div class="left flex flex-center">
            <img class="logo no-seletion" :src="logoUrl" />
            <div class="px-5px no-seletion">
                <div style="width: max-content">
                    <span class="block font-bold">{{ sloganName }}</span>
                </div>
            </div>
            <template v-if="showFilePopover">
                <a-divider direction="vertical" />
                <file-popover />
            </template>
            <template v-if="showUndoRedo">
                <a-divider direction="vertical" />
                <undo-redo />
            </template>
            <template v-if="showRulerUnit">
                <a-divider direction="vertical" />
                <ruler-unit />
            </template>
            <template v-if="showGridlines">
                <a-divider direction="vertical" />
                <gridlines />
            </template>
            <template v-if="showSnap">
                <a-divider direction="vertical" />
                <snap />
            </template>
            <template v-if="showMode">
                <a-divider direction="vertical" />
                <mode />
            </template>
            <template v-if="showCopy">
                <a-divider direction="vertical" />
                <copy />
            </template>
            <template v-if="showZoom">
                <a-divider direction="vertical" />
                <zoom />
            </template>
        </div>
        <div class="center">
            <tool-bar />
        </div>
        <div class="right">
            <save-oper />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, computed } from 'vue'

import { useLeaferEditor } from '../editorContext';
import { useLeaferEditorRulerPluginService } from '../../index';
import { useLayoutOptions } from '../layoutOptions';

import copy from './components/copy.vue'
import filePopover from './components/filePopover.vue'
import undoRedo from './components/undoRedo.vue'
import rulerUnit from './components/rulerUnit.vue';
import mode from "./components/mode.vue";
import gridlines from "./components/gridlines.vue";
import zoom from "./components/zoom.vue";
import snap from "./components/snap.vue";
import toolBar from "./components/toolBar.vue";
import saveOper from "./components/saveOper.vue";

const props = defineProps<{
    sloganName: string
    logoUrl: string
}>()

const editor = useLeaferEditor()
const rulerService = useLeaferEditorRulerPluginService(editor)
const layoutOptions = useLayoutOptions()
const headerLeft = layoutOptions.headerLeft ?? {}
const rulerEnabled = ref(rulerService.isEnabled())

const showFilePopover = computed(() => headerLeft.filePopover !== false)
const showUndoRedo = computed(() => headerLeft.undoRedo !== false)
const showRulerUnit = computed(() => rulerEnabled.value && headerLeft.rulerUnit !== false)
const showGridlines = computed(() => rulerEnabled.value && headerLeft.gridlines !== false)
const showSnap = computed(() => headerLeft.snap !== false)
const showMode = computed(() => headerLeft.mode !== false)
const showCopy = computed(() => pageLength.value > 1 && headerLeft.copy !== false)
const showZoom = computed(() => headerLeft.zoom !== false)

const pageLength = ref(editor.page.list().length)
const updatePageLength = () => {
    pageLength.value = editor.page.list().length
}

editor.eventBus.on(editor.Events.pageAddAfter, updatePageLength)
editor.eventBus.on(editor.Events.pageRemoveAfter, updatePageLength)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.pageAddAfter, updatePageLength)
    editor.eventBus.off(editor.Events.pageRemoveAfter, updatePageLength)
})
</script>


<style scoped lang="less">
@import "../styles/layouts.less";

.header-box {
    // height: @header-height;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;

    .left {
        --color-secondary-disabled: #ffffff;
        --color-secondary: #fff;
        height: 100%;
        justify-items: start;

        .logo {
            width: 25px;
            height: 25px;
            // margin-left: 10px;
        }

        :deep(.arco-btn-size-medium) {
            // width: 20px;
            padding: 0 4px;
        }
    }

    .center {
        --color-secondary-disabled: #ffffff;
        --color-secondary: #fff;
        height: 100%;

        :deep(.arco-btn-size-medium) {
            padding: 0 4px;
        }
    }

    .right {

        // height: 100%;
        :deep(.arco-btn-size-medium) {
            padding: 0 10px;
        }

        @media (max-width: 1280px) {
            :deep(.arco-btn-size-medium) {
                padding: 0 4px;
            }
        }
    }
}
</style>
