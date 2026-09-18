import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n', '@vueuse/core'],
          'arco-ui': ['@arco-design/web-vue'],
          'leafer': ['leafer-ui', '@leafer-in/editor', '@leafer-in/viewport', '@leafer-in/view', '@leafer-in/export', '@leafer-in/text-editor', '@leafer-in/find', '@leafer-in/state', '@leafer-in/arrow'],
          'utils': ['lodash', 'axios', 'jszip', 'qrcode', 'jsbarcode', 'uuid', 'mousetrap', 'fontfaceobserver', 'ag-psd'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,

    minify: 'terser', // 使用 terser
    terserOptions: {
      compress: {
        // drop_console: true,   // 移除 console
        drop_debugger: true,
        pure_funcs: ['console.log'], // 移除特定函数调用
      },
      mangle: {
        toplevel: true,        // 混淆顶层变量名
      },
    },
  },
  base: './',
})