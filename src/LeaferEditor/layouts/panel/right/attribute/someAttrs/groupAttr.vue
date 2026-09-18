<script setup lang="ts">
import { useLeaferEditor } from '../../../../editorContext';
import { ShortcutPluginServiceName, type IShortcutPluginService } from "../../../../../plugins"
import TipContentKey from "../../../../components/tooltip";

const editor = useLeaferEditor();

const triggerShortcut = (combo: string) =>
    editor.getService<IShortcutPluginService>(ShortcutPluginServiceName)?.trigger(combo);

</script>
<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col>
                <a-tooltip mini position="bottom">
                    <a-button size="small" @click="triggerShortcut('mod+g')" long>
                        {{ $t('leaferEditorLayouts.panelRight.attribute.some.group.button') }}
                    </a-button>
                    <template #content>
                        <TipContentKey :content="$t('leaferEditorLayouts.panelRight.attribute.some.group.tooltip')"
                            :keys="['mod+g']" />
                    </template>
                </a-tooltip>
            </a-col>
        </a-row>
    </div>
</template>
<style scoped lang="less"></style>
