import type { LeaferEditor } from "../editor"

import alibabaBold from '../fonts/阿里巴巴普惠体/Alibaba-PuHuiTi-Bold.ttf'
import alibabaHeavy from '../fonts/阿里巴巴普惠体/Alibaba-PuHuiTi-Heavy.ttf'
import alibabaLight from '../fonts/阿里巴巴普惠体/Alibaba-PuHuiTi-Light.ttf'
import alibabaMedium from '../fonts/阿里巴巴普惠体/Alibaba-PuHuiTi-Medium.ttf'
import alibabaRegular from '../fonts/阿里巴巴普惠体/Alibaba-PuHuiTi-Regular.ttf'

const FONT_CSS_TAG = "data-fonts"

const CSS_STRING_ESCAPE_RE = /["\\\x00-\x1f\x7f]/g;

function escapeCSS(str: string): string {
    return str.replace(CSS_STRING_ESCAPE_RE, (char) => {
        // 特殊处理换行符等常见字符
        switch (char) {
            case '\n': return '\\A ';
            case '\r': return '\\D ';
            case '\t': return '\\9 ';
            case '"':  return '\\"';
            case '\\': return '\\\\';
            default:   return '\\' + char.charCodeAt(0).toString(16) + ' ';
        }
    });
}

function resolveFormat(format: string): string {
    switch (format) {
        case 'ttf': return 'truetype'
        case 'otf': return 'opentype'
        case 'svg': return 'svg'
        default: return format
    }
}

export interface FontVariant {
    url: string
    format: string
    weight?: number
    style?: string
}

export interface FontInfo {
    code: string
    name: string
    preview?: string
    variants: FontVariant[]
}

function buildFontFace(name: string, variants: FontVariant[]): string {
    const escapedName = escapeCSS(name)
    return variants.map(v => {
        let rule = `@font-face {\n`
        rule += `  font-family: "${escapedName}";\n`
        rule += `  src: local("${escapedName}"), url("${escapeCSS(v.url)}") format("${resolveFormat(v.format)}");`
        if (v.weight != null) {
            rule += `\n  font-weight: ${v.weight};`
        }
        if (v.style) {
            rule += `\n  font-style: ${v.style};`
        }
        rule += `\n}`
        return rule
    }).join('\n')
}

const DEFAULT_FONTS: FontInfo[] = [
    {
        code: 'Alibaba-PuHuiTi',
        name: '阿里巴巴普惠体',
        variants: [
            { url: alibabaLight,  format: 'ttf', weight: 300 },
            { url: alibabaRegular, format: 'ttf', weight: 400 },
            { url: alibabaMedium,  format: 'ttf', weight: 500 },
            { url: alibabaBold,    format: 'ttf', weight: 700 },
            { url: alibabaHeavy,   format: 'ttf', weight: 900 },
        ],
    },
]

export class FontManager {
    private _editor: LeaferEditor
    private _fontList: FontInfo[] = [...DEFAULT_FONTS]
    private _styleTags: HTMLStyleElement[] = []

    constructor(editor: LeaferEditor) {
        this._editor = editor
        this._registerDefaultFonts()
    }

    get fontList(): FontInfo[] {
        return this._fontList
    }

    get defaultFonts(): FontInfo[] {
        return [...DEFAULT_FONTS]
    }

    addCustomFonts(fonts: FontInfo[]): FontInfo[] {
        const seen = new Set(this._fontList.map(f => f.code))
        fonts = fonts.filter(f => {
            if (seen.has(f.code)) return false
            if (this._fontList.some(e => e.name === f.name)) return false
            seen.add(f.code)
            return true
        })
        if (fonts.length === 0) {
            return this._fontList
        }

        const styleTag = document.createElement('style')
        styleTag.setAttribute(FONT_CSS_TAG, 'true')
        const rules = fonts.map(f => buildFontFace(f.name, f.variants))
        styleTag.textContent = rules.join('\n')
        document.head.appendChild(styleTag)
        this._styleTags.push(styleTag)

        this._fontList.push(...fonts)
        return this._fontList
    }

    collectFontsFromJSON(json: object): Set<string> {
        const families = new Set<string>()
        const depth = new WeakSet<object>()
        let remainingDepth = 500

        const walk = (node: any): void => {
            if (!node || typeof node !== 'object') return
            if (depth.has(node)) return
            depth.add(node)
            if (--remainingDepth <= 0) return

            if (typeof node.fontFamily === 'string' && node.fontFamily) {
                families.add(node.fontFamily)
            }
            if (typeof node.font === 'string' && node.font) {
                families.add(node.font)
            }

            for (const key in node) {
                if (!Object.prototype.hasOwnProperty.call(node, key)) continue
                const val = node[key]
                if (val && typeof val === 'object') {
                    walk(val)
                }
            }
        }
        walk(json)
        return families
    }

    async resolveMissingFonts(json: object): Promise<void> {
        const families = this.collectFontsFromJSON(json)
        const missing: string[] = []
        const resolved: FontInfo[] = []
        for (const name of families) {
            const info = this.findFontByName(name)
            if (info) {
                resolved.push(info)
            } else {
                missing.push(name)
            }
        }
        if (missing.length > 0) {
            const onFontsNotFound = this._editor.options.font?.onFontsNotFound
            if (onFontsNotFound) {
                try {
                    const userResolved = await Promise.race([
                        onFontsNotFound(missing),
                        new Promise<FontInfo[]>((_, reject) =>
                            setTimeout(() => reject(new Error('onFontsNotFound timeout')), 10000)
                        ),
                    ]) as FontInfo[]
                    if (userResolved && userResolved.length > 0) {
                        resolved.push(...userResolved)
                    }
                } catch (err) {
                    console.error('onFontsNotFound callback failed:', err)
                }
            } else {
                console.warn(`Missing fonts not registered: ${missing.join(', ')}`)
            }
        }
        if (resolved.length > 0) {
            this.addCustomFonts(resolved)
        }
        await this.waitForFonts(families)
    }

    async waitForFonts(families: Iterable<string>, timeout = 10000): Promise<void> {
        if (typeof document === 'undefined' || !document.fonts) return
        const tasks: Promise<unknown>[] = []
        for (const name of families) {
            const info = this.findFontByName(name)
            if (!info) continue
            const escapedName = escapeCSS(name)
            for (const v of info.variants) {
                const style = v.style ? `${v.style} ` : ''
                const weight = v.weight != null ? `${v.weight} ` : ''
                tasks.push(document.fonts.load(`${style}${weight}16px "${escapedName}"`))
            }
        }
        if (tasks.length === 0) return
        await Promise.race([
            Promise.allSettled(tasks),
            new Promise<void>((resolve) => setTimeout(resolve, timeout)),
        ])
    }

    hasFont(name: string): boolean {
        return this._fontList.some(f => f.name === name)
    }

    findFontByName(name: string): FontInfo | undefined {
        return this._fontList.find(f => f.name === name)
    }

    destroy(): void {
        this._styleTags.forEach(tag => {
            if (tag.parentNode) {
                tag.parentNode.removeChild(tag)
            }
        })
        this._styleTags = []
        this._fontList = []
    }

    private _registerDefaultFonts(): void {
        const fonts = DEFAULT_FONTS.filter(f => f.variants.length > 0)
        if (fonts.length === 0) return

        const styleTag = document.createElement('style')
        styleTag.setAttribute(FONT_CSS_TAG, 'true')
        const rules = fonts.map(f => buildFontFace(f.name, f.variants))
        styleTag.textContent = rules.join('\n')
        document.head.appendChild(styleTag)
        this._styleTags.push(styleTag)
    }
}
