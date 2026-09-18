# InstantDesign

> An open-source poster designer built on [LeaferJS](https://www.leaferjs.com/) + Vue 3 + TypeScript — ready to use out of the box and deeply extensible.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文文档 Chinese](./README.md)

![img](./imgs/image.png)

## Introduction

InstantDesign is a free, open-source poster / image design tool powered by the high-performance **LeaferJS** rendering engine. It ships with a complete multi-page canvas, layers, history, shortcuts, context menus, rulers and guides, snapping, and more. It also provides an **event bus**, a **plugin system**, and a deeply configurable **layoutOptions** system, making secondary development as easy as stacking building blocks.

### Core Features

- **Canvas**: drag to pan, wheel to zoom, multi-page management, layer tree operations, group / ungroup
- **Elements**: text, rectangle, ellipse, polygon, star, path drawing, images, plus extended **QR code / barcode**
- **PSD Import**: import PSD designs directly for a seamless design workflow
- **History**: per-page undo / redo stack with configurable step count and toggle
- **Productivity**: context menu, shortcuts, ruler + grid guides, smart snapping, export (image / JSON)
- **Deep Customization**: UI layout, slots, and data APIs are all injectable via `layoutOptions` and `apis`

### Use Cases

- Poster / ad design, logo creation, AI image compositing
- QR-code promo posters, e-commerce product images, business card design
- Holiday posters, social media graphics, and other image editing tasks

## Tech Stack

| Category | Technology |
| --- | --- |
| Rendering Engine | LeaferJS 2.1 (leafer-ui, @leafer-in/editor, viewport, text-editor, arrow, animate, etc.) |
| Frontend Framework | Vue 3.5 + TypeScript 5.9 |
| Build Tooling | Vite 7 + Vue Router + Pinia (optional) |
| UI Components | Arco Design Vue, Vant 4 |
| Styling | UnoCSS, Less |
| Utilities | i18next (i18n), ag-psd (PSD parsing), Mousetrap (shortcuts), qrcode / jsbarcode, leafer-x-easy-snap (snapping) |

## Quick Start

```bash
# Requirements: Node.js ^20.19.0 or >=22.12.0
npm install        # Install dependencies
npm run dev        # Start the dev server
npm run build      # Type-check + production build
npm run preview    # Preview the build output
```

## Project Structure

```plain
src/
├── LeaferEditor/            # Designer kernel (reusable core library)
│   ├── core/                # Engine core
│   │   ├── editor.ts        # LeaferEditor main class (entry, extends PluginHost)
│   │   ├── canvas.ts        # Canvas / page abstraction
│   │   ├── managers/        # Seven managers: Page / History / Layer / Mode / Image / Clipboard / Font
│   │   ├── events/          # Event system (MittBus type-safe event bus + EventTypes)
│   │   ├── pluginHost/      # Plugin host system (PluginHost + interface definitions)
│   │   ├── shapes/          # Extended shapes: QR code / barcode / table
│   │   └── interfaces/      # Core type definitions
│   ├── plugins/             # Built-in plugins: shortcut / context menu / ruler / toolbar / snap
│   ├── layouts/             # Vue layout layer (layout.vue shell + left/right panels + attribute panel)
│   │   ├── layoutOptions.ts # layoutOptions configuration system (a key section below)
│   │   └── panel/           # Left material panel, right attribute / layer panel
│   ├── i18n/                # Kernel-level i18n
│   ├── proxyData/           # Reactive proxy data (selection state driving the UI)
│   └── utils/               # Utility functions (including the PSD parser)
├── views/                   # Page views (HomeView assembles the editor)
├── mock/                    # Mock data and default API implementations
└── locales/                 # Application-level i18n messages
```

---

## Core Systems

### 1. Event System

The kernel includes a fully type-safe event bus, `MittBus` (`src/LeaferEditor/core/events/`). The editor instance exposes it via `editor.eventBus`, used for listening to and dispatching events across the whole lifecycle: pages, canvas, selection, history, export, and more.

#### Type Safety

The `EventTypes` enum defines all event names, and the `EventsParam` map assigns a parameter type to each event. Listeners get the correct types without any assertions:

```typescript
// The parameter type is inferred from EventsParam[EventTypes.selected] as IUI[]
editor.eventBus.on(editor.Events.selected, (list) => {
    console.log('Current selection:', list)
})

editor.eventBus.on(editor.Events.canvasZoomChange, (scale) => {
    console.log('Zoom scale:', scale) // number
})
```

#### Main Event Categories

| Category | Events |
| --- | --- |
| Page lifecycle | `pageAddBefore / pageAddAfter`, `pageChangeBefore / pageChangeAfter`, `pageRemoveBefore / pageRemoveAfter` |
| Canvas | `canvasAddBefore / canvasAddAfter`, `canvasChange`, `canvasResize`, `canvasRemoveBefore / canvasRemoveAfter` |
| Selection | `selectedBefore`, `selected`, `cancelSelected` |
| View | `canvasZoomChange` |
| Mode / History | `changeMode`, `undoRedoStackChange`, `historyStateSavedAfter` |
| JSON import/export | `loadJSONBefore / loadJSONAfter` |
| Image | `imageLocalUploadSuccess / imageLocalUploadError` |

#### MittBus API

```typescript
eventBus.on(type, handler)      // Subscribe (generic parameter inferred automatically)
eventBus.off(type, handler)     // Unsubscribe
eventBus.once(type, handler)    // Fire only once
eventBus.emit(type, param)      // Dispatch
eventBus.stop() / start()       // Pause / resume dispatch
eventBus.clear(type?)           // Clear (optionally by type)
// Untyped external event channel for integrating with third-party libraries / backend pushes
eventBus.onExternal(name, fn)   // Subscribe to an external event
eventBus.emitExternal(name, o)  // Dispatch an external event
```

**Robustness**: an exception thrown by a single listener does not affect other listeners — errors are intercepted and logged with the event name, handler name, and parameter details. Dynamically adding/removing listeners during `emit` also does not cause iteration errors.

---

### 2. Plugin System

The kernel implements a complete plugin mechanism based on a self-built **plugin host** (`src/LeaferEditor/core/pluginHost/`): any class that extends `PluginHost` automatically gains "plugin install / uninstall, service registration / lookup, dependency checking, lifecycle hooks", and more. `LeaferEditor` itself is a subclass of `PluginHost`, so **all core capabilities are provided by plugins**.

#### Core Interface

```typescript
interface IPlugin<T, O> {
    name: string                 // Unique plugin identifier
    install(host, options?)      // Install hook (required)
    uninstall?(host)             // Uninstall hook (optional)
    dependentPlugins?: string[]  // Other plugins this plugin depends on
    dependentServices?: string[] // Services this plugin depends on
}
```

A plugin exposes capabilities via `host.registerServiceFor(plugin, name, service)`, which other plugins or application code retrieve with `editor.getService(name)`:

```typescript
// Custom plugin example
class WatermarkPlugin implements IPlugin {
    name = 'Watermark'
    install(host, options) {
        const editor = host.getInstance()          // Get the editor instance
        const ruler = editor.getService<IRulerPluginService>('Ruler') // Use another plugin's service
        host.registerServiceFor(this, 'Watermark', this)              // Register its own service
    }
    uninstall(host) { host.unregisterService('Watermark') }
}

editor.use(new WatermarkPlugin(), { text: 'InstantDesign' }) // Install
editor.getService('Watermark')                               // Use
```

#### Lifecycle State Machine

Every plugin has a runtime state, and the install/uninstall process goes through a full state transition:

```plain
pending → installing → installed → uninstalling → uninstalled
                  ↘            ↘
                   error        error (install / uninstall failed)
```

Uninstalling automatically performs three cleanup tasks: removing the plugin's registered **event hooks**, unregistering **all of its services**, and calling the plugin's `uninstall()`.

#### Built-in Plugins

| Plugin | Service Name | Capability |
| --- | --- | --- |
| `ShortcutPlugin` | `shortcut` | Shortcut system (based on Mousetrap; bind/trigger key combos, global/instance scope) |
| `ContextMenuPlugin` | `ContextMenu` | Context menu with `ONE / SOME / ZERO / ALL` scenario registration, nested submenus, show/disable conditions |
| `RulerPlugin` | `Ruler` | Ruler + grid guides (multi-unit switching, DPi, guide migration across pages) |
| `ToolBarPlugin` | `toolBar` | Floating action bar for selected objects (add/remove buttons by single/multi selection) |
| `SnapPlugin` | `snap` | Snapping (automatically incorporates the Ruler plugin's grid guides into alignment) |

`layout.vue` shows the standard wiring:

```typescript
const editor = markRaw(createLeaferEditor(coreOptions))
editor.use(new RulerPlugin(), ruler)         // Install with options
editor.use(new ShortcutPlugin(), shortcut)
editor.use(new ContextMenuPlugin())
editor.use(new ToolBarPlugin())
editor.use(new SnapPlugin())                 // Snap depends on the Ruler service and can obtain it automatically
```

> How plugins cooperate: in `install`, `SnapPlugin` reads the ruler's grid lines via `editor.getService(RulerPluginName)` and adds them to the snap element set. This demonstrates a decoupled design that "depends on services, not hardcoded instances".

---

### 3. layoutOptions Configuration System

`layoutOptions` (`src/LeaferEditor/layouts/layoutOptions.ts`) is the **deep configuration layer for the layout UI**. The layout shell component `layout.vue` receives the `options` prop, deeply merges **user config with built-in defaults** via `mergeLayoutOptions` (falling back to the editor `coreOptions` items of the same name), then injects the result with `provide`. All panel components consume it via the composition API.

#### Configuration Entry

```vue
<LeaferEditorLayout
    :editorOptions="editorOptions"   <!-- Kernel config + plugin options -->
    :options="options"               <!-- layoutOptions layout config -->
    :apis="apis"                     <!-- Material/font data interfaces -->
    :sloganName="sloganName"
    logoUrl="/logo.png"
/>
```

#### Configuration Overview

| Option | Description |
| --- | --- |
| `theme` | Default fill / stroke / shadow colors |
| `image` | Allowed image upload types, size limit, preview size |
| `font` | Font size presets, preview text, font loading timeout, etc. |
| `shape` | Default size parameters for each shape (rect/circle/star/QR/barcode…) |
| `pagination` | Items per page in the left material panel (configurable per panel) |
| `waterfall` | Material waterfall layout (breakpoints, gutter, lazy loading, etc.) |
| `export` | Export dialog file types, quality levels, default form, `onSave` callback |
| `materialDialog` | Material dialog thumbnail size |
| `draw` | Brush tool stroke presets |
| `thumbnail` | Sizes of the bottom page thumbnail and the layer panel thumbnail |
| `helpShortcuts` | Content of the "Help" shortcut list |
| `headerActions` | Array of custom action components for the top bar (e.g. the GitHub button in the example) |
| `headerLeft` | Toggles for top-left features (file/undo-redo/ruler unit/gridlines/snap/mode/copy/zoom) |
| `previewComponent` | Custom preview component |
| `slots` | **Slot system** (see below) |
| `pageAddable` / `isShowFooterBar` / `isShowPageText` | Page add/remove allowed / footer bar visibility / page text visibility |

#### Slot System

`slots` lets you **add / remove / modify / reorder** built-in UI regions:

- `attributeOne / attributeSome / attributeZero`: the right attribute panel for single selection / multi selection / no selection
- `leftPanel`: the left material panel (template / image / material / text / component)
- `toolBar`: the header toolbar

Each slot supports three operations:

```typescript
options: {
    slots: {
        leftPanel: {
            hidden: ['material'],                       // 1. Hide a built-in panel
            order: { image: 1, template: 0 },           // 2. Reorder built-in panels
            custom: [{                                 // 3. Inject a custom panel
                name: 'my-panel',
                label: 'My Materials',
                icon: Icon,                             // Arco icon name
                order: 2,                               // Defaults to the end if omitted
                component: MyMaterialPanel,             // Any Vue component
            }],
        },
        toolBar: {
            custom: [{ 
                name: 'align', 
                content: 'Align', 
                iconClass: 'i-xxx',  // Custom icon class name; use a Uno icon class 'i-svg:XXX'
                onClick: () => {} 
            }],
        },
    },
}
```

At runtime, `resolveSlotList(builtin, config)` merges the "built-in list + custom list", applies hidden filtering, and sorts by `order`; the panel updates automatically.

#### Consuming with the Composition API

Panel components can read the config directly via inject at any level:

```typescript
import { useLayoutOptions, useLayoutTheme, useLayoutApis } from '../layoutOptions'

const layoutOptions = useLayoutOptions()   // Full config (defaults already merged)
const theme = useLayoutTheme()             // Shorthand access to theme
const apis = useLayoutApis()               // Material/font data interfaces
```

#### Data Interfaces (LayoutApiOptions)

The layout layer does not care about the data source. It injects font, template, and material query / upload interfaces (paged + categorized + keyword) via `apis`. A Mock implementation from `src/mock` is provided by default; to connect a real backend, simply replace it following the interface signatures:

```typescript
const apis: LayoutApiOptions = {
    queryFontList: (params) => http.get('/api/fonts', { params }),
    queryTemplateList: (params) => http.get('/api/templates', { params }),
    // ... the remaining 10 interfaces
}
```

---

## Secondary Development Tips

1. **Do not modify the kernel**: prefer extending capabilities via `editor.use(Plugin)` and adjusting the UI via `options.slots`, rather than changing `LeaferEditor` source code.
2. **Listen to events**: to react to state changes, subscribe to `editor.eventBus` (e.g. `selected`, `undoRedoStackChange` to implement an "unsaved changes on leave" prompt).
3. **Custom material sources**: implement and inject `LayoutApiOptions` to replace the default Mock.

## Notes

Some resources in this project (images, fonts, etc.) come from the internet. Please comply with relevant laws and regulations when using them. If any copyright is infringed, please contact me for removal.

## License

This project is open-sourced under the **MIT License**, author **Tian**. See [LICENSE](LICENSE) for details.

## Acknowledgements

Special thanks to the following projects for providing references and foundations:

- [gzm-design](https://github.com/LvHuaiSheng/gzm-design) (UI / interaction reference)
- [LeaferJS](https://www.leaferjs.com/) and its plugin ecosystem
