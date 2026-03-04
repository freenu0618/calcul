import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 프리렌더링 HTML은 Googlebot(JS 미실행)용으로만 존재
// 실제 사용자는 항상 createRoot로 풀 렌더링
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
