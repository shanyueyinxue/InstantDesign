<template>
    <a-button href="https://gitee.com/antianshi/instant-design" target="_blank" type="text" class="!underline underline-offset-5 p-l-5px p-r-5px">
        <!-- <ali-icon type="icon-gitee" class="mr4px text-size-18px" /> -->
        Gitee
    </a-button>
    <a-button href="https://gitee.com/antianshi/instant-design" target="_blank" type="text" class="!underline underline-offset-5 p-l-5px p-r-5px">
        GitHub
    </a-button>
    <a-button @click="onClick" type="text" class="!underline underline-offset-5 p-l-5px p-r-5px">
        change locale {{ currentLang }}
    </a-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { localeType } from '../../i18n';
import { zh_CN, en_US, ja_JP } from '../../i18n/consts';
const locales = [
    zh_CN,
    en_US,
    ja_JP,
]
const langOptions: Record<string, string> = {
    [zh_CN]: '中文',
    [en_US]: 'English',
    [ja_JP]: '日本語',
};
const currentLang = computed(() => langOptions[localeType.value] || 'Unknown');

let n = 0
const onClick = () => {
    n = (n + 1) % locales.length;
    localeType.value = locales[n] || zh_CN;
};
</script>