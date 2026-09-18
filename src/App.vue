<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { arcolocale, localeType } from './i18n';

// editor i18n
import { setLocale, addResources } from './LeaferEditor';
import ja from "./locales/ja-JP.json"
import { ja_JP } from "./i18n/consts"
const i18n = useI18n();

i18n.mergeLocaleMessage(ja_JP, ja)
addResources("ja-JP", {
  leaferEditorPlugins: {
    copy: "コピー",
    cut: "カット",
    paste: "ペースト",
    pasteToCurrentPosition: "現在位置に貼り付け",

    selectAll: "すべて選択",

    zoom: {
      management: "ズーム管理",
      out: "ズームアウト",
      in: "ズームイン",
      fit: "キャンバスに合わせる",
      oneHundred: "100%表示"
    },

    grid: {
      showOrHide: "グリッドの表示/非表示"
    },

    zIndex: {
      adjustment: "階層調整",
      up: "1つ上へ",
      down: "1つ下へ",
      top: "最前面へ",
      bottom: "最背面へ"
    },

    add: {
      title: "追加",
      image: "画像を追加",
      text: "テキストを追加",
      rect: {
        title: "長方形",
        rect: "長方形",
        round: "角丸長方形"
      },
      polygon: {
        title: "多角形",
        triangle: "三角形",
        pentagon: "五角形",
        roundedPentagon: "角丸六角形"
      },
      star: {
        title: "星形",
        threeStar: "三角星",
        pentagram: "五芒星",
        roundedStar: "角丸星形"
      },
      ellipse: {
        title: "円形",
        circle: "円形",
        ring: "円環",
        sector: "扇形",
        ellipse: "楕円"
      }
    },

    operate: {
      title: "操作",
      fitToCanvas: "キャンバスサイズに縮小",
      lock: "ロック",
      unlock: "ロック解除",
      rename: "名前変更"
    },

    group: "グループ化",
    ungroup: "グループ解除",
    remove: "削除",

    exportPng: "PNGをエクスポート",
    delete: "削除",
    toTop: "最前面へ",
    toBottom: "最背面へ"
  }
})

// const localeType = ref("zh-CN");
watch(localeType, (newVal) => {
  i18n.locale.value = newVal;
  setLocale(newVal);
  console.log("localeType changed to", newVal);
});

// // TEST: change localeType
// localeType.value = "en-US";
// setTimeout(() => {
//   localeType.value = "zh-CN";
// }, 10000);

</script>

<template>
  <a-config-provider :locale="arcolocale">
    <RouterView />
  </a-config-provider>
</template>

<style scoped></style>
