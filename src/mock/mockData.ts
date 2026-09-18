import type { FontInfo } from '../LeaferEditor/core/interfaces'

import fontsJson from './mockData/fonts.json'
import templateJson from './mockData/templateData.json'
import materialJson from './mockData/materialData.json'
import imageJson from './mockData/imageData.json'

export const mockFontsList: FontInfo[] = fontsJson.list.map((f: any) => ({
  code: f.code,
  name: f.name,
  preview: f.preview,
  variants: f.variants || [],
}))

export const mockFontsData = {
  list: mockFontsList,
  total: mockFontsList.length,
}

export const mockMyFontsList: FontInfo[] = mockFontsList.slice(0, 2)

export const mockMyFontsData = {
  list: mockMyFontsList,
  total: mockMyFontsList.length,
}

export const mockTemplatesData: any[] = templateJson.list

export const mockImageMaterialsData: any[] = imageJson.list

export const mockMaterialsData: any[] = materialJson.list
