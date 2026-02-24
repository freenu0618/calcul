/**
 * 빌드 타임 SEO 프리렌더링 스크립트
 * - 각 공개 라우트에 대해 올바른 meta 태그가 포함된 HTML 파일 생성
 * - Google 1차 크롤링(JS 미실행)에서도 정확한 title, description, canonical 제공
 * - Cloudflare Pages가 정적 파일을 우선 서빙하므로 SPA 폴백보다 먼저 응답
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE_URL = 'https://paytools.work';

const ROUTES = [
  // 핵심 기능
  { path: '/calculator', title: '급여 계산기 | PayTools - 4대보험, 소득세 자동 계산', description: '기본급, 수당, 4대보험, 소득세를 자동 계산. 2026년 최신 세율 적용. 연장·야간·휴일 수당, 주휴수당 자동 계산.' },
  { path: '/reverse-calculator', title: '실수령액 역산 계산기 | 월급 역산 | PayTools', description: '원하는 실수령액을 입력하면 필요한 기본급을 역산합니다. 4대보험, 소득세를 고려한 정확한 역산 계산.' },
  { path: '/simulation', title: '급여 구조 시뮬레이션 | PayTools', description: '같은 총 급여액에서 기본급과 수당 배분에 따른 인건비 차이를 비교 시뮬레이션합니다.' },

  // 가이드
  { path: '/guide', title: '급여 계산 가이드 - 사용법, 4대보험, 소득세, 수당 | PayTools', description: 'PayTools 사용법과 한국 근로기준법에 따른 급여 계산의 모든 것을 알아보세요.' },
  { path: '/guide/insurance', title: '4대 보험 이해하기 | 2026년 요율 및 계산 방법 | PayTools', description: '국민연금, 건강보험, 장기요양보험, 고용보험의 2026년 요율과 계산 방법을 상세히 안내합니다.' },
  { path: '/guide/tax', title: '소득세 계산법 | 간이세액표 활용 가이드 | PayTools', description: '근로소득세 간이세액표와 부양가족 공제를 활용한 소득세 계산 방법. 2026년 세율 안내.' },
  { path: '/guide/overtime', title: '연장·야간·휴일 수당 계산법 | 가산수당 가이드 | PayTools', description: '근로기준법에 따른 연장·야간·휴일 수당 계산 방법. 통상시급 산정, 가산율 적용을 안내합니다.' },
  { path: '/guide/how-to-use', title: '서비스 사용법 - PayTools 급여 계산기', description: 'PayTools 급여 계산기를 급여유형별로 어떻게 사용하는지 안내합니다. 월급제, 시급제, 시급기반 월급제.' },

  // FAQ
  { path: '/faq', title: '자주 묻는 질문 (FAQ) | PayTools 급여 계산기', description: '급여 계산, 4대 보험, 소득세, 연장수당, 최저임금에 대한 30개의 자주 묻는 질문과 답변.' },

  // 계산 사례
  { path: '/examples', title: '급여 계산 사례 - 풀타임·파트타임·교대근무 | PayTools', description: '다양한 근무 형태별 실제 급여 계산 사례. 4대보험, 소득세, 실수령액 계산 과정을 확인하세요.' },
  { path: '/examples/fulltime', title: '풀타임 근로자 급여 계산 사례 (주 5일) | PayTools', description: '월급 250만원, 주 5일 정규직 근로자의 실수령액 계산 사례. 4대 보험, 소득세, 주휴수당 포함.' },
  { path: '/examples/parttime', title: '파트타임 근로자 급여 계산 사례 (주 3일) | PayTools', description: '시급 10,320원, 주 3일 단시간 근로자의 실수령액 계산. 주휴수당 비례 계산과 4대 보험 기준.' },
  { path: '/examples/shift-work', title: '교대근무 근로자 급여 계산 사례 (3교대) | PayTools', description: '야간근무 포함 3교대 근로자의 연장·야간·휴일 수당 계산 사례. 복합 가산수당 계산 방법.' },

  // 법률·블로그
  { path: '/legal', title: '근로기준법 핵심 조항 - 법률 정보 | PayTools', description: '급여 계산에 필요한 근로기준법, 최저임금법, 소득세법의 핵심 조항을 쉽게 정리했습니다.' },
  { path: '/blog', title: '급여 계산 블로그 - 근로법·세법 최신 소식 | PayTools', description: '급여 계산, 4대보험, 소득세, 연장수당, 최저임금 등 근로 관련 최신 소식과 실무 가이드.' },
  { path: '/blog/2026-minimum-wage', title: '2026년 최저임금 변경사항 | PayTools', description: '2026년 최저임금이 시급 10,320원으로 인상되었습니다. 월 환산액과 적용 기준을 알아봅니다.' },
  { path: '/blog/insurance-rate-2026', title: '2026년 4대 보험 요율 업데이트 | PayTools', description: '2026년 4대 보험 요율 변경. 국민연금, 건강보험, 장기요양보험, 고용보험 새로운 요율.' },
  { path: '/blog/overtime-calculation-tips', title: '연장수당 계산 꿀팁 | PayTools', description: '연장근로 수당을 정확히 계산하는 방법과 주의사항. 주 40시간 기준과 통상시급 계산법.' },
  { path: '/blog/weekly-holiday-pay-guide', title: '주휴수당 완벽 가이드 | PayTools', description: '주휴수당의 개념, 지급 요건, 계산 방법을 상세히 설명합니다. 5인 미만 사업장도 의무 적용.' },
  { path: '/blog/year-end-tax-settlement-2026', title: '2026년 연말정산 준비하기 | PayTools', description: '연말정산 시기가 다가왔습니다. 공제 항목과 절세 팁을 미리 준비하세요.' },
  { path: '/blog/freelancer-salary-calculation', title: '프리랜서 급여 계산 완벽 가이드 | PayTools', description: '프리랜서의 3.3% 원천징수, 4대 보험, 실수령액 계산 방법을 상세히 알아봅니다.' },
  { path: '/blog/retirement-pay-guide', title: '퇴직금 계산법 완벽 가이드 | PayTools', description: '퇴직금 지급 요건, 계산 방법, 중간정산, 퇴직연금(DC/DB)까지 모든 것을 알아봅니다.' },
  { path: '/blog/parental-leave-benefits', title: '육아휴직 급여 완벽 가이드 | PayTools', description: '육아휴직 신청 방법, 급여 계산, 복직 후 지원금까지 모든 것을 알아봅니다.' },
  { path: '/blog/unemployment-benefits-guide', title: '실업급여 계산 및 신청 가이드 | PayTools', description: '실업급여 수급 자격, 계산 방법, 신청 절차부터 재취업 활동까지 완벽 정리.' },
  { path: '/blog/minimum-wage-violation-penalty', title: '최저임금 위반 시 과태료 및 처벌 기준 | PayTools', description: '최저임금 미지급 시 사업주에게 부과되는 과태료와 처벌 기준을 상세히 알아봅니다.' },
  { path: '/blog/payslip-requirements', title: '급여명세서 필수 기재사항 완벽 가이드 | PayTools', description: '2021년 11월부터 의무화된 급여명세서 교부제도의 필수 기재사항과 위반 시 과태료.' },

  // 기타
  { path: '/about', title: '서비스 소개 - 급여 계산 자동화 | PayTools', description: 'PayTools는 한국 근로기준법에 따른 정확한 실수령액 계산 서비스입니다.' },
  { path: '/privacy', title: '개인정보처리방침 | PayTools', description: 'PayTools 급여 계산기의 개인정보처리방침입니다. 개인정보 수집, 쿠키 사용, 데이터 보관 정책.' },
  { path: '/terms', title: '이용약관 | PayTools', description: 'PayTools 급여 계산기 이용약관. 서비스 이용, 면책 조항, 저작권 등의 권리와 의무 안내.' },
  { path: '/contact', title: '연락처 - 문의하기 | PayTools', description: 'PayTools 급여 계산기에 대한 문의사항, 버그 리포트, 개선 제안은 이메일로 연락해 주세요.' },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function generatePageHtml(template, route) {
  const url = `${BASE_URL}${route.path}`;
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);
  let html = template;

  // title 교체
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // description 교체
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${desc}"`
  );

  // canonical 삽입 (주석을 실제 태그로 교체)
  html = html.replace(
    /<!-- canonical[^>]*-->/,
    `<link rel="canonical" href="${url}" />`
  );

  // Open Graph 교체
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);

  // Twitter 교체
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`);

  return html;
}

// 메인 실행
const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');

// 루트 페이지(/) - dist/index.html 자체를 업데이트
const rootHtml = generatePageHtml(template, {
  path: '',
  title: '급여계산기 - 4대보험 주휴수당 자동계산 | PayTools',
  description: '4대보험, 소득세, 주휴수당, 연장·야간·휴일 수당 자동 계산. 2026년 최신 법령 반영. 8개 법률 기반 정확한 계산. 직원 5명까지 무료.',
});
writeFileSync(templatePath, rootHtml);

// 각 라우트별 HTML 생성
let count = 0;
for (const route of ROUTES) {
  const html = generatePageHtml(template, route);
  const dir = join(DIST, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  count++;
}

console.log(`✅ SEO 프리렌더링 완료: ${count}개 페이지 + 루트 페이지 업데이트`);
