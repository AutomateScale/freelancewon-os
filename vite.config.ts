import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // "npm run server" in a second terminal handles /api (Upwork sign-in, MCP, AI drafts)
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
