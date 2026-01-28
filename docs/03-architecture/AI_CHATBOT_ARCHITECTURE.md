# AI 노무 자문 챗봇 아키텍처 설계서

> 작성일: 2026-01-23
> 상태: 설계 완료 (Phase 2-4 완료 후 구현 예정)
> 참고: follaw.co.kr "Ait" 서비스 벤치마킹

## 목표
사업장별 DB 데이터 + 법령 + 판례를 RAG로 활용하여 맞춤 AI 노무 자문 제공.

---

## 핵심 결정사항

| 항목 | 선택 | 근거 |
|------|------|------|
| LLM | Gemini Flash (기본) + Groq (백업) | 무료 티어 활용, 월 $0 |
| Vector DB | pgvector | 기존 PostgreSQL 활용, 추가 비용 $0 |
| 임베딩 | multilingual-e5-large | 무료, 한국어 우수, 1024차원 |
| 프레임워크 | LangGraph | Multi-Agent 오케스트레이션 |
| 스트리밍 | SSE (Server-Sent Events) | 실시간 타이핑 효과 |

---

## 비용 최적화: Tiered Model Routing

```
질문 → 캐시 히트? → 직접 반환
         ↓ (미스)
     Tier 1: FAQ/법조문 직접 반환 (LLM 호출 없음, ~200개)
     Tier 2: Gemini 2.0 Flash (무료 1500 req/day)
     Tier 3: Groq Llama 3.3 70B (무료 백업, 14400 req/day)
     Tier 4: GPT-4o-mini (복잡한 분석, $0.15/1M input)
```

**예상 월 비용: $10-20 (100명 이하 기준)**

---

## 시스템 아키텍처

```
[사용자] → [React Chat UI (SSE)] → [FastAPI /api/v1/chat/stream]
                                              ↓
                                       [LangGraph Agent]
                                         ├── Router Node (의도 분류)
                                         ├── RAG Retrieve Node (pgvector)
                                         ├── Tool Node (급여계산, DB조회)
                                         └── Generate Node (LLM 응답)
                                              ↓
                                    [Tiered LLM Router]
                                      ├── Gemini Flash (기본)
                                      ├── Groq (백업)
                                      └── GPT-4o-mini (고난도)
```

---

## 데이터 소스

| 소스 | 수집 방법 | 갱신 주기 |
|------|----------|----------|
| 사업장 내부 (직원/급여/시프트) | DB 트리거 + 배치 임베딩 | 실시간 |
| 법령 (근로기준법 등 8개) | law.go.kr API | 법령 개정 시 |
| 행정해석 (~500건) | 수동 입력 + 크롤링 | 월 1회 |

---

## 구현 단계

### Phase 5.1: DB + 벡터 인프라
- pgvector 확장 활성화
- DB 모델: Document, DocumentChunk, UserDocumentChunk, ChatSession, ChatMessage, TokenUsage

### Phase 5.2: RAG 파이프라인
- embedder.py (multilingual-e5-large)
- chunker.py (법령 조문별, 판례 섹션별)
- retriever.py (Hybrid: 벡터 0.7 + 키워드 0.3)
- ingestion.py (데이터 수집 CLI)

### Phase 5.3: LangGraph Agent
- graph.py (Router → Retrieve → Generate 워크플로우)
- Tools: salary_tool, law_search_tool, db_query_tool
- llm/router.py (Tiered 라우팅)
- cache (FAQ + 시맨틱 캐시)

### Phase 5.4: API + 스트리밍
- POST /chat/stream (SSE)
- GET /chat/sessions, /chat/sessions/{id}/messages
- Rate limiting (30 req/hour)
- 토큰 사용량 추적

### Phase 5.5: 프론트엔드 Chat UI
- ChatWidget (플로팅), ChatWindow, MessageBubble, Citation
- useChat.ts (SSE 스트리밍 훅)
- /chat 라우트

### Phase 5.6: 문서화 + 데모
- 아키텍처 다이어그램
- 데모 시나리오 3개

---

## 디렉토리 구조

```
backend/app/ai/
├── config.py           # LLM 설정, 토큰 버짓
├── router.py           # FastAPI 채팅 라우터
├── schemas.py          # 요청/응답 스키마
├── agents/graph.py     # LangGraph 워크플로우
├── tools/              # salary, law_search, db_query
├── rag/                # embedder, retriever, chunker, ingestion
├── llm/                # gemini, groq, tiered router
└── cache/              # FAQ + 시맨틱 캐시

frontend/src/components/Chat/
├── ChatWidget.tsx      # 플로팅 위젯
├── ChatWindow.tsx      # 메인 채팅창
├── MessageBubble.tsx   # 메시지 (마크다운)
├── ChatInput.tsx       # 입력창
├── Citation.tsx        # 법령 인용 카드
└── SessionList.tsx     # 세션 목록
```

---

## 추가 패키지

**백엔드**: langchain, langgraph, langchain-google-genai, langchain-groq, sentence-transformers, pgvector, sse-starlette, tiktoken, beautifulsoup4

**프론트엔드**: react-markdown, remark-gfm

---

## 보안

- Multi-tenant: user_id 필터 강제 (RLS)
- 개인정보 비식별화 후 벡터화
- API 키: Railway 환경변수
- 민감정보(주민번호 등) 벡터화 금지

---

## 포트폴리오 어필

| 기술 | 어필 포인트 |
|------|------------|
| LangGraph Multi-Agent | AI 오케스트레이션 설계 |
| RAG + pgvector | 프로덕션급 벡터 검색 |
| Tiered LLM Routing | 비용 최적화 엔지니어링 |
| SSE Streaming | 실시간 UI |
| DDD + AI 통합 | 기존 도메인 로직 재사용 |

---

## 선행 조건

- Phase 2.3: 경고 시스템 강화
- Phase 2.4: 법정 요율 JSON 관리
- Phase 3: 역산, PDF, Excel
- Phase 4: 마케팅/SEO
