import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // Backend usually expects /api prefix or not? 
        // Checking backend controller: @RequestMapping("/auth") and application.yml context-path: /api
        // application.yml has: context-path: /api
        // So backend expects /api/auth/login.
        // If frontend sends /api/auth/login, and we proxy /api -> localhost:8080, it becomes localhost:8080/api/auth/login.
        // Wait, if target is localhost:8080, do we keep /api?
        // If context-path is /api, then yes, we keep it.
        // Let's verify context path from application.yml view earlier: "context-path: /api" on line 4.
        // So yes, backend is at http://localhost:8080/api
        // If frontend requests /api/auth/login, proxy should send it to http://localhost:8080/api/auth/login.
        // So rewrite is NOT needed if we match /api.
      }
    }
  }
})
