import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isNativeBuild = process.env.BUILD_TARGET === 'android'

  return {
    plugins: [react()],
    // FIX: APK precisa base './' (relativo), GitHub Pages precisa '/pagesgopay/'
    base: isNativeBuild ? './' : '/pagesgopay/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // FIX: não dividir chunks — WebView do Android tem problemas com code splitting
      rollupOptions: {
        output: {
          manualChunks: undefined,
          inlineDynamicImports: false,
        }
      }
    }
  }
})
