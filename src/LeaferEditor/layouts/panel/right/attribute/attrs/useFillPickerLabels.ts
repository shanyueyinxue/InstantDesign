import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useFillPickerLabels() {
    const { t } = useI18n()

    return computed(() => ({
        typeLabels: {
            solid: t('leaferEditorLayouts.components.fillPicker.gradient.typeLabels.solid'),
            linear: t('leaferEditorLayouts.components.fillPicker.gradient.typeLabels.linear'),
            radial: t('leaferEditorLayouts.components.fillPicker.gradient.typeLabels.radial'),
            image: t('leaferEditorLayouts.components.fillPicker.gradient.typeLabels.image'),
        },
        fillTypeLabels: {
            linear: t('leaferEditorLayouts.components.fillPicker.fillType.linear'),
            radial: t('leaferEditorLayouts.components.fillPicker.fillType.radial'),
            image: t('leaferEditorLayouts.components.fillPicker.fillType.image'),
        },
        degree: t('leaferEditorLayouts.components.fillPicker.panel.degree'),
        imagePanel: {
            fillMode: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.fillMode'),
            opacity: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.opacity'),
            modeOptions: {
                cover: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.options.cover'),
                fit: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.options.fit'),
                stretch: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.options.stretch'),
                clip: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.options.clip'),
                repeat: t('leaferEditorLayouts.components.fillPicker.panel.imageSelector.options.repeat'),
            },
        },
    }))
}
