import type { ILeaf } from "@leafer-ui/interface";
import type { IPlugin, IPluginHost } from "../core/interfaces";
import {
    ToolBarPluginServiceName,
    type IToolBarPluginService,
    type ToolBarItem,
} from "./interfaces";
import { EditToolbarPlugin } from "./toolBar/index";
import type { LeaferEditor } from "../core/editor";
import * as ops from "./editorOperations";
import { t } from "../i18n"

export class ToolBarPlugin implements IPlugin<LeaferEditor>, IToolBarPluginService {
    name = "ToolBarPlugin";

    private _items: ToolBarItem[] = [];
    private _editToolbar: EditToolbarPlugin | null = null;
    private _editor: LeaferEditor | null = null;

    private get editor(): LeaferEditor {
        if (!this._editor) throw new Error("Plugin not installed");
        return this._editor;
    }

    install(host: IPluginHost<LeaferEditor>) {
        this._editor = host.getInstance();
        this._initDefaultItems();
        this._installEditToolbar();
        host.registerServiceFor(this, ToolBarPluginServiceName, this, "ToolBar Plugin Service");
    }

    private _initDefaultItems() {
        const e = () => this.editor;

        this._items = [
            {
                id: "copy", help: () => t("leaferEditorPlugins.copy"), icon: `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1780040699242" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6135" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z" p-id="6136"></path><path d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"  p-id="6137"></path><path d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z" p-id="6138"></path><path d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z" p-id="6139"></path><path d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z" p-id="6140"></path></svg>`, onClick: () => {
                    e().history.disable();
                    ops.copy(e())
                    ops.paste(e())
                    e().selected.forEach(ui => {
                        ui!.x! += 10
                        ui!.y! += 10
                    })
                    e().history.enable();
                    e().history.save();
                }
            },
            { id: "delete", help: () => t("leaferEditorPlugins.delete"), icon: `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1780040391813" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5160" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M817.968553 215.897142l-169.357176 0 0-58.869782c0-25.391297-20.657482-46.048779-46.048779-46.048779l-181.125197 0c-25.391297 0-46.048779 20.657482-46.048779 46.048779l0 58.869782-169.357176 0c-25.391297 0-46.048779 20.657482-46.048779 46.048779l0 71.631434c0 25.391297 20.657482 46.048779 46.048779 46.048779l28.321022 0 0 425.947112c0 59.246359 48.200792 107.447151 107.447151 107.447151l340.40076 0c59.246359 0 107.447151-48.200792 107.447151-107.447151L789.647531 379.626133l28.321022 0c25.391297 0 46.048779-20.657482 46.048779-46.048779l0-71.631434C864.017332 236.554624 843.35985 215.897142 817.968553 215.897142zM426.553932 162.14389l170.892135 0 0 53.753251-170.892135 0L426.553932 162.14389zM738.482221 805.574269c0 31.033807-25.248034 56.281841-56.281841 56.281841L341.79962 861.85611c-31.033807 0-56.281841-25.248034-56.281841-56.281841L285.517779 379.626133l452.964442 0L738.482221 805.574269zM812.852022 328.460824l-601.704045 0 0-61.398372 203.227588 0c2.302439 0.356111 4.66116 0.542352 7.061836 0.542352l181.125197 0c2.400676 0 4.759397-0.186242 7.062859-0.542352l203.226564 0L812.852022 328.460824zM513.023306 783.320429c14.128789 0 25.582655-11.453866 25.582655-25.582655l0-288.572348c0-14.128789-11.453866-25.582655-25.582655-25.582655-14.128789 0-25.582655 11.453866-25.582655 25.582655l0 288.572348C487.440651 771.866562 498.894518 783.320429 513.023306 783.320429zM645.541459 783.320429c14.128789 0 25.582655-11.453866 25.582655-25.582655l0-288.572348c0-14.128789-11.453866-25.582655-25.582655-25.582655s-25.582655 11.453866-25.582655 25.582655l0 288.572348C619.958804 771.866562 631.41267 783.320429 645.541459 783.320429zM380.505154 783.320429c14.128789 0 25.582655-11.453866 25.582655-25.582655l0-288.572348c0-14.128789-11.453866-25.582655-25.582655-25.582655s-25.582655 11.453866-25.582655 25.582655l0 288.572348C354.922499 771.866562 366.376365 783.320429 380.505154 783.320429z" p-id="5161"></path></svg>`, onClick: () => ops.deleteSelected(e()), divider: true },

            {
                id: "toTop", type: "one", icon: `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1780448924274" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5864" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M870.4 640l-55.04 39.04 34.56 24.96L512 945.28 174.08 704l34.56-24.96L153.6 640 64 704l448 320 448-320z" p-id="5865"></path><path d="M870.4 448l-55.04 39.04 34.56 24.96L512 753.28 174.08 512l34.56-24.96L153.6 448 64 512l448 320 448-320z" p-id="5866"></path><path d="M960 320l-448 320-448-320 448-320 448 320z" p-id="5867"></path></svg>`, onClick: () => {
                    ops.zIndexMoveToTop(e())
                }, divider: true, help: () => t("leaferEditorPlugins.toTop"),
            },
            { id: "toBottom", type: "one", help: () => t("leaferEditorPlugins.toBottom"), icon: `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1780449207799" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6894" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M960 320L512 0 64 320l448 320zM512 78.72L849.92 320 512 561.28 174.08 320z" p-id="6895"></path><path d="M815.36 487.04l34.56 24.96L512 753.28 174.08 512l34.56-24.96L153.6 448 64 512l448 320 448-320-89.6-64-55.04 39.04z" p-id="6896"></path><path d="M512 896l-358.4-256L64 704l448 320 448-320-89.6-64L512 896z" p-id="6897"></path></svg>`, onClick: () => ops.zIndexMoveToBottom(e()), divider: true },
            // { id: "group", type: "some", label: "Group", onClick: () => ops.group(e()), divider: true },
            // {
            //     id: "ungroup", visible: (node: ILeaf, type: ToolBarItem["type"]) => {
            //         if (type !== "one") return false;
            //         if (node.tag !== "Group") return false;
            //         return true
            //     }, type: "one", label: "Ungroup", onClick: () => ops.ungroup(e()), divider: true
            // },
            // { id: "lock", label: "Lock", onClick: () => ops.toggleLock(e()), divider: true },
        ];
    }

