import { resolve } from 'path'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'ScaleAdjust',
      fileName: 'scale-adjust',
    },
    copyPublicDir: false,
  },
  plugins: [cssInjectedByJsPlugin(), dts({ rollupTypes: true })],
})
