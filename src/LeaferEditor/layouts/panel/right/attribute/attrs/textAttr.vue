<script setup lang="ts">
import Panel from './panel.vue'
// import FontFaceObserver from 'fontfaceobserver'
import TipContentKey from "../../../../components/tooltip";
import SwipeNumber from '../../../../components/swipeNumber.vue';
import { useLeaferEditor } from '../../../../editorContext';
import { selectedProxyData } from '../../../../selectedProxyData';
import { Message } from '@arco-design/web-vue';
import FontFaceObserver from 'fontfaceobserver'
import { reactive, ref, watch, watchEffect, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLayoutOptions } from '../../../../layoutOptions';

const { t } = useI18n();

const editor = useLeaferEditor()
const fontOptions = ref([...editor.font.fontList])

const handleFontListChanged = () => {
    fontOptions.value = [...editor.font.fontList]
}

onMounted(() => {
    editor.eventBus.onExternal('fontListChanged', handleFontListChanged)
})

onUnmounted(() => {
    editor.eventBus.offExternal('fontListChanged', handleFontListChanged)
})

const opts = useLayoutOptions()
const fontOpts = opts.font!

const weightOptions = computed(() => [
    {
        value: 'thin',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.thin'),
    },
    {
        value: 'extra-light',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.extraLight'),
    },
    {
        value: 'light',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.light'),
    },
    {
        value: 'normal',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.normal'),
    },
    {
        value: 'medium',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.medium'),
    },
    {
        value: 'semi-bold',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.semiBold'),
    },
    {
        value: 'bold',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.bold'),
    },
    {
        value: 'extra-bold',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.extraBold'),
    },
    {
        value: 'black',
        label: t('leaferEditorLayouts.panelRight.attribute.text.weight.black'),
    },
])

const sizeOptions = reactive(
    fontOpts.sizePresets!.map((size) => {
        return {
            value: size,
            label: size.toString(),
        }
    }),
)
const textWrapOptions = computed(() => [
    {
        value: 'normal',
        label: t('leaferEditorLayouts.panelRight.attribute.text.properties.textWrap.normal'),
    },
    {
        value: 'none',
        label: t('leaferEditorLayouts.panelRight.attribute.text.properties.textWrap.none'),
    },
    {
        value: 'break',
        label: t('leaferEditorLayouts.panelRight.attribute.text.properties.textWrap.break'),
    },
]
)

const fontFamily = selectedProxyData(editor, 'fontFamily', undefined, true)
const resizeFontSize = selectedProxyData(editor, 'resizeFontSize', undefined, true)
// const placeholder = selectedProxyData(editor, 'placeholder', undefined, true)
const fontSize = selectedProxyData(editor, 'fontSize') // 字号
const textWrap = selectedProxyData(editor, 'textWrap', undefined, true) // 文本换行规则
const lineHeight = selectedProxyData(editor, 'lineHeight') // 行号
const letterSpacing = selectedProxyData(editor, 'letterSpacing') // 字距
const textAlign = selectedProxyData(editor, 'textAlign', undefined, true)
const verticalAlign = selectedProxyData(editor, 'verticalAlign', undefined, true)
const italic = selectedProxyData(editor, 'italic', undefined, true) // 文字是否倾斜
const textDecoration = selectedProxyData(editor, 'textDecoration', undefined, true)
const textOverflow = selectedProxyData(editor, 'textOverflow', undefined, true)
const textValue = selectedProxyData(editor, 'text', undefined, true)
const padding = selectedProxyData(editor, 'padding', [0, 0, 0, 0])
// 文字粗细
const fontWeight = selectedProxyData(editor, 'fontWeight', undefined, true)

const textStyle = ref()

