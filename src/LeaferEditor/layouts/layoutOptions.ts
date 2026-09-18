import { inject, type Component, type InjectionKey } from 'vue'
import type { LeaferEditor } from '../core'
import type { PageParams } from './types/page'
import type { Response } from './types/response'
import type { FontInfo } from '../core/managers/FontManager'

export interface LayoutImageOptions {
  acceptTypes?: string[]
  maxSize?: number
  uploadPreviewSize?: number
}

export interface LayoutThemeOptions {
  defaultFillColor?: string
  defaultStrokeColor?: string
  defaultShadowColor?: string
}

export interface LayoutPaginationPerPanel {
  template?: number
  image?: number
  material?: number
  text?: number
  default?: number
}

export interface LayoutPaginationOptions {
  pageSize?: number | LayoutPaginationPerPanel
}

export interface FontListData {
  list: FontInfo[]
  total: number
}

export interface CategoryItem {
  label: string
  value: string
}
export interface CategoryListData {
  list: CategoryItem[]
  total: number
}

export interface LayoutFontOptions {
  sizePresets?: number[]
  previewText?: string
  nameSuffix?: string
  loadTimeout?: number
  defaultTextColor?: string
}

export interface LayoutShapeOptions {
  dialog?: { width?: number; height?: number; top?: number; left?: number }
  title?: { fontSize?: number; fontWeight?: string; lineHeight?: number }
  body?: { fontSize?: number; lineHeight?: number }
  subtitle?: { width?: number; height?: number; fontSize?: number }
  line?: { width?: number; strokeWidth?: number; rotation?: number }
  arrow?: { width?: number; strokeWidth?: number; rotation?: number }
  rect?: { width?: number; height?: number; strokeWidth?: number }
  circle?: { width?: number; height?: number }
  ring?: { width?: number; height?: number; innerRadius?: number }
  polygon?: { width?: number; height?: number; sides?: number }
  star?: { width?: number; height?: number; corners?: number }
  barcode?: { text?: string; codeHeight?: number }
  qrcode?: { text?: string; size?: number }
}

export interface LayoutWaterfallOptions {
  rowKey?: string
  gutter?: number
  width?: number
  breakpoints?: Record<number, { rowPerView: number }>
  animationEffect?: string
  animationDuration?: number
  delay?: number
  backgroundColor?: string
  lazyload?: boolean
}

export interface LayoutExportOptions {
  fileTypes?: { value: string; label: string }[]
  qualityPresets?: { value: number; label: string }[]
  defaultForm?: {
    fileType?: string
    quality?: number
    scale?: number
    pixelRatio?: number
    trim?: boolean
    exportType?: string
  }
  onSave?: ((editor: LeaferEditor) => void | Promise<void>) | undefined
  showDownloadImage?: boolean
  showContentJSON?: boolean
  showCurrentPageJSON?: boolean
  preview?: { format?: string }
}

export interface LayoutMaterialDialogOptions {
  thumbnailSize?: number
}

export interface LayoutDrawOptions {
  strokePresets?: number[]
}

export interface LayoutThumbnailOptions {
  footerPage?: number
  layer?: number
}

export interface LayoutHelpShortcutItem {
  section: string
  items: { keys: string; description: string }[]
}

export interface LayoutHeaderLeftOptions {
  filePopover?: boolean
  undoRedo?: boolean
  rulerUnit?: boolean
  gridlines?: boolean
  snap?: boolean
  mode?: boolean
  copy?: boolean
  zoom?: boolean
}

export interface LayoutApiOptions {
  queryFontList: (params: PageParams) => Promise<Response<FontListData>>
  queryMyFontList: (params: PageParams) => Promise<Response<FontListData>>
  uploadFont: (file: File) => Promise<Response<FontInfo>>
  queryTemplateList: (params: PageParams & { category?: string; keyword?: string }) => Promise<Response<any>>
  queryTemplateCategories: () => Promise<Response<CategoryListData>>
  queryImageMaterialList: (params: PageParams & { category?: string; keyword?: string }) => Promise<Response<any>>
  queryImageCategories: () => Promise<Response<CategoryListData>>
  queryMaterialList: (params?: PageParams & { category?: string; keyword?: string }) => Promise<Response<any>>
  queryMaterialCategories: () => Promise<Response<CategoryListData>>
  uploadMaterial: (req: any) => Promise<Response<Record<string, never>>>
}

export interface AttrSlotItem {
  name: string
  component: Component
  order: number
  show: () => boolean
}

export interface LeftSlotItem {
  name: string
  component: Component
  icon: string | Component
  label?: string
  order: number
}

