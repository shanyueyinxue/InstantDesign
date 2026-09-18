import i18next from 'i18next'

import zh from './locales/zh-CN.json'
import en from './locales/en-US.json'

const instance = i18next.createInstance()

type LocaleJSON = typeof zh

instance.init({
    lng: 'zh-CN',
    fallbackLng: 'zh-CN',
    resources: {
        'zh-CN': { translation: zh },
        'en-US': { translation: en },
    },
})

export const t = (key: string, options?: Record<string, any>): string => {
    return instance.t(key, options)
}

export const setLocale = (locale: string) => {
    instance.changeLanguage(locale)
}

export const getLocale = (): string => {
    return instance.language
}

export const addResources = (locale: string, resources: LocaleJSON) => {
    instance.addResourceBundle(locale, 'translation', resources, true, true)
}
