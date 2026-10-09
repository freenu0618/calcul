import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true, // 포트 사용 중이면 실패
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 공용 preload 런타임 때문에 PDF 청크가 초기 로드되지 않도록 분리합니다.
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vite-runtime';
          if (id.includes('/node_modules/')) {
            if (/\/(jspdf|html2canvas)\//.test(id)) return 'pdf-libs';
            if (/\/(react|react-dom|react-router-dom)\//.test(id)) return 'react-vendor';
            if (id.includes('/recharts/')) return 'chart-libs';
          }
        },
      },
    },
    // 청크 크기 경고 임계값 증가 (500KB → 1MB)
    chunkSizeWarningLimit: 1000,
  },
})
