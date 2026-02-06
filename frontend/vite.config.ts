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
        manualChunks: {
          // PDF 라이브러리를 별도 청크로 분리 (Dynamic Import 최적화)
          'pdf-libs': ['jspdf', 'html2canvas'],
          // React 코어 라이브러리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 대형 차트 라이브러리
          'chart-libs': ['recharts'],
        },
      },
    },
    // 청크 크기 경고 임계값 증가 (500KB → 1MB)
    chunkSizeWarningLimit: 1000,
  },
})
