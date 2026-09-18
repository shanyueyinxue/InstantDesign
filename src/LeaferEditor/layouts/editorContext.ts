import { inject, type InjectionKey } from 'vue'
import type { LeaferEditor } from '../core'
import '../proxyData'  

export const LEAFFER_EDITOR_KEY: InjectionKey<LeaferEditor> = Symbol('leaferEditor')

export function useLeaferEditor(): LeaferEditor {
    const editor = inject<LeaferEditor>(LEAFFER_EDITOR_KEY)
    if (!editor) throw new Error('LeaferEditor not provided via provide(LEAFER_EDITOR_KEY, editor)')
    return editor
}
