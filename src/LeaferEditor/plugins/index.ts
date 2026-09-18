export * from './interfaces';
export * from './shortcut';
export * from './contextMenu';
export * from './ruler';
export * from './toolBar';
export { SnapPlugin } from './snap';

import type { LeaferEditor } from '../core';
import type {
    IShortcutPluginService,
    IContextMenuPluginService,
    IRulerPluginService,
    IToolBarPluginService,
    ISnapPluginService,
} from './interfaces';
import {
    ShortcutPluginServiceName,
    ContextMenuPluginServiceName,
    RulerPluginServiceName,
    ToolBarPluginServiceName,
    SnapPluginServiceName,
} from './interfaces';

export function useLeaferEditorShortcutPluginService(editor: LeaferEditor): IShortcutPluginService {
    const plugin = editor.getService(ShortcutPluginServiceName) as IShortcutPluginService;
    if (!plugin) {
        throw new Error('ShortcutPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorContextMenuPluginService(editor: LeaferEditor): IContextMenuPluginService {
    const plugin = editor.getService(ContextMenuPluginServiceName) as IContextMenuPluginService;
    if (!plugin) {
        throw new Error('ContextMenuPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorRulerPluginService(editor: LeaferEditor): IRulerPluginService {
    const plugin = editor.getService(RulerPluginServiceName) as IRulerPluginService;
    if (!plugin) {
        throw new Error('RulerPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorToolBarPluginService(editor: LeaferEditor): IToolBarPluginService {
    const plugin = editor.getService(ToolBarPluginServiceName) as IToolBarPluginService;
    if (!plugin) {
        throw new Error('ToolBarPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorSnapPluginService(editor: LeaferEditor): ISnapPluginService {
    const plugin = editor.getService(SnapPluginServiceName) as ISnapPluginService;
    if (!plugin) {
        throw new Error('SnapPlugin is not installed');
    }
    return plugin;
}
