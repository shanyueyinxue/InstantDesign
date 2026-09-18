import type { PageParams } from '../LeaferEditor/layouts/types/page'
import type { Response } from '../LeaferEditor/layouts/types/response'
import type { FontInfo } from '../LeaferEditor/core/managers/FontManager'
import type {
  LayoutApiOptions,
  FontListData,
  CategoryItem,
  CategoryListData
} from '../LeaferEditor/layouts/layoutOptions'
import {
  mockFontsData,
  mockMyFontsList,
  mockMyFontsData,
  mockTemplatesData,
  mockImageMaterialsData,
  mockMaterialsData,
} from './mockData'

const mockCategories: CategoryItem[] = [
  { label: '全部', value: 'all' },
  { label: '风景图片', value: '风景图片' },
  { label: '插画图片', value: '插画图片' },
]

export const DEFAULT_API: LayoutApiOptions = {
  queryFontList(params: PageParams): Promise<Response<FontListData>> {
    console.warn('[LayoutApi] queryFontList using default mock, provide a real implementation via options.apis')
    const { pageNum, pageSize } = params
    const start = (pageNum - 1) * pageSize
    return Promise.resolve({
      code: 200,
      msg: 'ok',
      data: { list: mockFontsData.list.slice(start, start + pageSize), total: mockFontsData.total },
    })
  },
  queryMyFontList(params: PageParams): Promise<Response<FontListData>> {
    console.warn('[LayoutApi] queryMyFontList using default mock, provide a real implementation via options.apis')
    const { pageNum, pageSize } = params
    const start = (pageNum - 1) * pageSize
    return Promise.resolve({
      code: 200,
      msg: 'ok',
      data: { list: mockMyFontsList.slice(start, start + pageSize), total: mockMyFontsData.total },
    })
  },
  uploadFont(file: File): Promise<Response<FontInfo>> {
    console.warn('[LayoutApi] uploadFont using default mock, provide a real implementation via options.apis')
    return Promise.resolve({
      code: 200,
      msg: 'ok',
      data: {
        code: file.name.replace(/\.[^.]+$/, ''),
        name: file.name.replace(/\.[^.]+$/, ''),
        variants: [{ url: URL.createObjectURL(new Blob([file], { type: file.type })), format: 'ttf' }],
      },
    })
  },
  queryTemplateList(params: PageParams & { category?: string; keyword?: string }): Promise<Response<any>> {
    console.warn('[LayoutApi] queryTemplateList using default mock, provide a real implementation via options.apis')
    const { pageNum, pageSize, category, keyword } = params
    console.log(`queryTemplateList category: ${category} keyword: ${keyword} pageNum: ${pageNum} pageSize: ${pageSize}`)
    const start = (pageNum - 1) * pageSize
    const list = mockTemplatesData.slice(start, start + pageSize)
    return Promise.resolve({ code: 200, msg: 'ok', data: { list, total: mockTemplatesData.length } })
  },
  queryTemplateCategories(): Promise<Response<CategoryListData>> {
    console.warn('[LayoutApi] queryTemplateCategories using default mock, provide a real implementation via options.apis')
    return Promise.resolve({ code: 200, msg: 'ok', data: { list: mockCategories, total: mockCategories.length } })
  },
  queryImageMaterialList(params: PageParams & { category?: string; keyword?: string }): Promise<Response<any>> {
    console.warn('[LayoutApi] queryImageMaterialList using default mock, provide a real implementation via options.apis')
    const { pageNum, pageSize, category, keyword } = params
    console.log(`queryImageMaterialList category: ${category} keyword: ${keyword} pageNum: ${pageNum} pageSize: ${pageSize}`)
    const start = (pageNum - 1) * pageSize
    const list = mockImageMaterialsData.slice(start, start + pageSize)
    return Promise.resolve({ code: 200, msg: 'ok', data: { list, total: mockImageMaterialsData.length } })
  },
  queryImageCategories(): Promise<Response<CategoryListData>> {
    console.warn('[LayoutApi] queryImageCategories using default mock, provide a real implementation via options.apis')
    return Promise.resolve({ code: 200, msg: 'ok', data: { list: mockCategories, total: mockCategories.length } })
  },
  queryMaterialList(params?: PageParams & { category?: string; keyword?: string }): Promise<Response<any>> {
    console.warn('[LayoutApi] queryMaterialList using default mock, provide a real implementation via options.apis')
    const { pageNum = 1, pageSize = 20, category, keyword } = params ?? {}
    console.log(`queryMaterialList category: ${category} keyword: ${keyword} pageNum: ${pageNum} pageSize: ${pageSize}`)
    const start = (pageNum - 1) * pageSize
    const list = mockMaterialsData.slice(start, start + pageSize)
    return Promise.resolve({ code: 200, msg: 'ok', data: { list, total: mockMaterialsData.length } })
  },
  queryMaterialCategories(): Promise<Response<CategoryListData>> {
    console.warn('[LayoutApi] queryMaterialCategories using default mock, provide a real implementation via options.apis')
    return Promise.resolve({ code: 200, msg: 'ok', data: { list: mockCategories, total: mockCategories.length } })
  },
  uploadMaterial(_req: any): Promise<Response<Record<string, never>>> {
    console.warn('[LayoutApi] uploadMaterial using default mock, provide a real implementation via options.apis')
    return Promise.resolve({ code: 200, msg: 'ok', data: {} })
  },
}
