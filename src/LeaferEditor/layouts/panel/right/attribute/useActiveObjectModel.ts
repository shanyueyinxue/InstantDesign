import { computed, ref } from 'vue'
import type { LeaferEditor } from '../../../../core';

export const useActiveObjectModel = <T>(editor: LeaferEditor, defaultValue: T, updateCallback?: (value: T, oldValue?: T) => void, onEndCallback?: () => void) => {
    const modelValue = ref<T>(defaultValue)
    const callback = (value: T, oldValue?: T) => {
        if (updateCallback) {
            updateCallback(value, oldValue);
        }
    }
    const onChange = (value: T, isRunCallback: boolean = true) => {
        const oldValue = modelValue.value;
        modelValue.value = value;
        if (isRunCallback && updateCallback) callback(value, oldValue);
    }

    return computed(() => ({
        modelValue: modelValue.value as T,
        defaultValue: defaultValue,
        onChange: onChange,
        onEnd: onEndCallback || (() => {
            editor.history.save();
        })
    }))
}