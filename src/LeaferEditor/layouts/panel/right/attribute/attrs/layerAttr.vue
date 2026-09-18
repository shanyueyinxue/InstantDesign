<script setup lang="ts">
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import layerAttr from "./_layerAttr.vue";

const editor = useLeaferEditor()

const opacity = selectedProxyData(editor, 'opacity')
const blendMode = selectedProxyData(editor, 'blendMode')
const visible = selectedProxyData(editor, 'visible')

</script>

<template>
    <layerAttr :opacity="opacity" :blendMode="blendMode" :visible="visible" />
</template>