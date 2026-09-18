<template>
    <div class="viewport-container">
        <div ref="viewport" id="viewport"></div>
    </div>
</template>

<script setup lang="ts">
import { LeaferEditor, useLeaferEditorRulerPluginService, RulerPlugin, ContextMenuPlugin, ShortcutPlugin, ToolBarPlugin, SnapPlugin } from '@/LeaferEditor'
import { onMounted, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";
import json from './test.json'
const viewport = ref()

onMounted(async () => {
    const app = new LeaferEditor()
    app.use(new RulerPlugin())
    app.use(new ContextMenuPlugin())
    app.use(new ShortcutPlugin())
    app.use(new ToolBarPlugin())
    app.use(new SnapPlugin())


    useLeaferEditorRulerPluginService(app).changeUnit('px')

    app.resize(viewport.value.offsetWidth, viewport.value.offsetHeight)

    // 监听视口大小变化，自动调整画布大小
    useResizeObserver(viewport, (entries) => {
        const [entry] = entries
        const { width, height } = entry!.contentRect
        app.resize(width, height, false)
    })
    viewport.value.append(app.view)

    app.appendPagesFromJSON(json)
})

</script>
<style scoped>
.viewport-container {
    width: 100vw;
    height: 100vh;
    padding: 15px;
    padding-bottom: 8px;
    background-color: #f1f1f1;
    overflow: hidden;
    position: relative;
}

#viewport {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
