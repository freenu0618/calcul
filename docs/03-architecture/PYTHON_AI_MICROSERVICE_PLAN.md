# Python AI 마이크로서비스 전환 계획

**작성일**: 2026-01-25
**상태**: Phase S3.3 대기
**목표**: Python 서버를 AI 전용 마이크로서비스로 전환

---

## 1. 전환 배경

### 현재 아키텍처 (Phase S3.1 완료)

```
React → Spring Boot (급여계산 API) + Python (급여계산 API 중복)
```

### 문제점

- ❌ Python과 Kotlin에 급여계산 로직이 중복됨
- ❌ 유지보수 시 양쪽 모두 수정 필요
- ❌ Python 서버가 불필요하게 크고 복잡함

### 목표 아키텍처 (Phase S3.3 이후)

```
React → Spring Boot (급여계산 전담) ←→ Python AI Service (RAG/챗봇 전용)
```

### 이점

- ✅ 관심사 분리: Spring = 비즈니스 로직, Python = AI 서비스
- ✅ Python 서버 경량화 (급여계산 로직 제거)
- ✅ 모든 DB 접근은 Spring 경유 (데이터 무결성)
- ✅ AI 기능 독립 확장 가능

---

## 2. 제거할 Python 파일 (급여계산 관련)

### backend/app/api/routers/
- ❌ `salary.py` - 급여 계산 라우터 (삭제)
- ❌ `insurance.py` - 보험료 계산 라우터 (삭제)
- ❌ `tax.py` - 세금 계산 라우터 (삭제)

### backend/app/api/schemas/
- ❌ `salary.py` - 급여 계산 스키마 (삭제)
- ❌ `insurance.py` - 보험료 스키마 (삭제)
- ❌ `tax.py` - 세금 스키마 (삭제)
- ✅ `common.py` - AI 서비스용 공통 스키마 유지

### backend/app/domain/
- ❌ 전체 도메인 계층 삭제 (entities, services, value_objects)
  - `entities/employee.py` - 삭제
  - `entities/work_shift.py` - 삭제
  - `entities/allowance.py` - 삭제
  - `services/salary_calculator.py` - 삭제
  - `services/insurance_calculator.py` - 삭제
  - `services/tax_calculator.py` - 삭제
  - `services/overtime_calculator.py` - 삭제
  - `services/weekly_holiday_pay_calculator.py` - 삭제
  - `services/absence_calculator.py` - 삭제
  - `services/warning_generator.py` - 삭제
  - `value_objects/money.py` - 삭제
  - `value_objects/working_hours.py` - 삭제

### backend/app/core/
- ❌ `legal_rates.json` - 삭제 (Spring으로 이전)
- ❌ `legal_rates_loader.py` - 삭제

---

## 3. 유지할 Python 파일 (AI 전용)

### backend/app/ai/ (Phase 6에서 구현 예정)
- ✅ `rag/embedder.py` - 임베딩 서비스
- ✅ `rag/retriever.py` - 벡터 검색
- ✅ `rag/chunker.py` - 문서 청킹
- ✅ `agents/graph.py` - LangGraph Agent
- ✅ `tools/salary_tool.py` - Spring API 호출 래퍼
- ✅ `tools/law_search_tool.py` - 법령 검색
- ✅ `llm/router.py` - Tiered LLM 라우팅

### backend/app/api/routers/
- ✅ `ai.py` - AI 챗봇 라우터 (신규)

### backend/app/api/schemas/
- ✅ `ai.py` - AI 요청/응답 스키마 (신규)

### backend/app/core/
- ✅ `config.py` - AI 설정만 유지
- ✅ `security.py` - JWT 검증만 유지 (발급 제거)
- ✅ `deps.py` - Spring API 호출용 의존성

### backend/app/db/
- ✅ `models.py` - AI 전용 모델만 유지
  - `DocumentModel` - 법령 문서
  - `DocumentChunkModel` - 문서 청크 + 벡터
  - `ChatSessionModel` - 대화 세션
  - `ChatMessageModel` - 대화 메시지
  - `TokenUsageModel` - 토큰 사용량
- ❌ `Employee`, `SalaryRecord` 등 비즈니스 모델 삭제

---

## 4. 새로운 AI 엔드포인트

### POST /ai/chat/stream
- **설명**: RAG 기반 급여 상담 챗봇 (SSE 스트리밍)
- **요청**:
  ```json
  {
    "message": "연장근로 가산율이 어떻게 되나요?",
    "session_id": "uuid",
    "user_id": "user_123"
  }
  ```
- **응답**: Server-Sent Events (SSE)
  ```
  data: {"type": "token", "content": "연장근로"}
  data: {"type": "token", "content": " 가산율은"}
  data: {"type": "citation", "law": "근로기준법 제56조"}
  data: {"type": "done"}
  ```

### POST /ai/embed
- **설명**: 텍스트 임베딩 (multilingual-e5-large)
- **요청**:
  ```json
  {
    "text": "근로기준법 제56조 연장근로 가산임금"
  }
  ```
