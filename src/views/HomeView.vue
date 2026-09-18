<template>
    <LeaferEditorLayout ref="layoutRef" :editorOptions="editorOptions" :sloganName="sloganName" logoUrl="/logo.png"
        :apis="apis" :options="options" />
</template>

<script setup lang="ts">
import type { LayoutOptions, LayoutApiOptions } from "../LeaferEditor/layouts/layoutOptions";
import type { EditorLayoutOptions } from "../LeaferEditor/layouts/layout.vue"
import type { IUI } from "@leafer-ui/interface";
import { ImageSourceTag } from "../LeaferEditor"
import LeaferEditorLayout from "../LeaferEditor/layouts/layout.vue"
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue';
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from "vue-i18n";
import { DEFAULT_API } from '../mock'
import githubBtn from "./actions/githubBtn.vue";

const i18n = useI18n();
const { t } = i18n;
const apis: LayoutApiOptions = DEFAULT_API
const sloganName = computed(() => t('sloganName'))
const layoutRef = ref<InstanceType<typeof LeaferEditorLayout>>()

const editorOptions: EditorLayoutOptions = {
    canvas: {
        width: 1000,
        height: 1000,
        fill: "#f5f7fd",
        zoomMode: "mouse",
        lockRatio: "corner",
    },
    history: { maxSize: 64 },
    page: { changePageZoomFit: true },
    ruler: {
        dpi: 96,
        gridLine: { strokeDragColor: "#ff0800ff" },
    },
    shortcut: {
        global: true,
    },
    image: {
        fileTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 10 * 1024 * 1024,
        uploadCallback: async (file: File, sourceTag: ImageSourceTag, image?: IUI) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log("uploading", file, sourceTag, image);
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.onload = () => {
                        const width = img.naturalWidth;
                        const height = img.naturalHeight;
                        resolve({ url, width, height });
                    };
                    img.onerror = reject;
                    img.src = url;
                }, 200);  // 模拟上传延迟
            })
        },
    },
    font: {
        onFontsNotFound(missingFontNames) {
            console.log("missing fonts:", missingFontNames);
            Message.error("Missing fonts: " + missingFontNames.join(", "));
            return Promise.resolve(missingFontNames.map(name => {
                return {
                    code: name,
                    name: name,
                    variants: [{
                        url: "./fonts/贤二体/贤二体.ttf",
                        format: 'ttf',
                    }],
                }
            }));
        },
    }
}

const options: LayoutOptions = {
    export: {
        // showDownloadImage: false,
        showCurrentPageJSON: false,
        preview: {
            format: 'jpg',
        },
        // onSave(editor) {
        //     console.log(editor);
        // },
    },
    headerActions: [
        githubBtn
    ],
    slots: {
        leftPanel: {
            custom: [
            ],
            hidden: [
                // "material"
            ]
        },
        toolBar: {
            custom: [
                {
                    name: 'zoom',
                    iconClass: 'i-svg:rectangle',
                    content: 'zoom',
                    onClick: (editor) => {
                        editor.zoom(1)
                    },
                    disabled: () => {
                        return false; // 禁用按钮
                    }
                }
            ]
        }
    },
    headerLeft: {
        // filePopover: false,
        // undoRedo: false,
        // rulerUnit: false,
        // gridlines: false,
        // snap: false,
        // mode: false,
        // copy: false,
        // zoom: false,
    },
    isShowFooterBar: false,
    isShowPageText: true,
    // isShowFooterPageViewThumbnail: false,
}

const hasUnsavedChanges = ref(true)

const unsaved = () => {
    hasUnsavedChanges.value = true
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (hasUnsavedChanges.value) {
        e.preventDefault()
        e.returnValue = ''
    }
}

onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    const editor = layoutRef.value?.editor
    if (editor) {
        editor.eventBus.on(editor.Events.undoRedoStackChange, unsaved)
    }
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    const editor = layoutRef.value?.editor
    if (editor) {
        editor.eventBus.off(editor.Events.undoRedoStackChange, unsaved)
    }
})

onBeforeRouteLeave((to, from, next) => {
    if (!hasUnsavedChanges.value) {
        next()
        return
    }
    const answer = window.confirm('您有未保存的更改，确定要离开吗？')
    if (answer) {
        next()
    } else {
        next(false)
    }
})
</script>
