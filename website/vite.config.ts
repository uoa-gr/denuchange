import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets GITHUB_ACTIONS=true; Vercel leaves it unset → base '/'
  base: process.env.GITHUB_ACTIONS ? '/denuchange/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
