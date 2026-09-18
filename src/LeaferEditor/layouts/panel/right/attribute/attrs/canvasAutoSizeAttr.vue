<template>
    <div class="p2">
        <a-button @click="handleClick">{{ $t('leaferEditorLayouts.panelRight.attribute.canvas.button.resizeCanvas') }}</a-button>
        <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
            <template #title>
                <span>{{ $t('leaferEditorLayouts.panelRight.attribute.canvas.modal.title.resizeCanvas') }}</span>
            </template>
            <div>
                <p>{{ $t('leaferEditorLayouts.panelRight.attribute.canvas.label.currentPageSize') }}{{ editor.page.current.width }} x {{ editor.page.current.height }}</p>
                <p>{{ $t('leaferEditorLayouts.panelRight.attribute.canvas.label.modifiedSize') }}{{ width }} x {{ height }}</p>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLeaferEditor } from '../../../../editorContext';
import { toFixed as _toFixed } from '../../../../../utils/math';

const toFixed = (num: number, precision: number = 0) => _toFixed(num, precision);
const editor = useLeaferEditor();

const visible = ref(false);
const width = ref(editor.page.current.width);
const height = ref(editor.page.current.height);
const x = ref(0);
const y = ref(0);

const handleClick = () => {
    const children = editor.page.current.contentLayers;
    if (children.length === 0) {
        return;
    }
    editor.select(children);
    const minX = toFixed(Math.min(...children.map(child => (child.x || 0))));
    const minY = toFixed(Math.min(...children.map(child => (child.y || 0))));
    const w = toFixed(editor.app.editor.element!.boxBounds.width)
    const h = toFixed(editor.app.editor.element!.boxBounds.height)

    width.value = toFixed(w);
    height.value = toFixed(h);
    x.value = minX;
    y.value = minY;
    editor.cancel();

    if (
        width.value === editor.page.current.width &&
        height.value === editor.page.current.height &&
        x.value === 0 &&
        y.value === 0
    ) {
        return;
    }
    visible.value = true;
};
const handleOk = () => {
    const children = editor.page.current.contentLayers;
    if (children.length === 0) {
        return;
    }
    editor.select(children);
    editor.app.editor.element!.x = 0
    editor.app.editor.element!.y = 0
    editor.canvasResize(width.value, height.value);
    editor.zoom('fit');
    editor.cancel();
    x.value = 0;
    y.value = 0;
    width.value = editor.page.current.width;
    height.value = editor.page.current.height;
    visible.value = false;
};
const handleCancel = () => {
    visible.value = false;
}
</script>