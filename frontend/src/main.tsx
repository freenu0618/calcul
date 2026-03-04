import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// 프리렌더링된 HTML이 있으면 hydrate, 없으면 새로 렌더
if (root.hasAttribute('data-prerendered')) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
