# 모니터링 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

Paytools 서비스의 모니터링 방법을 안내합니다.

---

## 1. 헬스 체크

### 1.1 백엔드 헬스 체크

**엔드포인트**: `/actuator/health`

```bash
curl https://calcul-production.up.railway.app/actuator/health
```

**정상 응답**:
```json
{
  "status": "UP"
}
```

### 1.2 프론트엔드 확인

```bash
curl -I https://paytools.work
# HTTP/2 200 확인
```

---

## 2. Railway 로그 모니터링

### 2.1 실시간 로그 확인

1. Railway Dashboard 접속
2. Project 선택
3. Deployments → 최신 배포 클릭
4. **View Logs** 클릭

### 2.2 주요 로그 패턴

| 로그 | 의미 | 대응 |
|------|------|------|
| `Started Application in X seconds` | 정상 시작 | 확인만 |
| `Database connection failed` | DB 연결 실패 | DB 상태 확인 |
| `OutOfMemoryError` | 메모리 부족 | 리소스 확장 |
| `Connection refused` | 연결 거부 | 네트워크 확인 |

---

## 3. Cloudflare Analytics

### 3.1 접속 방법

1. Cloudflare Dashboard → Pages
2. `paytools-work` 프로젝트 선택
3. **Analytics** 탭

### 3.2 확인 항목

| 항목 | 설명 |
|------|------|
| Requests | 요청 수 |
| Bandwidth | 대역폭 사용량 |
| Unique Visitors | 순 방문자 수 |
| Page Views | 페이지뷰 |

---

## 4. Actuator 엔드포인트

### 4.1 사용 가능 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `/actuator/health` | 헬스 상태 |
| `/actuator/info` | 앱 정보 |
| `/actuator/metrics` | 메트릭 |
| `/actuator/env` | 환경 변수 (보안 주의) |

### 4.2 메트릭 확인

```bash
# JVM 메모리
curl https://calcul-production.up.railway.app/actuator/metrics/jvm.memory.used

# HTTP 요청 통계
curl https://calcul-production.up.railway.app/actuator/metrics/http.server.requests
```

---

## 5. Uptime 모니터링 (UptimeRobot)

### 5.1 설정 방법

1. [UptimeRobot](https://uptimerobot.com) 가입 (무료)
2. **Add New Monitor** 클릭
3. 설정:
   - Type: HTTP(s)
   - URL: `https://calcul-production.up.railway.app/actuator/health`
   - Interval: 5분
   - Alert: 이메일 알림

### 5.2 알림 설정

- 다운타임 발생 시 이메일 알림
- 복구 시 이메일 알림

---

## 6. 성능 모니터링

### 6.1 Lighthouse 점검

```bash
# Chrome DevTools → Lighthouse
# 또는 https://pagespeed.web.dev
```

**목표 점수**:
| 항목 | 목표 |
|------|------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |

### 6.2 API 응답 시간

```bash
# 응답 시간 측정
time curl -X POST https://calcul-production.up.railway.app/api/v1/salary/calculate \
  -H "Content-Type: application/json" \
  -d '{"employee":{"employment_type":"FULL_TIME","company_size":"FIVE_OR_MORE","base_salary":2800000},"shifts":[],"allowances":[],"wage_type":"MONTHLY","calculation_month":"2026-01"}'
```

**목표**: 500ms 이내

---

## 7. 일일 점검 체크리스트

| 항목 | 확인 방법 | 빈도 |
|------|----------|------|
| 헬스 체크 | `/actuator/health` | 자동 (5분) |
| 사이트 접속 | https://paytools.work | 일 1회 |
| Railway 로그 | Dashboard | 필요 시 |
| 에러 알림 | 이메일 | 즉시 대응 |

---

## 8. 알림 설정 요약

| 서비스 | 알림 방법 | 조건 |
|--------|----------|------|
| UptimeRobot | 이메일 | 다운타임 |
| Railway | 대시보드 | 배포 실패 |
| Cloudflare | 대시보드 | 트래픽 급증 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 최초 작성 |
