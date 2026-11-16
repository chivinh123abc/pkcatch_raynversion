import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const localPage = (name: string) => fileURLToPath(new URL(name, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: { ignored: ['**/docs/**', '**/test-results/**', '**/scratch/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main: localPage('./index.html'),
        reactClone: localPage('./react.html'),
      },
    },
  },
})