const textOverflowType = ref('show')
const textOverflowVal = ref('')
watchEffect(() => {
    if (['show', 'hide'].includes(<string>textOverflow.value.modelValue)) {
        textOverflowType.value = <string>textOverflow.value.modelValue
    } else if (!textOverflow.value.modelValue) {
        textOverflowType.value = 'show'
    } else {
        textOverflowType.value = 'custom'
    }
    textOverflowVal.value = <string>textOverflow.value.modelValue
})
const changeTextOverflow = (val: string) => {
    if (['show', 'hide'].includes(val)) {
        textOverflow.value.onChange(val)
    } else {
        if (['show', 'hide'].includes(textOverflowVal.value) || !textOverflowVal.value) {
            textOverflowVal.value = '...'
        }
        textOverflow.value.onChange(textOverflowVal.value)
    }
}
const inputTextOverflowVal = (val: string) => {
    textOverflow.value.onChange(val)
}
const newTextVal = ref(textValue.value.modelValue)
watch(newTextVal, (newValue, oldValue) => {
    textValue.value.onChange(newTextVal.value)
})
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
})

const paddingTop = ref()
const paddingRight = ref()
const paddingBottom = ref()
const paddingLeft = ref()
const lineHeightVal = ref()
const letterSpacingVal = ref()
watchEffect(() => {
    if (padding.value.modelValue) {
        paddingTop.value = padding.value.modelValue[0]
        paddingRight.value = padding.value.modelValue[1]
        paddingBottom.value = padding.value.modelValue[2]
        paddingLeft.value = padding.value.modelValue[3]
    }
})

watchEffect(() => {
    lineHeightVal.value = lineHeight.value.modelValue.value
})


watchEffect(() => {
    letterSpacingVal.value = letterSpacing.value.modelValue.value
})

watch([paddingTop, paddingRight, paddingBottom, paddingLeft], (newValue, oldValue) => {
    padding.value.onChange([paddingTop.value, paddingRight.value, paddingBottom.value, paddingLeft.value,])
})


watch(lineHeightVal, (newValue, oldValue) => {
    lineHeight.value.onChange({
        type: lineHeight.value.modelValue.type,
        value: Number(newValue)
    })
})
watch(letterSpacingVal, (newValue, oldValue) => {
    letterSpacing.value.onChange({
        type: lineHeight.value.modelValue.type,
        value: Number(newValue)
    })
})


const changeFontFamily = (record: any) => {
    console.log(record);
    const fontFamilyName = record
    if (editor.font.defaultFonts.some((item) => item.name === fontFamilyName)) {
        // fontFamily.value.onChange(fontFamilyName)
        return;
    }
    // 字体加载
    const loading = Message.loading({
        content: t('leaferEditorLayouts.panelRight.attribute.text.font.loading', { fontName: fontFamilyName }),
        duration: 0
    })
    const span = document.createElement('span')
    span.style.fontFamily = fontFamilyName
    span.style.display = 'none'
    document.body.appendChild(span)
    const font = new FontFaceObserver(fontFamilyName);
    font
        .load(null, fontOpts.loadTimeout)
        .then(() => {
            loading.close()
            console.log(t('leaferEditorLayouts.panelRight.attribute.text.font.loadSuccess'));
            fontFamily.value.onChange('')
            fontFamily.value.onChange(fontFamilyName)
            fontFamily.value.onEnd()
            span.remove()
        })
        .catch((err) => {
            console.warn(err);
            loading.close()
            Message.error({ content: t('leaferEditorLayouts.panelRight.attribute.text.font.loadFailed', { fontName: fontFamilyName, error: err }) })
            span.remove()
        });
}

const newResizeFontSize = ref(resizeFontSize.value.modelValue)
</script>

