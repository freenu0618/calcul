/**
 * Puppeteer 기반 완전 프리렌더링 스크립트
 * - Vite preview 서버로 빌드 결과물을 서빙
 * - 각 공개 라우트를 헤드리스 Chrome으로 방문
 * - 렌더링된 전체 HTML을 dist/에 저장
 * - Googlebot이 JS 없이도 모든 콘텐츠를 크롤 가능
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// 프리렌더링 대상 공개 라우트 (인증 필요 페이지 제외)
const ROUTES = [
  '/',
  '/calculator',
  '/reverse-calculator',
  '/simulation',
  '/guide',
  '/guide/insurance',
  '/guide/tax',
  '/guide/overtime',
  '/guide/how-to-use',
  '/faq',
  '/examples',
  '/examples/fulltime',
  '/examples/parttime',
  '/examples/shift-work',
  '/legal',
  '/blog',
  '/blog/2026-minimum-wage',
  '/blog/insurance-rate-2026',
  '/blog/overtime-calculation-tips',
  '/blog/weekly-holiday-pay-guide',
  '/blog/year-end-tax-settlement-2026',
  '/blog/freelancer-salary-calculation',
  '/blog/retirement-pay-guide',
  '/blog/parental-leave-benefits',
  '/blog/unemployment-benefits-guide',
  '/blog/minimum-wage-violation-penalty',
  '/blog/payslip-requirements',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
];

// MIME 타입 매핑
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/** 간단한 정적 파일 서버 */
function startServer() {
  return new Promise((resolve) => {
    const fallback = readFileSync(join(DIST, 'index.html'));

    const server = createServer((req, res) => {
      const url = new URL(req.url, BASE);
      let filePath = join(DIST, url.pathname);

      // 디렉토리면 index.html 시도
      if (!extname(filePath)) {
        const indexPath = join(filePath, 'index.html');
        if (existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          // SPA 폴백
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback);
          return;
        }
      }

      if (existsSync(filePath)) {
        const ext = extname(filePath);
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(readFileSync(filePath));
      } else {
        // SPA 폴백
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fallback);
      }
    });

    server.listen(PORT, () => {
      console.log(`  Static server on ${BASE}`);
      resolve(server);
    });
  });
}

/** 단일 라우트 프리렌더링 */
async function renderRoute(page, route) {
  const url = `${BASE}${route}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Lazy 컴포넌트 로딩 대기
  await page.waitForSelector('#root > *', { timeout: 10000 });
  // 추가 렌더링 안정화 대기
  await new Promise(r => setTimeout(r, 500));

  // 전체 HTML 추출
  const html = await page.content();
  return html;
}

/** HTML 후처리: hydration 호환성 + 크롤러 최적화 */
function postProcess(html) {
  return html
    // AdSense iframe/ins 제거 (빌드타임에 불필요, 크롤러 혼란 방지)
    .replace(/<ins class="adsbygoogle[\s\S]*?<\/ins>/g, '')
    .replace(/<iframe[^>]*google(ads|syndication|_esf|\.com\/recaptcha)[^>]*>[\s\S]*?<\/iframe>/g, '')
    .replace(/<iframe[^>]*google(ads|syndication|_esf|\.com\/recaptcha)[^>]*\/>/g, '')
    // origin-trial meta 제거 (AdSense가 주입한 것)
    .replace(/<meta http-equiv="origin-trial"[^>]*>/g, '')
    // prerender 마커 추가 (닫는 > 포함)
    .replace('<div id="root">', '<div id="root" data-prerendered="true">');
}

async function main() {
  console.log('🚀 Puppeteer 프리렌더링 시작...');
  console.log(`  대상: ${ROUTES.length}개 라우트\n`);

  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // 콘솔 에러 무시 (AdSense 등 외부 스크립트)
  page.on('console', () => {});
  page.on('pageerror', () => {});

  // 외부 스크립트 차단 (AdSense, GA, Clarity 등 - 프리렌더링에 불필요)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (
      url.includes('googlesyndication') ||
      url.includes('googletagmanager') ||
      url.includes('google-analytics') ||
      url.includes('clarity.ms') ||
      url.includes('doubleclick.net') ||
      url.includes('recaptcha')
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      const html = await renderRoute(page, route);
      const processed = postProcess(html);

      // 저장 경로 결정
      const dir = route === '/'
        ? DIST
        : join(DIST, route);
      const filePath = join(dir, route === '/' ? 'index.html' : 'index.html');

      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, processed, 'utf-8');

      // 콘텐츠 크기 확인 (body 전체에서 root div 내부 텍스트 추출)
      const bodyMatch = processed.match(/<body>([\s\S]*)<\/body>/);
      const contentLen = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '').trim().length : 0;
      const status = contentLen > 100 ? '✅' : '⚠️';
      console.log(`  ${status} ${route} (body: ${(contentLen / 1024).toFixed(1)}KB)`);

      success++;
    } catch (err) {
      console.log(`  ❌ ${route} - ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n🏁 프리렌더링 완료: ${success}/${ROUTES.length} 성공, ${failed} 실패`);

  if (failed > 0) {
    process.exit(1);
  }
}

/** Fallback: meta 태그만 교체 (Puppeteer 사용 불가 시) */
function fallbackMetaOnly() {
  console.log('⚠️ Puppeteer 사용 불가 - meta 태그 프리렌더링으로 대체');
  const META_ROUTES = [
    { path: '', title: '급여계산기 - 4대보험 주휴수당 자동계산 | PayTools', description: '4대보험, 소득세, 주휴수당, 연장·야간·휴일 수당 자동 계산. 2026년 최신 법령 반영.' },
    ...ROUTES.map(r => ({ path: r, title: `PayTools`, description: '급여 계산 자동화 서비스' })),
  ];
  const template = readFileSync(join(DIST, 'index.html'), 'utf-8');
  const BASE_URL = 'https://paytools.work';
  let count = 0;
  for (const route of META_ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    let html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${route.description}"`)
      .replace(/<!-- canonical[^>]*-->/, `<link rel="canonical" href="${url}" />`);
    const dir = route.path ? join(DIST, route.path) : DIST;
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
    count++;
  }
  console.log(`✅ Meta 프리렌더링 완료: ${count}개 페이지`);
}

main().catch((err) => {
  console.error('Puppeteer 프리렌더링 실패:', err.message);
  try {
    fallbackMetaOnly();
  } catch (fbErr) {
    console.error('Fallback도 실패:', fbErr.message);
    process.exit(1);
  }
});
