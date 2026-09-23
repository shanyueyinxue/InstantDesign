# InstantDesign Usage Documentation

This document is aimed at **secondary developers** and systematically explains how to integrate `createLeaferEditor` and `LeaferEditorLayout`, the options each layer accepts, the APIs for creating elements, the contexts available to slots, and recommended extension entry points.

> The kernel source lives in `src/LeaferEditor`, and all capabilities are exported from `src/LeaferEditor/index.ts`.

## Table of Contents

- [1. Quick Start](#1-quick-start)
- [2. createLeaferEditor Options](#2-createleafereditor-options)
- [3. Editor Instance API and Creation Features](#3-editor-instance-api-and-creation-features)
  - [3.1 Instance Properties](#31-instance-properties)
  - [3.2 Canvas and Pages](#32-canvas-and-pages)
  - [3.3 Element Creation (predefine / Extended Shapes)](#33-element-creation-predefine--extended-shapes)
  - [3.4 Adding/Removing Elements and Grouping](#34-addingremoving-elements-and-grouping)
  - [3.5 View Zoom](#35-view-zoom)
  - [3.6 Import/Export](#36-importexport)
  - [3.7 The Seven Managers](#37-the-seven-managers)
- [4. LeaferEditorLayout Component](#4-leafereditorlayout-component)
- [5. layoutOptions Configuration System](#5-layoutoptions-configuration-system)
  - [5.1 Configuration Overview](#51-configuration-overview)
  - [5.2 Default Values](#52-default-values)
  - [5.3 Data Interfaces (LayoutApiOptions)](#53-data-interfaces-layoutapioptions)
- [6. Slot System](#6-slot-system)
  - [6.1 General Rules](#61-general-rules)
  - [6.2 Built-in Items and Contexts per Slot](#62-built-in-items-and-contexts-per-slot)
  - [6.3 Custom Item Data Structures](#63-custom-item-data-structures)
- [7. Event System](#7-event-system)
- [8. Plugin System](#8-plugin-system)
  - [8.1 Built-in Plugins and Options](#81-built-in-plugins-and-options)
  - [8.2 Plugin Services](#82-plugin-services)
- [9. Extension Entry Points](#9-extension-entry-points)
- [10. Composition API Cheat Sheet](#10-composition-api-cheat-sheet)

---

## 1. Quick Start

Full integration example (excerpted from `src/views/HomeView.vue`):

```vue
<template>
    <LeaferEditorLayout
        ref="layoutRef"
        :editorOptions="editorOptions"
        :options="options"
        :apis="apis"
        :sloganName="sloganName"
        logoUrl="/logo.png"
    />
</template>

<script setup lang="ts">
import LeaferEditorLayout from "../LeaferEditor/layouts/layout.vue";
import { DEFAULT_API } from "../mock";
import type { LayoutOptions, LayoutApiOptions } from "../LeaferEditor/layouts/layoutOptions";
import type { EditorLayoutOptions } from "../LeaferEditor/layouts/layout.vue";

const layoutRef = ref<InstanceType<typeof LeaferEditorLayout>>();
const apis: LayoutApiOptions = DEFAULT_API;

const editorOptions: EditorLayoutOptions = {
    canvas: { width: 1000, height: 1000, fill: "#f5f7fd", zoomMode: "mouse", lockRatio: "corner" },
    history: { maxSize: 64 },
    ruler: { dpi: 96, gridLine: { strokeDragColor: "#ff0800ff" } },
    shortcut: { global: true },
    image: { fileTypes: ["image/jpeg", "image/png", "image/webp"], maxSize: 10 * 1024 * 1024 },
};

const options: LayoutOptions = {
    export: { showCurrentPageJSON: false, preview: { format: "jpg" } },
    isShowFooterBar: false,
    isShowPageText: true,
};

// Get the editor instance via the ref
// layoutRef.value?.editor
</script>
```

- `LeaferEditorLayout` internally calls `createLeaferEditor(editorOptions)` automatically and installs the built-in plugins (Ruler / Shortcut / ContextMenu / ToolBar / Snap).
- If you only want the pure kernel (without the UI layout), call `createLeaferEditor()` directly and mount `editor.view` yourself.

---

## 2. createLeaferEditor Options

```ts
import { createLeaferEditor } from "../LeaferEditor";

const editor = createLeaferEditor(options?: LeaferEditorOptions);
```

`LeaferEditorOptions` is defined in `src/LeaferEditor/core/interfaces/editor.ts`:

```ts
interface LeaferEditorOptions {
    canvas?: EditorCanvasOptions;
    page?: EditorPageOptions;
    history?: EditorHistoryOptions;
    image?: EditorImageOptions;
    font?: EditorFontOptions;
}
```

### canvas — `EditorCanvasOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `600` | Initial canvas width (also the width of newly created pages) |
| `height` | `number` | `600` | Initial canvas height |
| `fill` | `string` | `"#FFF"` | Viewport background color (the App's `fill`) |
| `contentFill` | `string` | `"transparent"` | Background color of the **content layer Frame** |
| `lockRatio` | `boolean \| "corner"` | `false` | Whether the edit box locks the aspect ratio; `"corner"` keeps the ratio only at corners |
| `disabledMove` | `boolean` | `false` | Whether to disable view panning (dragging the canvas) |
| `disabledWheel` | `boolean` | `false` | Whether to disable wheel events |
| `zoomMode` | `boolean \| "mouse"` | `false` | Whether the wheel zooms directly (`"mouse"` zooms centered on the pointer) |
| `hideOnMove` | `boolean` | `false` | Whether to hide the edit box while dragging elements |

### page — `EditorPageOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `changePageZoomFit` | `boolean` | `true` | Whether to automatically `zoom('fit')` after switching pages |

### history — `EditorHistoryOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether undo / redo is enabled |
| `maxSize` | `number` | `20` | Maximum history steps per page |

> History is **independent per page** (`HistoryManager` internally uses `Map<pageId, History>`).

### image — `EditorImageOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fileTypes` | `string[]` | `[]` (i.e. `image/*`) | Allowed MIME types, used for file selection and validation |
| `maxSize` | `number` | `10MB` | Maximum size per file (bytes) |
| `uploadCallback` | `(file, sourceTag, image?) => Promise<{ url, width?, height?, name? }>` | Read as base64 | Image upload callback. Defaults to `readFileAsDataURL`; replace it with an upload endpoint when connecting a real backend |

The `sourceTag` of `uploadCallback` is an `ImageSourceTag` (`OpenImage` / `Base64` / `Blob`, etc.), which helps distinguish the image source.

### font — `EditorFontOptions`

| Option | Type | Description |
| --- | --- | --- |
| `onFontsNotFound` | `(missingFontNames: string[]) => Promise<FontInfo[]> \| FontInfo[]` | When loading JSON, if fonts not registered locally are found, the callback returns `FontInfo[]` to auto-register them (protected by a 10s timeout) |

`FontInfo` structure: `{ code, name, preview?, variants: { url, format, weight?, style? }[] }`.

---

## 3. Editor Instance API and Creation Features

`LeaferEditor` extends `PluginHost`, so it is both an editor and a plugin host.

### 3.1 Instance Properties

| Property | Type | Description |
| --- | --- | --- |
| `options` | `LeaferEditorOptions` | Configuration after merging defaults |
| `app` | `App` | The underlying Leafer App instance (`editor.app.editor` is the leafer editor) |
| `view` | `HTMLElement` | Canvas DOM, to be mounted yourself |
| `eventBus` | `MittBus` | Type-safe event bus |
| `Events` | `typeof EventTypes` | Event enum |
| `selected` | `IUI[]` | Currently selected elements |
| `currentScale` | `number` | Current zoom scale (read/write) |
| `canvasWidth` / `canvasHeight` | `number` | Canvas width / height |
| `page` / `history` / `layer` / `mode` / `image` / `clipboard` / `font` | Manager | The seven managers |

### 3.2 Canvas and Pages

```ts
editor.page.add()                    // Add a page and switch to it (returns id)
editor.page.add(id?, setCurrent?, metaData?)
editor.page.setCurrent(id)           // Switch page
editor.page.remove(id)               // Remove a page (the last one cannot be removed)
editor.page.next() / editor.page.prev()
editor.page.list()                   // Canvas[]
editor.page.current                  // Current Canvas
editor.page.currentID                // Current page id

editor.resize(w, h, syncCanvasSize?) // Viewport size change
editor.canvasResize(w, h)            // Change the canvas size and fire the canvasResize event
editor.clear()                       // Clear the current page's ground/content/sky
editor.clearContent() / clearGround() / clearSky()
```

A page is represented by `Canvas` and contains three Frames:

- `groundFrame`: background checkerboard (transparent base)
- `contentFrame`: the **content layer**, where all design elements are added by default
- `skyFrame`: the top layer (non-interactive, commonly used for watermarks / overlays)

```ts
const page = editor.page.current;
page.width / page.height;            // Read/write (writing triggers a resize)
page.metaData;                       // { cover?, title?, author?, description?, ... }
page.contentLayers;                  // Content layer elements (filtered by NoLayer)
page.add(ui, index?, parent?);
page.replaceContent(children);
page.toJSON() / page.exportContentJSON();
```

### 3.3 Element Creation (predefine / Extended Shapes)

The kernel provides `predefine` factory functions (`src/LeaferEditor/core/utils/predefine.ts`). All functions accept `Partial<IUIInputData>` to override defaults:

| Function | Generated Element | Default Size / Key Parameters |
| --- | --- | --- |
| `rect(options?)` | Rectangle `Rect` | 100×100, `fill: "red"` |
| `roundedRect(options?)` | Rounded rectangle | 100×100, `cornerRadius: 20` |
| `triangle` / `pentagon` / `polygon` | Polygon `Polygon` | 100×100, `sides: 3 / 5 / 5` |
| `roundedPentagon` | Rounded hexagon | 100×100, `sides: 6, cornerRadius: 20` |
| `threeStar` / `pentagram` / `star` | Star `Star` | 100×100, `corners: 3 / 5`, `innerRadius: 0.15` |
| `roundedStar` | Rounded star | 100×100, `corners: 8, innerRadius: 0.5, cornerRadius: 5` |
| `ellipse` | Circle `Ellipse` | 100×100 |
| `ring` | Ring | 100×100, `innerRadius: 0.5` |
| `sector` | Sector | 100×100, `startAngle: -60, endAngle: 180` |
| `ellipse2` | Ellipse | 50×100 |
| `text(options?)` | Text `Text` | Text `"即刻设计-双击编辑"`, `fontSize: 24`, `fontFamily: "阿里巴巴普惠体"` |
| `line(options?)` | Line `Line` | 100, `strokeWidth: 5`, `rotation: 45` |
| `arrow(options?)` | Arrow `Arrow` | 100, `strokeWidth: 5`, `rotation: 45` |

```ts
import { utils } from "../LeaferEditor";
const { predefine } = utils;

editor.add(predefine.text({ text: "Title", fontSize: 36, fill: "#333" }));
```

**Extended shapes (custom registered UI)**: `src/LeaferEditor/core/shapes`

- `QrCode`: `{ text, size, options?, logo?, logoSize?, logoPadding? }`, `lockRatio: true`
- `BarCode`: `{ text, codeHeight, codeUnitWidth?, format?='CODE128', font?, textPosition?, fontSize?, lineColor?, background?, margin? }`, `lockRatio: true`
- `HTMLTable`: table

```ts
import BarCode from "../LeaferEditor/core/shapes/BarCode";
import QrCode from "../LeaferEditor/core/shapes/QrCode";

editor.add(new QrCode({ text: "https://example.com", size: 120 }));
editor.add(new BarCode({ text: "123456789", codeHeight: 100 }));
```

> After creating, it is recommended to call `editor.setNormalizeAttr(ui)` to fill in `id/name/zIndex/editable`, then `editor.add(ui)`. The creation buttons in the left "Add" panel do exactly this.

### 3.4 Adding/Removing Elements and Grouping

```ts
editor.add(child, index?)            // Add, auto-select, and save history
editor.addMany(children)             // Batch add
editor.remove(child?, destroy?)      // If omitted, removes the current selection
editor.removeEmptyGroup()
editor.group() / editor.ungroup()
editor.select(ui | ui[]) / editor.cancel()
editor.setNormalizeAttr(child)       // Recursively fill in id/name/zIndex/editable
```

### 3.5 View Zoom

```ts
editor.zoom("fit" | "in" | "out" | "100%" | ...);  // Pass an IZoomType
editor.zoom(0.5);                                  // Pass a specific scale
editor.currentScale = 1;                           // Set directly
```

Both `zoom` and setting `currentScale` fire the `canvasZoomChange` event.

### 3.6 Import/Export

```ts
editor.toJSON()                      // All pages (including ground/sky)
editor.exportContentJSON()           // Content layer only + metadata
await editor.reLoadFromJSON(json)    // Overwrite load (clear then rebuild)
await editor.appendPagesFromJSON(json) // Append pages

// Export the current page
editor.export("a.png", options?)
editor.exportSync("a.jpg", options?)
editor.exportContentAndSky("a.png", options?)
editor.exportSyncContentAndSky("a.jpg", options?)
```

### 3.7 The Seven Managers

| Manager | Key API |
| --- | --- |
| `page` | See 3.2 |
| `history` | `undo()` `redo()` `save()` `clear()` `disable()` `enable()` `canUndo()` `canRedo()` `info()` |
| `layer` | `moveUp/moveDown/moveToTop/moveToBottom(ui)`, `moveIntoGroup/moveOutOfGroup`, `moveBefore/moveAfter`, `normalizeZIndexes` |
| `mode` | `current`, `setNormal()` `setPreview()` `setDraw()` `set(mode)`, `setPenStyle(style?)`, `penStyle` |
| `image` | `open()` (open a dialog to pick an image, returns Image), `hasLocalImages()`, `uploadLocalImages(options?)` |
| `clipboard` | `copy(selected)` `cut(selected)` `paste()` `clear()` `hasItems` |
| `font` | `fontList`, `defaultFonts`, `addCustomFonts(fonts)`, `hasFont(name)`, `findFontByName(name)`, `resolveMissingFonts(json)` |

---

## 4. LeaferEditorLayout Component

The component is defined in `src/LeaferEditor/layouts/layout.vue`.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `editorOptions` | `EditorLayoutOptions` | No | Kernel config + plugin options (see below) |
| `options` | `LayoutOptions` | No | Layout UI config (see Section 5) |
| `apis` | `LayoutApiOptions` | No | Font / template / material data interfaces (see 5.3) |
| `sloganName` | `string` | Yes | Top title |
| `logoUrl` | `string` | Yes | Top logo URL |

`EditorLayoutOptions` = `LeaferEditorOptions` + plugin options:

```ts
interface EditorLayoutOptions extends LeaferEditorOptions {
    ruler?: EditorRulerOptions;       // RulerPlugin
    shortcut?: ShortcutPluginOptions; // ShortcutPlugin
}
```

The component always installs: `RulerPlugin`, `ShortcutPlugin`, `ContextMenuPlugin`, `ToolBarPlugin`, `SnapPlugin`.

### Expose

You can get the editor instance through `ref`:

```ts
const layoutRef = ref<InstanceType<typeof LeaferEditorLayout>>();
const editor = layoutRef.value?.editor;
```

When the component unmounts, it automatically calls `cleanupSelectedProxy()` and `editor.destroy()`.

---

## 5. layoutOptions Configuration System

Defined in `src/LeaferEditor/layouts/layoutOptions.ts`. `layout.vue` uses `mergeLayoutOptions(editor, userOptions)` to merge **user config → kernel options → built-in defaults** with fallback at each level, then injects it with `provide`; panels consume it via the composition API.

```ts
interface LayoutOptions {
    pageAddable?: boolean;
    theme?: LayoutThemeOptions;
    image?: LayoutImageOptions;
    pagination?: LayoutPaginationOptions;
    previewComponent?: Component;
    slots?: LayoutSlotsOptions;
    isShowFooterBar?: boolean;
    isShowPageText?: boolean;
    font?: LayoutFontOptions;
    shape?: LayoutShapeOptions;
    waterfall?: LayoutWaterfallOptions;
    export?: LayoutExportOptions;
    materialDialog?: LayoutMaterialDialogOptions;
    draw?: LayoutDrawOptions;
    thumbnail?: LayoutThumbnailOptions;
    helpShortcuts?: LayoutHelpShortcutItem[];
    headerActions?: Component[];
    headerLeft?: LayoutHeaderLeftOptions;
}
```

### 5.1 Configuration Overview

| Option | Description |
| --- | --- |
| `pageAddable` | Whether pages can be added / removed at the bottom (default `true`) |
| `theme` | Default fill / stroke / shadow colors |
| `image` | Allowed upload types, size limit, preview size (`acceptTypes` falls back to `editorOptions.image.fileTypes` when absent) |
| `pagination` | Page size of the left material panel; supports a global number or a per-panel object |
| `previewComponent` | Custom preview component, rendered at the bottom of the right panel |
| `slots` | Slot system (see Section 6) |
| `isShowFooterBar` | Whether to show the bottom copyright bar (default `true`) |
| `isShowPageText` | Whether to show text below page thumbnails (default `false`) |
| `font` | Font size presets, preview text, font name suffix, load timeout, default text color |
| `shape` | Default size parameters when creating each shape |
| `waterfall` | Material waterfall layout parameters |
| `export` | Export dialog file types, quality levels, default form, `onSave` callback, preview format |
| `materialDialog` | Material dialog thumbnail size |
| `draw` | Brush stroke presets |
| `thumbnail` | Sizes of the bottom page thumbnail / layer panel thumbnail |
| `helpShortcuts` | Additional content for the "Help" shortcut list |
| `headerActions` | Array of custom components for the top-right (rendered to the left of the save button) |
| `headerLeft` | Toggles for each top-left feature |

### 5.2 Default Values

**theme** (`DEFAULT_THEME`)

```ts
{ defaultFillColor: '#66CCFF', defaultStrokeColor: '#66CCFF', defaultShadowColor: '#66CCFF' }
```

**image** (`DEFAULT_IMAGE`)

```ts
{ acceptTypes: ['.png', '.jpg', '.jpeg'], maxSize: 10 * 1024 * 1024, uploadPreviewSize: 100 }
```

**pagination** (`DEFAULT_PAGINATION`)

```ts
{ pageSize: 10 } // Also supports { template, image, material, text, default }
```

**font** (`DEFAULT_FONT`)

```ts
{
    sizePresets: [8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72],
    previewText: 'Font Preview 字体预览',
    nameSuffix: '-文字',
    loadTimeout: 30000,
    defaultTextColor: '#66CCFF',
}
```

**shape** (`DEFAULT_SHAPE`)

```ts
{
    dialog: { width: 300, height: 200, top: 120, left: 140 },
    title: { fontSize: 36, fontWeight: 'bold', lineHeight: 1.5 },
    body: { fontSize: 18, lineHeight: 1.5 },
    subtitle: { width: 500, height: 200, fontSize: 16 },
    line: { width: 100, strokeWidth: 5, rotation: 45 },
    arrow: { width: 100, strokeWidth: 5, rotation: 45 },
    rect: { width: 100, height: 100, strokeWidth: 5 },
    circle: { width: 100, height: 100 },
    ring: { width: 100, height: 100, innerRadius: 0.5 },
    polygon: { width: 100, height: 100, sides: 5 },
    star: { width: 100, height: 100, corners: 5 },
    barcode: { text: '123456789', codeHeight: 100 },
    qrcode: { text: 'qrcode text', size: 100 },
}
```

**waterfall** (`DEFAULT_WATERFALL`)

```ts
{
    rowKey: 'id', gutter: 2, width: 320,
    breakpoints: { 1200: { rowPerView: 4 }, 800: { rowPerView: 3 }, 500: { rowPerView: 2 } },
    animationEffect: 'animate__fadeInUp', animationDuration: 1000, delay: 50,
    backgroundColor: '#fff', lazyload: true,
}
```

**export** (`DEFAULT_EXPORT`)

```ts
{
    fileTypes: [jpg, png, webp],
    qualityPresets: [1, 0.7, 0.5, 0.3, 0.1],
    defaultForm: { fileType: 'jpg', quality: 1, scale: 1, pixelRatio: 1, trim: false, exportType: 'currentPage' },
    onSave: undefined,
    showDownloadImage: true, showContentJSON: true, showCurrentPageJSON: true,
    preview: { format: 'png' },
}
```

- `onSave(editor)`: fired when "Save" is clicked; if not provided, the whole JSON is downloaded by default.
- `preview.format`: the format used when clicking "Preview" to export as a blob.

**materialDialog** (`DEFAULT_MATERIAL_DIALOG`)

```ts
{ thumbnailSize: 200 }
```

**draw** (`DEFAULT_DRAW`)

```ts
{ strokePresets: [2, 5, 10] }
```

**thumbnail** (`DEFAULT_THUMBNAIL`)

```ts
{ footerPage: 60, layer: 40 }
```

**headerLeft** (`DEFAULT_HEADER_LEFT`)

```ts
{ filePopover: true, undoRedo: true, rulerUnit: true, gridlines: true,
  snap: true, mode: true, copy: true, zoom: true }
```

> `rulerUnit` / `gridlines` are only shown when the ruler is enabled; `copy` is only shown when the page count > 1.

**helpShortcuts**: `LayoutHelpShortcutItem[]`, appended to the built-in shortcut help list:

```ts
[
  { section: 'My Shortcuts', items: [{ keys: 'Ctrl + K', description: 'Open command palette' }] },
]
```

**headerActions**: `Component[]`, rendered at the top right:

```ts
import githubBtn from "./actions/githubBtn.vue";
const options = { headerActions: [githubBtn] };
```

### 5.3 Data Interfaces (LayoutApiOptions)

The layout layer does not care about the data source; it is injected via `apis`. The default implementation is in `src/mock`. All 10 interfaces:

```ts
interface LayoutApiOptions {
    queryFontList(params): Promise<Response<FontListData>>
    queryMyFontList(params): Promise<Response<FontListData>>
    uploadFont(file): Promise<Response<FontInfo>>
    queryTemplateList(params & { category?, keyword? }): Promise<Response<any>>
    queryTemplateCategories(): Promise<Response<CategoryListData>>
    queryImageMaterialList(params & { category?, keyword? }): Promise<Response<any>>
    queryImageCategories(): Promise<Response<CategoryListData>>
    queryMaterialList(params? & { category?, keyword? }): Promise<Response<any>>
    queryMaterialCategories(): Promise<Response<CategoryListData>>
    uploadMaterial(req): Promise<Response<Record<string, never>>>
}
```

- `params`: `{ pageSize, pageNum }`
- `Response<T>`: `{ code, msg, data: T }`
- `FontListData`: `{ list: FontInfo[], total }`
- `CategoryListData`: `{ list: { label, value }[], total }`

---

## 6. Slot System

```ts
interface LayoutSlotsOptions {
    attributeOne?: SlotConfig<AttrSlotCustomItem>;    // Single-selection attribute panel
    attributeSome?: SlotConfig<AttrSlotCustomItem>;   // Multi-selection attribute panel
    attributeZero?: SlotConfig<AttrSlotCustomItem>;   // No-selection attribute panel
    leftPanel?: SlotConfig<LeftSlotCustomItem>;       // Left material panel
    toolBar?: SlotConfig<ToolBarSlotCustomItem>;      // Top toolbar
}
```

### 6.1 General Rules

Each slot config supports three operations, merged by `resolveSlotList(builtin, config)`:

```ts
interface SlotConfig<TCustom> {
    hidden?: string[];               // 1. Hide built-in items (by name)
    order?: Record<string, number>;  // 2. Adjust order (for built-in and custom items)
    custom?: TCustom[];              // 3. Inject custom items
}
```

Sorting rules: ascending by `order`; when `order` is equal, the original order is kept; custom items without a specified `order` go to the end by default (`1e6`). The default `order` of built-in items is generated by `createCounter(100, 100)` (100, 200, 300…).

### 6.2 Built-in Items and Contexts per Slot

> **Important**: slot components do **not** receive the editor via props; they obtain context via `inject` / the composition API. Inside custom components, use the APIs below.

#### attributeOne / attributeSome / attributeZero

Render location: the "Attributes" page of the right panel. The attribute panel switches between one/some/zero based on the selection count (`attribute/index.vue`).

| Slot | Built-in item names |
| --- | --- |
| `attributeOne` | `baseAttr`, `ungroupAttr`, `alignTool`, `canvasAlignTool`, `layerAttr`, `layerNameAttr`, `groupAttr`, `textAttr`, `imageAttr`, `barcodeAttr`, `qrcodeAttr`, `lineAttr`, `arrowAttr`, `rectAttr`, `ellipseAttr`, `polygonAttr`, `starAttr`, `fillAttr`, `strokeAttr`, `shadowAttr` |
| `attributeSome` | `baseAttr`, `layerAttr`, `groupAttr`, `alignTool`, `canvasAlignTool` |
| `attributeZero` | `canvasAttr`, `canvasAutoSizeAttr`, `canvasLocalUpload`, `canvasBgAttr`, `drawAttr` |

**Available context** (call within the component):

```ts
import { useLeaferEditor } from '@/LeaferEditor/layouts/editorContext'
import { selectedProxyData } from '@/LeaferEditor/layouts/selectedProxyData'
import { useLayoutOptions, useLayoutTheme, useLayoutApis } from '@/LeaferEditor/layouts/layoutOptions'

const editor = useLeaferEditor()               // Editor instance
const tag = selectedProxyData(editor, 'tag')   // Reactive property of the current selection (e.g. tag/x/y/fill…)
const opts = useLayoutOptions()                // Full layoutOptions
const theme = useLayoutTheme()                 // Shorthand access to theme
const apis = useLayoutApis()                   // Data interfaces
```

`selectedProxyData(editor, key, defaultValue?, onChangeAndSave?)` returns a `computed`:

```ts
{
  modelValue,           // Reactive value
  defaultValue,
  onChange(value),      // Write to the currently selected element
  onEnd(),              // Usually used for history.save()
}
```

#### leftPanel

Render location: the left sidebar. Built-in panels:

| name | Description | icon (iconfont class) |
| --- | --- | --- |
| `add` | Add elements (shapes / text / barcode, etc.) | `icon-plus-circle` |
| `template` | Template list | `icon-apps` |
| `material` | Material list | `icon-common` |
| `image` | Image list | `icon-image` |
| `text` | Text list | `icon-font-colors` |

**Available context**: same as the attribute panel (`useLeaferEditor` / `useLayoutOptions` / `useLayoutTheme` / `useLayoutApis` / `selectedProxyData`).

**Extra props**: when rendering a custom component, the left panel passes `active: boolean`, indicating whether the panel is active:

```vue
<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>
```

#### toolBar

Render location: the middle of the top bar. Built-in items:

| name | Description |
| --- | --- |
| `group` | Group (`editor.group()`) |
| `ungroup` | Ungroup (`editor.ungroup()`) |

**Note**: `toolBar` custom items are **configuration objects** (not Vue components) rendered directly as buttons by `toolBar.vue`. They therefore have no component context; if you need to call `useLeaferEditor()` yourself, use the `leftPanel` / `attributeX` slots or `headerActions` instead.

### 6.3 Custom Item Data Structures

**AttrSlotItem** (attribute panel):

```ts
interface AttrSlotItem {
    name: string;
    component: Component;
    order: number;
    show: () => boolean;   // When it returns false, nothing is rendered
}
// Custom item: Partial<AttrSlotItem> & { name: string; component: Component }
```

**LeftSlotItem** (left panel):

```ts
interface LeftSlotItem {
    name: string;
    component: Component;
    icon: string | Component;  // String = iconfont tag; an Arco icon component is also accepted
    label?: string;
    order: number;
}
// Custom item: Partial<LeftSlotItem> & { name; component; icon }
```

**ToolBarSlotItem** (top toolbar):

```ts
interface ToolBarSlotItem {
    name: string;
    content: string;        // tooltip text
    iconClass: string;      // UnoCSS icon class, e.g. 'i-svg:object-group'
    order: number;
    onClick: () => void;
    disabled: () => boolean;
}
// Custom item: Partial<ToolBarSlotItem> & { name; content; iconClass; onClick }
```

**Full example**:

```ts
const options: LayoutOptions = {
    slots: {
        attributeZero: {
            hidden: ['drawAttr'],
            order: { canvasBgAttr: 0 },
            custom: [{
                name: 'my-panel',
                component: MyPanel,
                order: 500,
                show: () => true,
            }],
        },
        leftPanel: {
            hidden: ['material'],
            order: { image: 1, template: 0 },
            custom: [{
                name: 'my-material',
                label: 'My Materials',
                icon: MyIcon,          // Or an iconfont string
                component: MyMaterialPanel,
            }],
        },
        toolBar: {
            custom: [{
                name: 'align',
                content: 'Align',
                iconClass: 'i-svg:align',
                onClick: () => {},
            }],
        },
    },
};
```

---

## 7. Event System

`editor.eventBus` is a type-safe `MittBus`; listener parameter types are inferred automatically:

```ts
editor.eventBus.on(editor.Events.selected, (list: IUI[]) => { /* ... */ });
editor.eventBus.on(editor.Events.canvasZoomChange, (scale: number) => { /* ... */ });
```

### Event List

| Category | Events (parameters) |
| --- | --- |
| Page | `pageAddBefore/After` (`{oldId,newId}`), `pageChangeBefore/After`, `pageRemoveBefore/After` (`id`) |
| Canvas | `canvasAddBefore/After` (`{_child,_index}`), `canvasChange` (`PropertyEvent`), `canvasResize` (`{width,height}`), `canvasRemoveBefore/After` |
| Selection | `selectedBefore`, `selected` (`IUI[]`), `cancelSelected` |
| View | `canvasZoomChange` (`number`) |
| Mode / History | `changeMode` (`string`), `undoRedoStackChange`, `historyStateSavedAfter` (`{state,pageId}`) |
| JSON | `loadJSONBefore/After` (`{json}`) |
| Image | `imageLocalUploadSuccess` (`{url,newUrl}`), `imageLocalUploadError` (`{url,error}`) |

### API

```ts
eventBus.on(type, handler)
eventBus.off(type, handler)
eventBus.once(type, handler)
eventBus.emit(type, param)
eventBus.stop() / start()
eventBus.clear(type?)

// Untyped external event channel (integrating with third-party libraries / backend pushes)
eventBus.onExternal(name, fn)
eventBus.offExternal(name, fn)
eventBus.emitExternal(name, obj)
eventBus.hasExternal(name)
```

> Internal examples of the external channel: the footer listens to `updatePagesThumbnail` / `updateCurrentPageThumbnail` to refresh thumbnails; copy operations emit `copyToAllPageDone` / `copyToPageDone`.

---

## 8. Plugin System

Any class that extends `PluginHost` gains plugin capabilities; `LeaferEditor` itself is a subclass, so **all core capabilities are provided by plugins**.

```ts
interface IPlugin<T = any, O = any> {
    name: string;
    description?: string;
    version?: string;
    author?: string;
    dependentPlugins?: string[];
    dependentServices?: string[];
    install(host: IPluginHost<T>, options?: O): void;
    uninstall?(host: IPluginHost<T>): void;
}
```

Host API:

```ts
editor.use(plugin, options?)                 // Install
editor.unuse(pluginName, autoCleanup?)       // Uninstall (automatically cleans up services and hooks)
editor.getService<T>(name)                   // Get a service
editor.hasService(name) / hasPlugin(name)
editor.registerServiceFor(plugin, name, svc) // Register a service within a plugin
editor.getPluginInfo(name) / getPluginInfos()
editor.hook(PluginEvent.install, fn, pluginName?) // Lifecycle hook
```

Plugin state machine: `pending → installing → installed → uninstalling → uninstalled`; on error it enters `error`.

### 8.1 Built-in Plugins and Options

| Plugin | Class / name | Service name | Options |
| --- | --- | --- | --- |
| Shortcut | `ShortcutPlugin` / `shortcut` | `shortcut` | `{ global?: boolean }` whether to bind globally (binds to `editor.view` by default) |
| Context menu | `ContextMenuPlugin` / `ContextMenu` | `ContextMenu` | None |
| Ruler | `RulerPlugin` / `Ruler` | `Ruler` | `EditorRulerOptions` |
| Floating toolbar | `ToolBarPlugin` / `ToolBarPlugin` | `toolBar` | None (add/remove buttons via the service) |
| Snap | `SnapPlugin` / `snap` | `snap` | None (automatically incorporates Ruler grid lines) |

**EditorRulerOptions**:

```ts
{
    enabled?: boolean;          // Whether the ruler is enabled
    unit?: string;              // Initial unit: px / cm / in / pt / pc / mm
    dpi?: number;               // Only controls unit display conversion, default 72
    gridLine?: {
        strokeColor?: string;       // Guide color, default '#1d1dff'
        strokeDragColor?: string;   // Color while dragging, default '#ff0000'
    };
}
```

Built-in shortcuts (bound by `ShortcutPlugin` by default): `mod+z/y`, `mod+a`, `esc`, `del/backspace`, `mod+left/right`, `mod+0/1`, `+/-`, `[`/`]`, `mod+[`/`]`, `mod+g`, `mod+shift+g`, `h`, `mod+c/x/v`, `shift+h/v`, `m/v/p` (mode), `l` (lock), `,/.` (rotate), `w/a/s/d` (move).

### 8.2 Plugin Services

```ts
import {
    useLeaferEditorShortcutPluginService,
    useLeaferEditorContextMenuPluginService,
    useLeaferEditorRulerPluginService,
    useLeaferEditorToolBarPluginService,
    useLeaferEditorSnapPluginService,
} from "../LeaferEditor";

const shortcut = useLeaferEditorShortcutPluginService(editor);
shortcut.bindShortcut('mod+k', () => { /* ... */ });
shortcut.trigger('mod+a');

const ruler = useLeaferEditorRulerPluginService(editor);
ruler.changeUnit('cm');
ruler.newGridLine(100, 'h');
ruler.toggleEnabled();

const toolbar = useLeaferEditorToolBarPluginService(editor);
toolbar.addItem({ id: 'lock', label: 'Lock', onClick: (node) => {} });

const menu = useLeaferEditorContextMenuPluginService(editor);
menu.registerContextMenu(() => ({ key: 'my', title: 'My Menu', type: 'ALL', callback: () => {} }));
```

**ToolBarItem** (floating toolbar button):

```ts
{
    id: string;                 // Unique identifier; duplicates overwrite
    label?: string;
    icon?: string;              // HTML/SVG string
    onClick?: (node: ILeaf) => void;
    divider?: boolean;
    help?: string | (() => string);
    type?: 'one' | 'some';      // Shown on single / multiple selection
    visible?: (node, type) => boolean;
}
```

**MenuOptions** (context menu item):

```ts
{
    key: string;
    title: string;
    type: 'ALL' | 'ONE' | 'SOME' | 'ZERO' | MenuType[];  // Scenario
    desc?: string;
    children?: MenuOptions[];
    callback?: (e: { pointerEvent, mouseEvent, type, key }) => void | boolean;
    showCallback?: () => boolean;
    disableCallback?: () => boolean;
}
```

---

## 9. Extension Entry Points

Listed in ascending order of change scope, the recommended priority is:

### 1) Listen to events (zero intrusion)

```ts
editor.eventBus.on(editor.Events.undoRedoStackChange, () => { /* mark unsaved */ });
editor.eventBus.on(editor.Events.selected, (list) => { /* ... */ });
```

### 2) Adjust the UI via layoutOptions

- `slots`: add/remove/modify/reorder the left panel, attribute panels, and toolbar.
- `headerLeft`: hide top features as needed.
- `headerActions`: inject custom components into the top right.
- `theme` / `shape` / `export`, etc.: adjust defaults and export behavior.

### 3) Inject data interfaces (replace the Mock)

Implement the 10 methods of `LayoutApiOptions` and pass them via `apis` to connect a real backend.

### 4) Register context menus / toolbar buttons / shortcuts (service extensions)

```ts
const menu = useLeaferEditorContextMenuPluginService(editor);
menu.registerContextMenu(() => ({ key: 'export-psd', title: 'Export PSD', type: 'ALL', callback: () => {} }));

const toolbar = useLeaferEditorToolBarPluginService(editor);
toolbar.addItem({ id: 'center', label: 'Center', onClick: () => {} });

const shortcut = useLeaferEditorShortcutPluginService(editor);
shortcut.bindShortcut('mod+k', () => {});
```

### 5) Write a custom plugin (recommended way to extend capabilities)

```ts
import type { IPlugin, IPluginHost } from "../LeaferEditor";
import type { LeaferEditor } from "../LeaferEditor";

class WatermarkPlugin implements IPlugin<LeaferEditor, { text: string }> {
    name = "Watermark";
    install(host: IPluginHost<LeaferEditor>, options?: { text: string }) {
        const editor = host.getInstance();
        // Use another plugin's service
        const ruler = editor.getService("Ruler");
        // Register its own service
        host.registerServiceFor(this, "Watermark", this);
    }
    uninstall(host: IPluginHost<LeaferEditor>) {
        host.unregisterService("Watermark");
    }
}

editor.use(new WatermarkPlugin(), { text: "InstantDesign" });
```

> If you want the plugin to be installed automatically with `LeaferEditorLayout`, fork `layout.vue` and append `editor.use(...)`; or assemble the UI yourself based on `createLeaferEditor`.

### 6) Extend element creation capabilities

- Use `utils.predefine` to quickly create basic shapes.
- Refer to `src/LeaferEditor/core/shapes/QrCode.ts` and `BarCode.ts`; register new Leafer UI types via `@registerUI()` + `dataProcessor` + `@boundsType` so they participate in rendering, editing, and export just like built-in shapes.
- Add creation buttons in the left "Add" panel: inject a custom panel via `slots.leftPanel.custom`, or modify `addWrap.vue`.

### 7) Custom snap elements

`SnapPlugin` automatically incorporates Ruler grid lines into snapping; to extend it, listen to its service or refer to `extendElement` in `snap.ts`.

### 8) Modify the layout shell component

`src/LeaferEditor/layouts/layout.vue` is the UI assembly center (installing plugins, providing context). To change the overall skeleton or the default plugin combination, copy this file as a custom layout.

---

## 10. Composition API Cheat Sheet

| API | Source | Description |
| --- | --- | --- |
| `createLeaferEditor(options?)` | `LeaferEditor/index.ts` | Create an editor instance |
| `useLeaferEditor()` | `layouts/editorContext.ts` | Get the editor within the layout component tree |
| `useLayoutOptions()` | `layouts/layoutOptions.ts` | Get the merged full layout config |
| `useLayoutTheme()` | `layouts/layoutOptions.ts` | Shorthand access to `theme` |
| `useLayoutApis()` | `layouts/layoutOptions.ts` | Data interfaces |
| `selectedProxyData(editor, key, default?, save?)` | `layouts/selectedProxyData.ts` | Reactive property of the currently selected element |
| `activeObject` | `layouts/selectedProxyData.ts` | The currently single-selected element (`shallowRef<IUI \| null>`) |
| `resolveSlotList(builtin, config)` | `layouts/layoutOptions.ts` | Merge built-in and custom slot items |
| `resolvePaginationPageSize(pagination, key)` | `layouts/layoutOptions.ts` | Resolve the page size of a given panel |

### Key Type Exports

```ts
import type {
    LeaferEditorOptions, EditorCanvasOptions, EditorPageOptions,
    EditorHistoryOptions, EditorImageOptions, EditorFontOptions,
    IPlugin, IPluginHost, ILeaferEditor,
} from "../LeaferEditor";

import type {
    LayoutOptions, LayoutApiOptions, LayoutSlotsOptions,
    AttrSlotItem, LeftSlotItem, ToolBarSlotItem, SlotConfig,
} from "../LeaferEditor/layouts/layoutOptions";

import type { EditorLayoutOptions } from "../LeaferEditor/layouts/layout.vue";
```

---

## Appendix: Notes

- It is recommended to wrap the editor instance with `markRaw()` to avoid deep reactive proxying by Vue (`layout.vue` already does this).
- `editor.destroy()` uninstalls all plugins and destroys history / pages / mode / font, and clears the event bus; be sure to call it when the component unmounts.
- Some image / font resources come from the internet; please comply with the respective licenses when redistributing.
