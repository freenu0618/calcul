# PayTools AI - 노무 자문 챗봇

AI 기반 한국 노동법 자문 챗봇 서비스

## 기술 스택

- **Framework**: FastAPI 0.115+
- **LLM**: Gemini 2.0 Flash / Groq Llama 3.3 / GPT-4o-mini (Fallback)
- **Agent**: LangGraph
- **Embedding**: multilingual-e5-large (1024차원)
- **Vector DB**: PostgreSQL + pgvector
- **Streaming**: SSE (Server-Sent Events)

## 설치 및 실행

### 1. 환경 설정

```bash
cd backend-ai
cp .env.example .env
# .env 파일에 API 키 설정
```

### 2. 의존성 설치

```bash
# Poetry 사용
poetry install

# 또는 pip 사용
pip install -r requirements.txt
```

### 3. 데이터베이스 마이그레이션

```bash
alembic upgrade head
```

### 4. 서버 실행

```bash
# 개발 모드
uvicorn app.main:app --reload --port 8001

# 프로덕션
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| POST | `/api/v1/chat/stream` | SSE 스트리밍 챗봇 |
| GET | `/api/v1/chat/sessions` | 세션 목록 |
| GET | `/api/v1/chat/sessions/{id}/messages` | 메시지 조회 |

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | Y | PostgreSQL 연결 URL |
| `GOOGLE_API_KEY` | Y | Gemini API 키 |
| `GROQ_API_KEY` | N | Groq API 키 (폴백) |
| `OPENAI_API_KEY` | N | OpenAI API 키 (폴백) |
| `LAW_API_KEY` | Y | 법령정보센터 API 키 |

## 디렉토리 구조

```
backend-ai/
├── app/
│   ├── api/          # FastAPI 라우터
│   ├── core/         # 설정
│   ├── db/           # 데이터베이스
│   ├── models/       # SQLAlchemy 모델
│   └── services/     # 비즈니스 로직
├── alembic/          # DB 마이그레이션
└── tests/            # 테스트
```
