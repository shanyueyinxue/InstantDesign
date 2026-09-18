<template>
    <a-layout-sider class="panel-right">
        <a-tabs default-active-key="attribute" class="right-panel-tabs"
            @contextmenu.stop="(e: any) => e.preventDefault()" @change="() => { }">
            <a-tab-pane key="attribute" :title="t('leaferEditorLayouts.panelRight.index.attribute')" class="right-panel-tab-pane">
                <attribute></attribute>
            </a-tab-pane>
            <a-tab-pane key="layer" :title="t('leaferEditorLayouts.panelRight.index.layer')" class="right-panel-tab-pane">
                <layer></layer>
            </a-tab-pane>
        </a-tabs>
        <component :is="layoutOptions.previewComponent" v-if="layoutOptions.previewComponent" />
    </a-layout-sider>
</template>
<script setup lang="ts">
import attribute from './attribute/index.vue';
import layer from './layer/index.vue';
import { useLayoutOptions } from '../../layoutOptions';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const layoutOptions = useLayoutOptions();
</script>

<style scoped lang="less">
@import "../../styles/layouts.less";

.panel-right {
    height: @panelHeight;
    width: @RightPanelWidth !important;
}

.right-panel-tabs {
    width: 100%;
    flex: auto;
}

.right-panel-tab-pane {
    height: 100%;
    overflow-y: auto
}

// 滚动条样式
.right-panel-tab-pane::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.right-panel-tab-pane::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
}



:deep(.arco-tabs-content),
:deep(.arco-tabs-content-list) {
    height: 97%;
}
</style>