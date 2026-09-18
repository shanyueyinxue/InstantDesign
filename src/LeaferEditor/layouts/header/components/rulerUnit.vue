<template>
    <a-space size="medium">
        <dropdownButton @select="onSelect">
            <a-tooltip mini position="bottom" effect="dark"
                :content="t('leaferEditorLayouts.header.rulerUnit.unit') + '(' + rulerUnitLabel + ')'">
                <a-button style="width: 32px;" class="icon-btn pd-5px" @click="changeRulerUnit">
                    {{ rulerUnit }}
                </a-button>
            </a-tooltip>
            <template #content>
                <a-doption value="toggleEnable">
                    {{ t('leaferEditorLayouts.header.rulerUnit.toggleEnable') }}
                </a-doption>
            </template>
        </dropdownButton>
    </a-space>
</template>
<style scoped></style>

<script setup lang="ts">
import { useLeaferEditor } from '../../editorContext'
import { useLeaferEditorRulerPluginService } from '../../../index'
import dropdownButton from "../../components/dropdownButton.vue";
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const editor = useLeaferEditor()
const rulerService = useLeaferEditorRulerPluginService(editor)
rulerService.toggleEnabled
// px、cm、in、pt、pc、mm
const rulerUnitList = computed(() => [
    { label: t('leaferEditorLayouts.header.rulerUnit.px'), value: 'px' },
    { label: t('leaferEditorLayouts.header.rulerUnit.cm'), value: 'cm' },
    { label: t('leaferEditorLayouts.header.rulerUnit.in'), value: 'in' },
    { label: t('leaferEditorLayouts.header.rulerUnit.mm'), value: 'mm' },
    { label: t('leaferEditorLayouts.header.rulerUnit.pt'), value: 'pt' },
    { label: t('leaferEditorLayouts.header.rulerUnit.pc'), value: 'pc' },
])

const rulerUnit = ref(rulerUnitList.value[0]!.value || 'px')
const rulerUnitLabel = ref(rulerUnitList.value[0]!.label || '')

let n = 1
const changeRulerUnit = () => {
    const list = rulerUnitList.value
    const unit = list[n]?.value || 'px'
    rulerUnitLabel.value = list[n]?.label || ''
    n = (n + 1) % list.length
    rulerService.changeUnit(unit)
    rulerUnit.value = unit
}
const onSelect = (value: string | number | Record<string, any> | undefined, ev: Event) => {
    if (value === 'toggleEnable') {
        rulerService.toggleEnabled()
    }
}
</script>
