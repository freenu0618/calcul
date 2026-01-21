/**
 * 빌드 전 환경변수 검증 스크립트
 *
 * 프로덕션 빌드 시 필수 환경변수가 설정되었는지 확인합니다.
 */

const requiredEnvVars = ['VITE_API_BASE_URL'];

const missing = requiredEnvVars.filter(
  key => !process.env[key] || process.env[key].trim() === ''
);

if (missing.length > 0) {
  console.error('❌ 필수 환경변수 누락:', missing.join(', '));
  console.error('\n설정 방법:');
  console.error('  Cloudflare Pages → Settings → Environment variables');
  console.error('  예: VITE_API_BASE_URL=https://paytools.work');
  process.exit(1);
}

console.log('✅ 환경변수 검증 완료');
console.log(`   VITE_API_BASE_URL: ${process.env.VITE_API_BASE_URL}`);
