import { LeaferEditor } from './core';
import type { LeaferEditorOptions } from './core';

export * from './core';
export * from './plugins';
export { setLocale, getLocale, addResources, t } from './i18n';

export function createLeaferEditor(options?: LeaferEditorOptions): LeaferEditor {
    return new LeaferEditor(options);
}