export interface ToolBarSlotItem {
  name: string
  content: string
  iconClass: string
  order: number
  onClick: (editor: LeaferEditor) => void
  disabled: (editor: LeaferEditor) => boolean
}

export interface SlotConfig<TCustom> {
  order?: Record<string, number>
  hidden?: string[]
  custom?: TCustom[]
}

export type AttrSlotCustomItem = Partial<AttrSlotItem> & { name: string; component: Component }
export type LeftSlotCustomItem = Partial<LeftSlotItem> & { name: string; component: Component; icon: string | Component }
export type ToolBarSlotCustomItem = Partial<ToolBarSlotItem> & { name: string; content: string; iconClass: string; onClick: (editor: LeaferEditor) => void }

export interface LayoutSlotsOptions {
  attributeOne?: SlotConfig<AttrSlotCustomItem>
  attributeSome?: SlotConfig<AttrSlotCustomItem>
  attributeZero?: SlotConfig<AttrSlotCustomItem>
  leftPanel?: SlotConfig<LeftSlotCustomItem>
  toolBar?: SlotConfig<ToolBarSlotCustomItem>
}

export interface LayoutOptions {
  pageAddable?: boolean
  theme?: LayoutThemeOptions
  image?: LayoutImageOptions
  pagination?: LayoutPaginationOptions
  previewComponent?: Component
  slots?: LayoutSlotsOptions
  isShowFooterBar?: boolean
  isShowPageText?: boolean
  font?: LayoutFontOptions
  shape?: LayoutShapeOptions
  waterfall?: LayoutWaterfallOptions
  export?: LayoutExportOptions
  materialDialog?: LayoutMaterialDialogOptions
  draw?: LayoutDrawOptions
  thumbnail?: LayoutThumbnailOptions
  helpShortcuts?: LayoutHelpShortcutItem[]
  headerActions?: Component[]
  headerLeft?: LayoutHeaderLeftOptions
  isShowFooterPageViewThumbnail?: boolean
}

const CUSTOM_DEFAULT_ORDER = 1e6

export const DEFAULT_THEME: Required<LayoutThemeOptions> = {
  defaultFillColor: '#66CCFF',
  defaultStrokeColor: '#66CCFF',
  defaultShadowColor: '#66CCFF',
}

export const DEFAULT_IMAGE: Required<LayoutImageOptions> = {
  acceptTypes: ['.png', '.jpg', '.jpeg'],
  maxSize: 10 * 1024 * 1024,
  uploadPreviewSize: 100,
}

export const DEFAULT_PAGINATION: Required<LayoutPaginationOptions> = {
  pageSize: 10,
}

export const DEFAULT_FONT: Required<LayoutFontOptions> = {
  sizePresets: [8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72],
  previewText: 'Font Preview 字体预览',
  nameSuffix: '-文字',
  loadTimeout: 30000,
  defaultTextColor: '#66CCFF',
}