    addItem(item: ToolBarItem): void {
        const idx = this._items.findIndex(i => i.id === item.id);
        if (idx >= 0) this._items[idx] = item;
        else this._items.push(item);
    }

    removeItem(id: string): void {
        this._items = this._items.filter(i => i.id !== id);
    }

    getItems(): ToolBarItem[] {
        return [...this._items];
    }

    clearItems(): void {
        this._items = [];
    }

    private _shouldShowEditToolbar = true;
    get shouldShowEditToolbar(): boolean {
        return this._shouldShowEditToolbar;
    }
    set shouldShowEditToolbar(value: boolean) {
        this._shouldShowEditToolbar = value;
        if (value) {
            this._editToolbar?.show();
        } else {
            this._editToolbar?.hide();
        }
    }

    private _installEditToolbar() {
        this._editToolbar = new EditToolbarPlugin(this.editor.app, {
            className: "edit-toolbar",
            baseScale: 1,
            // followScale: true,
            shouldShow: () => {
                return this._items.length > 0 && this.shouldShowEditToolbar;
            },
            onRender: (node, container) => {
                this._render(container, node);
            },
        });
    }

    private _render(container: HTMLDivElement, node: ILeaf) {
        container.innerHTML = "";
        container.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });

        const style = document.createElement("style");
        style.textContent = `
            .toolbar { display:flex; align-items:center; height:40px; margin:4px 0; background:#fff; border-radius:5px; border:1px solid #ccc; box-shadow:0 0 10px rgba(0,0,0,0.1); }
            .divider { width:1px; height:100%; background:#ccc; }
            .toolbar-item { display:flex; align-items:center; height:100%; padding:0 10px; cursor:pointer; white-space:nowrap; }
            .toolbar-item:hover { background:rgba(0,0,0,0.1); }
            .toolbar-item.icon {width:40px;overflow:hidden;fill:#272636 !important; }
        `;
        container.appendChild(style);

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        // toolbar.addEventListener("wheel", (e) => e.preventDefault());
        container.appendChild(toolbar);

        const selectedCount = this.editor.selected.length;
        let isFirst = true;
        for (const item of this._items) {
            if (item.type === "one" && selectedCount !== 1) continue;
            if (item.type === "some" && selectedCount <= 1) continue;
            if (item.visible && !item.visible(node, item.type)) continue;

            if (item.divider && !isFirst) {
                const divider = document.createElement("div");
                divider.className = "divider";
                toolbar.appendChild(divider);
            }
            isFirst = false;

            const el = document.createElement("div");
            el.className = "toolbar-item";

            let label = ""
            if (item.label) {
                label = item.icon ? `${item.icon} ${item.label}` : item.label;
            };
            if (item.icon) {
                label = item.label ? `${item.icon} ${item.label}` : item.icon;
                el.classList.add("icon");
            }
            el.innerHTML = label;

            if (item.help) {
                el.title = typeof item.help === 'function' ? item.help() : item.help;
            }

            if (item.onClick) {
                el.addEventListener("click", () => {
                    item.onClick!(node);
                });
            }
            toolbar.appendChild(el);
        }
    }

    uninstall(host: IPluginHost<LeaferEditor>) {
        this._editToolbar?.destroy();
        this._editToolbar = null;
        this._editor = null;
        this._items = [];
        host.unregisterService(ToolBarPluginServiceName);
    }
}
