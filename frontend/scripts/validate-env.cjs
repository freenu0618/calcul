/**
 * 빌드 전 환경변수 검증 스크립트
 *
 * 프로덕션 빌드 시 필수 환경변수가 설정되었는지 확인합니다.
 */

const fs = require('fs');
const path = require('path');

// .env 파일 로드 (dotenv 없이 직접 파싱)
const envFiles = ['.env', '.env.local', '.env.production'];
for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    });
  }
}

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