export const DEFAULT_SHAPE: Required<LayoutShapeOptions> = {
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

export const DEFAULT_WATERFALL: Required<LayoutWaterfallOptions> = {
  rowKey: 'id',
  gutter: 2,
  width: 320,
  breakpoints: { 1200: { rowPerView: 4 }, 800: { rowPerView: 3 }, 500: { rowPerView: 2 } },
  animationEffect: 'animate__fadeInUp',
  animationDuration: 1000,
  delay: 50,
  backgroundColor: '#fff',
  lazyload: true,
}

export const DEFAULT_EXPORT = {
  fileTypes: [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WEBP' },
  ],
  qualityPresets: [
    { value: 1, label: '100%' },
    { value: 0.7, label: '70%' },
    { value: 0.5, label: '50%' },
    { value: 0.3, label: '30%' },
    { value: 0.1, label: '10%' },
  ],
  defaultForm: {
    fileType: 'jpg',
    quality: 1,
    scale: 1,
    pixelRatio: 1,
    trim: false,
    exportType: 'currentPage',
  },
  onSave: undefined!,
  showDownloadImage: true,
  showContentJSON: true,
  showCurrentPageJSON: true,
  preview: { format: 'png' },
} as Required<LayoutExportOptions>

export const DEFAULT_MATERIAL_DIALOG: Required<LayoutMaterialDialogOptions> = {
  thumbnailSize: 200,
}

export const DEFAULT_DRAW: Required<LayoutDrawOptions> = {
  strokePresets: [2, 5, 10],
}

export const DEFAULT_HEADER_LEFT: Required<LayoutHeaderLeftOptions> = {
  filePopover: true,
  undoRedo: true,
  rulerUnit: true,
  gridlines: true,
  snap: true,
  mode: true,
  copy: true,
  zoom: true,
}

export const DEFAULT_THUMBNAIL: Required<LayoutThumbnailOptions> = {
  footerPage: 60,
  layer: 40,
}

export const LAYOUT_OPTIONS_KEY: InjectionKey<LayoutOptions> = Symbol('layoutOptions')

export function mergeLayoutOptions(editor: LeaferEditor, userOptions?: LayoutOptions): LayoutOptions {
  const editorOpts = editor.options
  return {
    pageAddable: userOptions?.pageAddable ?? true,
    theme: {
      defaultFillColor: userOptions?.theme?.defaultFillColor ?? DEFAULT_THEME.defaultFillColor,
      defaultStrokeColor: userOptions?.theme?.defaultStrokeColor ?? DEFAULT_THEME.defaultStrokeColor,
      defaultShadowColor: userOptions?.theme?.defaultShadowColor ?? DEFAULT_THEME.defaultShadowColor,
    },
    image: {
      acceptTypes: userOptions?.image?.acceptTypes
        ?? editorOpts.image?.fileTypes
        ?? DEFAULT_IMAGE.acceptTypes,
      maxSize: userOptions?.image?.maxSize
        ?? editorOpts.image?.maxSize
        ?? DEFAULT_IMAGE.maxSize,
      uploadPreviewSize: userOptions?.image?.uploadPreviewSize ?? DEFAULT_IMAGE.uploadPreviewSize,
    },
    pagination: {
      pageSize: userOptions?.pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
    },
    previewComponent: userOptions?.previewComponent,
    slots: userOptions?.slots,
    isShowFooterBar: userOptions?.isShowFooterBar ?? true,
    isShowPageText: userOptions?.isShowPageText ?? false,
    font: { ...DEFAULT_FONT, ...userOptions?.font },
    shape: { ...DEFAULT_SHAPE, ...userOptions?.shape },
    waterfall: { ...DEFAULT_WATERFALL, ...userOptions?.waterfall },
    export: { ...DEFAULT_EXPORT, ...userOptions?.export },
    materialDialog: { ...DEFAULT_MATERIAL_DIALOG, ...userOptions?.materialDialog },
    draw: { ...DEFAULT_DRAW, ...userOptions?.draw },
    thumbnail: { ...DEFAULT_THUMBNAIL, ...userOptions?.thumbnail },
    helpShortcuts: userOptions?.helpShortcuts,
    headerActions: userOptions?.headerActions,
    headerLeft: { ...DEFAULT_HEADER_LEFT, ...userOptions?.headerLeft },
    isShowFooterPageViewThumbnail: userOptions?.isShowFooterPageViewThumbnail ?? true,
  }
}

export function resolvePaginationPageSize(
  pagination: LayoutPaginationOptions | undefined,
  key: keyof LayoutPaginationPerPanel,
): number {
  const ps = pagination?.pageSize
  if (ps === undefined || ps === null) return 10
  if (typeof ps === 'number') return ps
  return (ps[key] as number | undefined) ?? ps.default ?? 10
}

export function resolveSlotList<T extends { name: string; order: number }>(
  builtin: T[],
  config?: SlotConfig<Partial<T> & { name: string }>,
): T[] {
  const hidden = new Set(config?.hidden ?? [])
  const orderOverride = config?.order ?? {}

  const merged: T[] = builtin
    .filter((item) => !hidden.has(item.name))
    .map((item) => ({
      ...item,
      order: orderOverride[item.name] ?? item.order,
    }))

  for (const custom of config?.custom ?? []) {
    const resolvedOrder = orderOverride[custom.name] ?? custom.order ?? CUSTOM_DEFAULT_ORDER
    merged.push({
      ...custom,
      order: resolvedOrder,
    } as unknown as T)
  }

  return merged
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.order - b.item.order || a.index - b.index)
    .map(({ item }) => item)
}

export function useLayoutOptions(): LayoutOptions {
  const opts = inject(LAYOUT_OPTIONS_KEY)
  if (!opts) {
    throw new Error('useLayoutOptions() must be used within a <layout> component tree')
  }
  return opts
}

export function useLayoutTheme(): LayoutThemeOptions {
  return useLayoutOptions().theme ?? {}
}

export const LAYOUT_API_KEY: InjectionKey<LayoutApiOptions | undefined> = Symbol('layoutApi')

export function useLayoutApis(): LayoutApiOptions {
  const apis = inject(LAYOUT_API_KEY)
  if (!apis) {
    throw new Error('useLayoutApis() must be used within a <layout> component tree')
  }
  return apis
}
