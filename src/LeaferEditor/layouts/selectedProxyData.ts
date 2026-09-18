import { isDefined } from '@vueuse/core'
import { computed, ref, shallowRef, watchEffect} from "vue"
import { isArray, isNumber } from "lodash"

import type { LeaferEditor } from "../core"
import { Tag } from "../core/interfaces";
import type { IUI } from "leafer-ui"

import { toFixed } from "../utils/math"

export const activeObject = shallowRef<IUI | null>(null)

const lockRatio = (editor: LeaferEditor, selected: IUI[]) => {
    if (editor.options.canvas?.lockRatio === true || selected.length === 0) {
        return false
    }
    for (let i = 0; i < selected.length; i++) {
        const item = selected[i]!
        if (item.tag === Tag.QrCode || item.lockRatio === true) {
            editor.app.editor.config.lockRatio = true
            return true
        } else if (item.tag === Tag.Group && item.children!.length > 0) {
            if (lockRatio(editor, item.children!)) {
                return true
            }
        }
    }
    editor.app.editor.config.lockRatio = editor.options.canvas?.lockRatio
    return false
}

export function initSelectedProxyData(editor: LeaferEditor) {
    const onSelected = (selected: IUI[]) => {
        lockRatio(editor, selected)
        if (selected.length === 1) {
            activeObject.value = selected[0] ?? null
        } else {
            activeObject.value = null
        }
    }
    const onCancelSelected = () => {
        activeObject.value = editor.page.current.contentFrame
    }
    const onPageChangeAfter = () => {
        activeObject.value = editor.page.current.contentFrame
    }

    editor.eventBus.on(editor.Events.selected, onSelected)
    editor.eventBus.on(editor.Events.cancelSelected, onCancelSelected)
    editor.eventBus.on(editor.Events.pageChangeAfter, onPageChangeAfter)

    return () => {
        editor.eventBus.off(editor.Events.selected, onSelected)
        editor.eventBus.off(editor.Events.cancelSelected, onCancelSelected)
        editor.eventBus.off(editor.Events.pageChangeAfter, onPageChangeAfter)
    }
}

// selectedProxyData 获取当前实例的代理数据
export function selectedProxyData(
    editor: LeaferEditor,
    key: string,
    defaultValue?: any,
    onChangeAndSave: boolean = false
) {
    const modelValue = ref()

    watchEffect(() => {
        if (!isDefined(activeObject.value)) {
            modelValue.value = undefined
            return
        }
        let value
        let orgValue = activeObject.value.proxyData![key]
        if ((!isDefined(orgValue) || orgValue === 0) && defaultValue) {
            value = defaultValue
        } else {
            value = orgValue
        }

        modelValue.value = isNumber(value) ? toFixed(value) : value
    })

    const setObjectValue = (obj: any, newValue: never) => {
        if (!obj) return
        if (obj[key] !== newValue) {
            modelValue.value = isNumber(newValue) ? toFixed(newValue) : newValue
            if (isArray(newValue)) {
                obj[key] = [].concat(newValue)
            } else {
                obj[key] = newValue
            }
        }
        if (onChangeAndSave) {
            editor.history.save()
        }
    }

    return computed(() => ({
        modelValue: modelValue.value,
        defaultValue: defaultValue,
        onChange: (newValue: any) => setObjectValue(activeObject.value!, newValue as never),
        onEnd: () => editor.history.save(),
    }))
}