<template>
    <div>
        <Panel :title="t('leaferEditorLayouts.panelRight.attribute.text.content.title')" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea v-model="newTextVal"
                        :placeholder="t('leaferEditorLayouts.panelRight.attribute.text.content.placeholder')"
                        :auto-size="{
                            minRows: 4,
                        }" />
                </a-col>
            </a-row>
        </Panel>
        <Panel :title="t('leaferEditorLayouts.panelRight.attribute.text.properties.title')" hidden-add>
            <a-space direction="vertical" size="mini">
                <a-row :gutter="[4, 4]">
                    <a-col :span="20">
                        <a-checkbox v-model="newResizeFontSize" @change="() => {
                            resizeFontSize.onChange(!resizeFontSize.modelValue)
                            newResizeFontSize = resizeFontSize.modelValue
                        }">{{ t('leaferEditorLayouts.panelRight.attribute.text.properties.resizeFontSize')
                        }}</a-checkbox>
                    </a-col>
                </a-row>
                <a-row :gutter="[4, 4]">
                    <a-col>
                        <a-select size="small"
                            :placeholder="t('leaferEditorLayouts.panelRight.attribute.text.properties.fontFamily.placeholder')"
                            v-bind="{ ...fontFamily }" :options="fontOptions" @change="changeFontFamily" allow-search
                            :field-names="{
                                label: 'name',
                                value: 'name',
                            }">
                            <template #prefix>
                                {{ t('leaferEditorLayouts.panelRight.attribute.text.properties.fontFamily.prefix') }}
                            </template>
                            <template #option="{ data }">
                                <div class="font-preview-cls" v-if="data.preview"
                                    :style="{ backgroundImage: `url(${data.preview})`, color: '#333' }"></div>
                                <div class="font-preview-cls" v-else>
                                    <span>{{ (typeof data === 'object' ? data.name : data) }}</span>
                                </div>
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <a-select size="small"
                            :placeholder="t('leaferEditorLayouts.panelRight.attribute.text.properties.fontWeight.placeholder')"
                            allow-create v-bind="{ ...fontWeight }" :options="weightOptions">
                            <template #prefix>
                                {{ t('leaferEditorLayouts.panelRight.attribute.text.properties.fontWeight.prefix') }}
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="fontSize" :step=".1" :min="1" style="padding: 0 6px"
                            label-class="text-left" label-width="36px">
                            <template #label>
                                <div>{{ t('leaferEditorLayouts.panelRight.attribute.text.properties.fontSize') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="lineHeightVal" :step=".1" :min="0" style="padding: 0 6px"
                            label-class="text-left" label-width="36px" @end="() => {
                                lineHeight.onEnd()
                            }">
                            <template #label>
                                <div>{{ t('leaferEditorLayouts.panelRight.attribute.text.properties.lineHeight') }}
                                </div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="letterSpacingVal" :step=".05" style="padding: 0 6px"
                            label-class="text-left" label-width="36px" @end="() => {
                                letterSpacing.onEnd()
                            }">
                            <template #label>
                                <div>{{ t('leaferEditorLayouts.panelRight.attribute.text.properties.letterSpacing') }}
                                </div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col>
                        <a-select size="small"
                            :placeholder="t('leaferEditorLayouts.panelRight.attribute.text.properties.textWrap.placeholder')"
                            v-bind="textWrap" :options="textWrapOptions">
                            <template #prefix>
                                {{ t('leaferEditorLayouts.panelRight.attribute.text.properties.textWrap.prefix') }}
                            </template>
                        </a-select>
                    </a-col>
                </a-row>
                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-tooltip mini position="br">
                            <a-button class="button italic-btn" size="small"
                                :type="italic.modelValue ? 'text' : undefined"
                                @click="italic.onChange(!italic.modelValue)">
                                <template #icon>
                                    <icon-italic :class="italic.modelValue ? 'arco-icon-check' : ''" />
                                </template>
                            </a-button>
                            <template #content>
                                <TipContentKey
                                    :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.italic')" />
                            </template>
                        </a-tooltip>
                    </a-col>
                    <a-col :span="24">
                        <a-radio-group type="button" size="small" v-bind="textDecoration">
                            <a-tooltip mini position="br">
                                <a-radio value="none">
                                    <icon-stop />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textDecoration.none')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="under">
                                    <icon-underline />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textDecoration.underline')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="delete">
                                    <icon-strikethrough />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textDecoration.strikethrough')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="under-delete">
                                    <icon-select-all />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textDecoration.both')" />
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="24">
                        <a-radio-group type="button" size="small" v-bind="textAlign">
                            <a-tooltip mini position="br">
                                <a-radio value="left">
                                    <icon-align-left />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textAlign.left')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="center">
                                    <icon-align-center />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textAlign.center')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="right">
                                    <icon-align-right />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textAlign.right')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="justify">
                                    <icon-menu />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.textAlign.justify')" />
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="12">
                        <a-radio-group type="button" size="small" v-bind="verticalAlign">
                            <a-tooltip mini position="br">
                                <a-radio value="top">
                                    <icon-align-left :rotate="90" />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.verticalAlign.top')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="middle">
                                    <icon-menu :rotate="90" />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.verticalAlign.middle')" />
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="br">
                                <a-radio value="bottom">
                                    <icon-align-right :rotate="90" />
                                </a-radio>
                                <template #content>
                                    <TipContentKey
                                        :content="t('leaferEditorLayouts.panelRight.attribute.text.properties.verticalAlign.bottom')" />
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>

                </a-row>

                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-radio-group type="button" size="small" v-model="textOverflowType"
                            @change="(val) => changeTextOverflow(val as string)">
                            <a-radio value="show">
                                {{ t('leaferEditorLayouts.panelRight.attribute.text.properties.textOverflow.show') }}
                            </a-radio>
                            <a-radio value="hide">
                                {{ t('leaferEditorLayouts.panelRight.attribute.text.properties.textOverflow.hide') }}
                            </a-radio>
                            <a-radio value="custom">
                                <span>{{
                                    t('leaferEditorLayouts.panelRight.attribute.text.properties.textOverflow.custom')
                                }}</span>
                                <a-popover
                                    :title="t('leaferEditorLayouts.panelRight.attribute.text.properties.textOverflow.popoverTitle')"
                                    trigger="click" position="lt">
                                    <icon-settings class="color-text-1" />
                                    <template #content>
                                        <a-input v-model="textOverflowVal" @input="inputTextOverflowVal"></a-input>
                                    </template>
                                </a-popover>
                            </a-radio>
                        </a-radio-group>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
        <Panel :title="t('leaferEditorLayouts.panelRight.attribute.text.padding.title')" hidden-add>
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="12">
                    <SwipeNumber size="small" v-model="paddingTop" @end="padding.onEnd">
                        <template #label>
                            <icon-to-top />
                        </template>
                    </SwipeNumber>
                </a-col>
                <a-col :span="12">
                    <SwipeNumber size="small" label="Y" v-model="paddingRight" @end="padding.onEnd">
                        <template #label>
                            <icon-to-right />
                        </template>
                    </SwipeNumber>
                </a-col>
            </a-row>
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="12">
                    <SwipeNumber size="small" label="Y" v-model="paddingBottom" @end="padding.onEnd">
                        <template #label>
                            <icon-to-bottom />
                        </template>
                    </SwipeNumber>
                </a-col>
                <a-col :span="12">
                    <SwipeNumber size="small" label="Y" v-model="paddingLeft" @end="padding.onEnd">
                        <template #label>
                            <icon-to-left />
                        </template>
                    </SwipeNumber>
                </a-col>
            </a-row>
        </Panel>
    </div>
</template>

<style scoped lang="less">
.font-preview-cls {
    //background-color: #000;
    background-size: cover;
    background-position: center center;
    height: 40px;
    width: 200px;
    color: #000000;
    //font-size: 27px;
    text-align: center;
    // -webkit-filter: invert(100%);
    // filter: invert(100%);
}

:deep(.arco-radio-button-content) {
    padding: 0 10px;
}

.italic-btn {
    background-color: var(--color-fill-2);
}

.italic-btn:hover {
    background-color: rgb(242 243 245 / 60%);
}
</style>