- **응답**:
  ```json
  {
    "embedding": [0.12, -0.34, ...],  # 1024차원
    "model": "intfloat/multilingual-e5-large"
  }
  ```

### POST /ai/search
- **설명**: 벡터 검색 (Hybrid Search: 벡터 0.7 + 키워드 0.3)
- **요청**:
  ```json
  {
    "query": "주휴수당 계산 방법",
    "top_k": 5,
    "filters": {
      "document_type": "law"
    }
  }
  ```
- **응답**:
  ```json
  {
    "results": [
      {
        "id": "chunk_123",
        "text": "근로기준법 제55조...",
        "score": 0.87,
        "metadata": {
          "law": "근로기준법",
          "article": "제55조"
        }
      }
    ]
  }
  ```

### GET /health
- **설명**: 헬스 체크
- **응답**:
  ```json
  {
    "status": "healthy",
    "service": "ai",
    "version": "1.0.0"
  }
  ```

---

## 5. Spring → Python 통신

### AiServiceClient (Kotlin)

```kotlin
@Component
class AiServiceClient(private val webClientBuilder: WebClient.Builder) {
    private val pythonAiUrl = "http://localhost:8001"

    fun chatStream(message: String, sessionId: String): Mono<String>
    fun embed(text: String): Mono<List<Float>>
    fun search(query: String, topK: Int = 5): Mono<List<SearchResult>>
}
```

### 사용 예시

```kotlin
@RestController
class ChatController(private val aiServiceClient: AiServiceClient) {

    @PostMapping("/api/v1/chat")
    fun chat(@RequestBody request: ChatRequest): Mono<ChatResponse> {
        return aiServiceClient.chatStream(request.message, request.sessionId)
    }
}
```

---

## 6. 데이터 흐름

### AS-IS (현재)

```
React → Spring Boot → PostgreSQL (User, SalaryRecord)
React → Python → PostgreSQL (Employee, SalaryRecord) ← 중복!
```

### TO-BE (Phase S3.3 이후)

```
React → Spring Boot → PostgreSQL (모든 비즈니스 데이터)
             ↓
        AiServiceClient → Python AI Service
                              ↓
                          PostgreSQL (AI 전용: Document, ChatSession)
```

**중요**:
- Python은 절대로 비즈니스 데이터 (Employee, SalaryRecord)에 직접 접근하지 않음
- 급여 계산이 필요하면 Spring API 호출 (`salary_tool.py`)
- 모든 DB 쓰기는 Spring 경유

---

## 7. 구현 순서

### Step 1: Spring API Client 구현 ✅ 완료
- `AiServiceClient.kt` 작성

### Step 2: Python AI 라우터 구현 (Phase 6)
- `backend/app/api/routers/ai.py` 작성
- SSE 스트리밍 엔드포인트 구현
- LangGraph Agent 연동

### Step 3: Python 급여계산 코드 제거 (Phase S3.3)
- `backend/app/api/routers/salary.py` 삭제
- `backend/app/domain/` 전체 삭제
- `backend/app/core/legal_rates.json` 이전

### Step 4: salary_tool.py 작성 (Phase 6)
- Python에서 Spring API 호출
- LangGraph Tool로 래핑
- 예: "기본급 280만원 실수령액은?" → Spring `/api/v1/salary/calculate` 호출

### Step 5: 환경변수 설정
```bash
# Python .env
SPRING_API_URL=http://localhost:8080
DATABASE_URL=postgresql://...  # AI 전용 DB

# Spring application.yml
python:
  ai:
    url: http://localhost:8001
```

### Step 6: 통합 테스트
- Spring → Python 통신 테스트
- Python → Spring 통신 테스트
- 엔드투엔드 테스트 (React → Spring → Python → Spring)

---

## 8. 롤백 계획

Phase S3.3 작업 중 문제 발생 시:

1. Python 급여계산 코드 복원 (Git revert)
2. Spring API 프록시 설정 유지 (Phase S1에서 구현)
3. 점진적 전환: 일부 API만 Spring으로 이전

---

## 9. 예상 작업량

- **Step 3 (코드 제거)**: 1일
- **Step 4 (salary_tool.py)**: 1일
- **Step 5 (환경변수)**: 0.5일
- **Step 6 (통합 테스트)**: 1일
- **총 예상**: 3.5일

---

## 10. 성공 기준

- ✅ Python 서버에 급여계산 API 없음 (404 에러)
- ✅ Spring `/api/v1/salary/calculate` 정상 작동
- ✅ Python `/ai/chat/stream` 정상 작동
- ✅ Python에서 "기본급 280만원 실수령액은?" 질문 시 Spring API 호출 확인
- ✅ 모든 통합 테스트 통과

---

**작성자**: Claude Code
**마지막 업데이트**: 2026-01-25
**다음 단계**: Phase 6 (AI 챗봇 RAG 파이프라인 구현)
