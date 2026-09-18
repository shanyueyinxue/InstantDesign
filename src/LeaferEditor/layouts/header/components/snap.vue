<template>
    <a-space>
        <a-tooltip mini position="bottom" effect="dark">
            <a-button :type="isEnabled ? 'text' : 'secondary'" class="icon-btn pd-5px" @click="() => {
                toggle()
            }">
                <div class="icon i-svg:adsorption"></div>
            </a-button>
            <template #content>
                {{ t('leaferEditorLayouts.header.snap.help') }}
            </template>
        </a-tooltip>
    </a-space>
</template>
<style scoped></style>

<script setup lang="ts">
import { useLeaferEditor } from '../../editorContext'
import { useLeaferEditorSnapPluginService } from '../../../index'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()


const editor = useLeaferEditor()
const snapService = useLeaferEditorSnapPluginService(editor)
const isEnabled = ref(snapService.isEnabled)
const toggle = () => {
    if (!snapService) return
    snapService.isEnabled ? snapService.disable() : snapService.enable()
    isEnabled.value = !isEnabled.value
}
</script>
