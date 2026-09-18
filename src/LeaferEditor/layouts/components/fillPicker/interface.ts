import { type InjectionKey, type Ref } from 'vue'

export const defaultValueKey = 'fillPicker__defaultValue'
export const labelsKey: InjectionKey<Ref<FillPickerLabels>> = Symbol('fillPicker__labels')

export interface ImageFillConfig {
    accept: string
    maxImageSize: number
    uploadPreviewSize: number
    handleUpload: (file: File) => any
    onSuccess: (data: any) => void
    onError: (error: Error) => void
    onDelete: () => void
}

export const IMAGE_FILL_KEY: InjectionKey<ImageFillConfig> = Symbol('fillPicker.imageFill')

export type GetDefaultFill = (type: fillTypes) => fillType

export type solidType = {
    type: 'solid'
    color: string
}

export type linearGradientType = {
    type: 'linear',
    stops: { offset: number, color: string }[],
    from: { x: number, y: number, type: 'percent' },
    to: { x: number, y: number, type: 'percent' },
}

export type radialGradientType = {
    type: 'radial',
    stops: { offset: number, color: string }[],
    from: { x: number, y: number, type: 'percent' },
    to: { x: number, y: number, type: 'percent' },
}
export type imageType = {
    type: 'image',
    mode: string,
    url: string,
    opacity: number,
}

export type fillTypes = 'solid' | 'linear' | 'radial' | 'image'

export type fillType = solidType | linearGradientType | radialGradientType | imageType

export const FACTORY_DEFAULTS: Record<fillTypes, fillType> = {
    solid: { type: 'solid', color: '#FFFFFF' },
    linear: {
        type: 'linear',
        stops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' },
        ],
        from: { x: 0, y: 0.5, type: 'percent' },
        to: { x: 1, y: 0.5, type: 'percent' },
    },
    radial: {
        type: 'radial',
        stops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' },
        ],
        from: { x: 0.5, y: 0.5, type: 'percent' },
        to: { x: 1, y: 1, type: 'percent' },
    },
    image: {
        type: 'image', mode: 'fit', url: '', opacity: 1,
    },
}

export interface FillPickerLabels {
    typeLabels: {
        solid: string
        linear: string
        radial: string
        image: string
    }
    fillTypeLabels: {
        linear: string
        radial: string
        image: string
    }
    degree: string
    imagePanel: {
        fillMode: string
        opacity: string
        modeOptions: {
            cover: string
            fit: string
            stretch: string
            clip: string
            repeat: string
        }
    }
}

export const DEFAULT_LABELS: FillPickerLabels = {
    typeLabels: {
        solid: '纯色',
        linear: '线性',
        radial: '径向',
        image: '图案',
    },
    fillTypeLabels: {
        linear: '线性渐变',
        radial: '径向渐变',
        image: '图案填充',
    },
    degree: '角度',
    imagePanel: {
        fillMode: '填充模式',
        opacity: '透明度',
        modeOptions: {
            cover: '覆盖',
            fit: '适应',
            stretch: '拉伸',
            clip: '裁剪',
            repeat: '平铺',
        },
    },
}
