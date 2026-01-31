/**
 * Cloudflare Pages SPA 지원을 위해 index.html을 404.html로 복사
 * 존재하지 않는 경로 접근 시 React Router가 처리할 수 있도록 함
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');
const notFoundPath = join(distDir, '404.html');

if (existsSync(indexPath)) {
  copyFileSync(indexPath, notFoundPath);
  console.log('✅ 404.html 생성 완료 (SPA fallback)');
} else {
  console.error('❌ dist/index.html을 찾을 수 없습니다');
  process.exit(1);
}
