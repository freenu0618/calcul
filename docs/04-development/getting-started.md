# 시작 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

Paytools 프로젝트 개발 환경 설정 가이드입니다.

---

## 1. 필수 요구사항

| 항목 | 버전 | 설치 확인 |
|------|------|----------|
| JDK | 17+ | `java -version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Docker | 최신 | `docker --version` |
| Git | 최신 | `git --version` |

---

## 2. 프로젝트 클론

```bash
git clone https://github.com/freenu0618/calcul.git
cd calcul
```

---

## 3. 백엔드 설정 (Spring Boot)

### 3.1 데이터베이스 실행

```bash
# Docker Compose로 PostgreSQL + Redis 실행
docker-compose up -d
```

### 3.2 환경 변수 설정

`backend-spring/.env` 파일 생성:
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/paytools
DATABASE_USERNAME=paytools
DATABASE_PASSWORD=paytools123
JWT_SECRET=your-local-development-secret-key-32chars
```

### 3.3 빌드 및 실행

```bash
cd backend-spring
./gradlew build
./gradlew :api:bootRun
```

### 3.4 확인

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

---

## 4. 프론트엔드 설정 (React)

### 4.1 의존성 설치

```bash
cd frontend
npm install
```

### 4.2 환경 변수 설정

`frontend/.env.local` 파일 생성:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 4.3 개발 서버 실행

```bash
npm run dev
```

### 4.4 확인

- 개발 서버: http://localhost:5173

---

## 5. 전체 실행 요약

```bash
# 터미널 1: 데이터베이스
docker-compose up -d

# 터미널 2: 백엔드
cd backend-spring && ./gradlew :api:bootRun

# 터미널 3: 프론트엔드
cd frontend && npm run dev
```

---

## 6. 테스트 실행

### 6.1 백엔드 테스트

```bash
cd backend-spring
./gradlew test
```

### 6.2 프론트엔드 테스트

```bash
cd frontend
npm run test  # 설정된 경우
```

---

## 7. 유용한 명령어

### 백엔드

| 명령어 | 설명 |
|--------|------|
| `./gradlew build` | 빌드 |
| `./gradlew :api:bootRun` | 실행 |
| `./gradlew test` | 테스트 |
| `./gradlew clean` | 클린 |

### 프론트엔드

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |

### Docker

| 명령어 | 설명 |
|--------|------|
| `docker-compose up -d` | 컨테이너 시작 |
| `docker-compose down` | 컨테이너 중지 |
| `docker-compose logs -f` | 로그 확인 |

---

## 8. 프로젝트 구조

```
calcul/
├── backend-spring/          # Spring Boot 백엔드
│   ├── api/                 # Controller, DTO
│   ├── domain/              # 도메인 모델, 서비스
│   ├── infrastructure/      # JPA, Security
│   └── common/              # 공통 유틸
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── api/             # API 클라이언트
│   │   └── contexts/        # React Context
│   └── public/
├── docs/                    # 문서
└── docker-compose.yml       # Docker 설정
```

---

## 9. IDE 설정

### IntelliJ IDEA

1. **Open** → `calcul/backend-spring` 폴더
2. Gradle 자동 import
3. **File** → **Project Structure** → JDK 17 설정

### VS Code

1. **Open Folder** → `calcul/frontend`
2. 추천 확장:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense

---

## 10. 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| Gradle 빌드 실패 | `./gradlew clean build` |
| DB 연결 실패 | `docker-compose up -d` 확인 |
| 포트 충돌 | 8080, 5173 포트 확인 |
| npm 에러 | `rm -rf node_modules && npm install` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 최초 작성 |
