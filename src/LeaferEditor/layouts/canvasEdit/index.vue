<template>
    <div class="viewport-container">
        <div ref="viewport" id="viewport"></div>
    </div>
</template>

<script setup lang="ts">
import { useLeaferEditor } from '../editorContext'
import { useLeaferEditorRulerPluginService } from '../../index'
import { onMounted, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";

const viewport = ref()

onMounted(async () => {
    const app = useLeaferEditor()
    useLeaferEditorRulerPluginService(app).changeUnit('px')

    app.resize(viewport.value.offsetWidth, viewport.value.offsetHeight)

    // 监听视口大小变化
    // 使用 ResizeObserver 监听视口大小变化
    // 当视口大小变化时，调用 app.resize(width, height) 方法调整画布大小
    // 这样可以确保画布大小始终保持与视口大小一致
    // 但是需要注意的是，ResizeObserver 监听的是视口大小变化，而不是画布大小变化
    useResizeObserver(viewport, (entries) => {
        const [entry] = entries
        const { width, height } = entry!.contentRect
        app.resize(width, height)
    })
    viewport.value.append(app.view)
})

</script>
<style scoped lang="less">
@import url('../styles/layouts');
.viewport-container {
    width: 100%;
    height: 100%;
    padding: @contentLayoutPadding;
    background-color: #f1f1f1;
    overflow: hidden;
    position:relative;
}

#viewport {
    width: 100%;
    height: 100%;
    position:relative;
}
</style>
