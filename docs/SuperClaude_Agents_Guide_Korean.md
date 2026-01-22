# SuperClaude 에이전트 가이드 🤖

SuperClaude는 Claude Code가 전문화된 전문 지식을 위해 호출할 수 있는 16개의 도메인 전문가 에이전트를 제공합니다.

## 🧪 에이전트 선택 테스트

이 가이드를 사용하기 전에 에이전트 선택이 작동하는지 확인하세요:

```bash
# 수동 에이전트 호출 테스트
@agent-python-expert "데코레이터 설명해줘"
# 예상 동작: Python 전문가가 상세한 설명으로 응답

# 보안 에이전트 자동 활성화 테스트
/sc:implement "JWT 인증"
# 예상 동작: 보안 엔지니어가 자동으로 활성화됨

# 프론트엔드 에이전트 자동 활성화 테스트
/sc:implement "반응형 네비게이션 컴포넌트"
# 예상 동작: 프론트엔드 아키텍트 + Magic MCP가 활성화됨

# 체계적 분석 테스트
/sc:troubleshoot "느린 API 성능"
# 예상 동작: 근본 원인 분석가 + 성능 엔지니어 활성화

# 수동과 자동 조합 테스트
/sc:analyze src/
@agent-refactoring-expert "개선 사항 제안해줘"
# 예상 동작: 분석 후 리팩토링 제안
```

**테스트 실패 시**: `~/.claude/agents/`에 에이전트 파일이 있는지 확인하거나 Claude Code 세션을 재시작하세요.

---

## 핵심 개념

### SuperClaude 에이전트란?

에이전트는 Claude Code의 동작을 수정하는 컨텍스트 지침으로 구현된 전문화된 AI 도메인 전문가입니다. 각 에이전트는 `superclaude/Agents/` 디렉토리에 있는 세심하게 작성된 `.md` 파일로, 도메인별 전문 지식, 행동 패턴, 문제 해결 접근 방식을 포함합니다.

**중요**: 에이전트는 별도의 AI 모델이나 소프트웨어가 아닙니다 - Claude Code가 전문화된 동작을 채택하기 위해 읽는 컨텍스트 구성입니다.

### 에이전트를 사용하는 두 가지 방법

#### 1. @agent- 접두사로 수동 호출

```bash
# 특정 에이전트를 직접 호출
@agent-security "인증 구현 검토해줘"
@agent-frontend "반응형 네비게이션 설계해줘"
@agent-architect "마이크로서비스 마이그레이션 계획해줘"
```

#### 2. 자동 활성화 (행동 라우팅)

"자동 활성화"란 Claude Code가 요청의 키워드와 패턴을 기반으로 적절한 컨텍스트를 활성화하는 행동 지침을 읽는 것을 의미합니다. SuperClaude는 가장 적절한 전문가에게 라우팅하기 위해 Claude가 따르는 행동 가이드라인을 제공합니다.

📝 **에이전트 "자동 활성화" 작동 방식**: 에이전트 활성화는 자동 시스템 로직이 아닙니다 - 컨텍스트 파일의 행동 지침입니다. 문서에서 에이전트가 "자동 활성화"된다고 할 때, Claude Code가 요청의 키워드와 패턴을 기반으로 특정 도메인 전문 지식을 활성화하는 지침을 읽는다는 의미입니다. 이것은 기본 메커니즘에 대해 투명하면서도 지능적인 라우팅 경험을 만들어냅니다.

```bash
# 이 명령어들은 관련 에이전트를 자동 활성화합니다
/sc:implement "JWT 인증"  # → security-engineer 자동 활성화
/sc:design "React 대시보드"        # → frontend-architect 자동 활성화
/sc:troubleshoot "메모리 누수"      # → performance-engineer 자동 활성화
```

**MCP 서버**는 Context7(문서), Sequential(분석), Magic(UI), Playwright(테스팅), Morphllm(코드 변환)과 같은 전문 도구를 통해 향상된 기능을 제공합니다.

**도메인 전문가**는 일반적인 접근 방식보다 더 깊고 정확한 솔루션을 제공하기 위해 좁은 전문 영역에 집중합니다.

### 에이전트 선택 규칙

**우선순위 계층**:

1. **수동 오버라이드** - `@agent-[이름]`이 자동 활성화보다 우선
2. **키워드** - 직접적인 도메인 용어가 주요 에이전트를 트리거
3. **파일 유형** - 확장자가 언어/프레임워크 전문가를 활성화
4. **복잡성** - 다단계 작업이 조정 에이전트를 활성화
5. **컨텍스트** - 관련 개념이 보완 에이전트를 트리거

**충돌 해결**:

- 수동 호출 → 지정된 에이전트가 우선권을 가짐
- 다중 매칭 → 다중 에이전트 조정
- 불명확한 컨텍스트 → 요구사항 분석가 활성화
- 높은 복잡성 → 시스템 아키텍트 감독
- 품질 우려 → 자동 QA 에이전트 포함

**선택 의사 결정 트리**:

```
작업 분석 →
├─ 수동 @agent-? → 지정된 에이전트 사용
├─ 단일 도메인? → 주요 에이전트 활성화
├─ 다중 도메인? → 전문가 에이전트 조정
├─ 복잡한 시스템? → system-architect 감독 추가
├─ 품질 중요? → security + performance + quality 에이전트 포함
└─ 학습 중심? → learning-guide + technical-writer 추가
```

---

## 빠른 시작 예제

### 수동 에이전트 호출

```bash
# @agent- 접두사로 특정 에이전트를 명시적으로 호출
@agent-python-expert "이 데이터 처리 파이프라인 최적화해줘"
@agent-quality-engineer "종합적인 테스트 스위트 만들어줘"
@agent-technical-writer "이 API를 예제와 함께 문서화해줘"
@agent-socratic-mentor "이 디자인 패턴 설명해줘"
```

### 자동 에이전트 조정

```bash
# 자동 활성화를 트리거하는 명령어들
/sc:implement "속도 제한이 있는 JWT 인증"
# → 트리거: security-engineer + backend-architect + quality-engineer

/sc:design "문서화된 접근성 있는 React 대시보드"
# → 트리거: frontend-architect + learning-guide + technical-writer

/sc:troubleshoot "간헐적 실패가 있는 느린 배포 파이프라인"
# → 트리거: devops-architect + performance-engineer + root-cause-analyst

/sc:audit "결제 처리 보안 취약점"
# → 트리거: security-engineer + quality-engineer + refactoring-expert
```

### 수동과 자동 접근 방식 결합

```bash
# 명령어로 시작 (자동 활성화)
/sc:implement "사용자 프로필 시스템"

# 그 다음 명시적으로 전문가 검토 추가
@agent-security "프로필 시스템의 OWASP 준수 검토해줘"
@agent-performance-engineer "데이터베이스 쿼리 최적화해줘"
```

---

## SuperClaude 에이전트 팀 👥

### 메타 레이어 에이전트 🎯

#### pm-agent 📚

**전문 분야**: 구현을 문서화하고, 실수를 분석하고, 지식 베이스를 지속적으로 유지 관리하는 자기 개선 워크플로우 실행자

**자동 활성화**:

- **구현 후**: 문서화가 필요한 모든 작업 완료 후
- **실수 감지**: 오류나 버그 발생 시 즉시 분석
- **월간 유지 관리**: 정기적인 문서 건강 검토
- **지식 공백**: 문서화가 필요한 패턴이 나타날 때
- **명령어**: `/sc:implement`, `/sc:build`, `/sc:improve` 완료 후 자동 활성화

**기능**:

- **구현 문서화**: 발견된 새로운 패턴, 아키텍처 결정, 엣지 케이스 기록
- **실수 분석**: 근본 원인 분석, 예방 체크리스트, 패턴 식별
- **패턴 인식**: 성공 패턴, 안티패턴, 모범 사례 추출
- **지식 유지 관리**: 월간 검토, 노이즈 감소, 중복 병합, 최신성 업데이트
- **자기 개선 루프**: 모든 경험을 재사용 가능한 지식으로 변환

**PM 에이전트 작동 방식 (메타 레이어)**:

1. **전문가 에이전트가 작업 완료**: Backend-architect가 기능 구현
2. **PM 에이전트 자동 활성화**: 구현 완료 후
3. **문서화**: `docs/`에 패턴, 결정, 엣지 케이스 기록
4. **지식 업데이트**: 전역 패턴 발견 시 CLAUDE.md 업데이트
5. **증거 수집**: 테스트 결과, 스크린샷, 메트릭 링크
6. **학습 통합**: 향후 구현을 위한 교훈 추출

**자기 개선 워크플로우 예제**:

**구현 후 문서화**:
- 시나리오: Backend architect가 JWT 인증을 구현함
- PM 에이전트: 구현 분석 → JWT 패턴 문서화 → `docs/authentication.md` 업데이트 → 보안 결정 기록 → 증거 링크 생성
- 출력: 향후 재사용을 위한 종합적인 인증 패턴 문서

**즉각적인 실수 분석**:
- 시나리오: 직접 Supabase 임포트 사용 (Kong Gateway 우회됨)
- PM 에이전트: 구현 중단 → 근본 원인 분석 → `self-improvement-workflow.md`에 문서화 → 예방 체크리스트 생성 → CLAUDE.md 업데이트
- 출력: 예방 전략과 함께 기록된 실수, 오류 반복 방지

**월간 문서 유지 관리**:
- 시나리오: 매월 1일 월간 검토
- PM 에이전트: 6개월 이상 된 문서 검토 → 사용하지 않는 문서 삭제 → 중복 병합 → 버전 번호 업데이트 → 장황함 줄이기
- 출력: 신선하고, 최소화되고, 고신호 문서 유지 관리

**작업 실행과의 통합**: PM 에이전트는 전문가 에이전트 위의 메타 레이어로 작동:

```
작업 흐름:
1. 사용자 요청 → 자동 활성화가 전문가 에이전트 선택
2. 전문가 에이전트 → 구현 실행 (backend-architect, frontend-architect 등)
3. PM 에이전트 (자동 트리거) → 학습 내용 문서화
4. 지식 베이스 → 패턴, 실수, 개선 사항으로 업데이트
```

**함께 잘 작동하는 에이전트**: 모든 에이전트 (그들의 작업을 문서화함, 대체하지 않음)

**품질 기준**:

- **최신**: 모든 문서에 마지막 확인 날짜
- **최소화**: 필요한 정보만, 장황함 없음
- **명확**: 구체적인 예제와 복사-붙여넣기 가능한 코드
- **실용적**: 실제 작업에 즉시 적용 가능

**자기 개선 루프 단계**:

- **AFTER 단계**: 주요 책임 - 구현 문서화, `docs/` 업데이트, 증거 생성
- **실수 복구**: 즉시 중단, 근본 원인 분석, 문서 업데이트
- **유지 관리**: 월간 정리, 병합, 최신성 업데이트, 노이즈 감소

**검증**: 문서화가 필요한 작업 완료 후 자동 활성화
**테스트**: backend-architect가 기능을 구현한 후 패턴을 문서화해야 함
**확인**: 실수가 감지되면 예방 체크리스트를 생성해야 함

---

### 아키텍처 및 시스템 설계 에이전트 🏗️

#### system-architect 🏢

**전문 분야**: 확장성과 서비스 아키텍처에 초점을 맞춘 대규모 분산 시스템 설계

**자동 활성화**:

- **키워드**: "아키텍처", "마이크로서비스", "확장성", "시스템 설계", "분산"
- **컨텍스트**: 멀티 서비스 시스템, 아키텍처 결정, 기술 선택
- **복잡성**: 5개 이상의 컴포넌트 또는 교차 도메인 통합 요구 사항

**기능**:

- 서비스 경계 정의 및 마이크로서비스 분해
- 기술 스택 선택 및 통합 전략
- 확장성 계획 및 성능 아키텍처
- 이벤트 기반 아키텍처 및 메시징 패턴
- 데이터 흐름 설계 및 시스템 통합

**예제**:

- **전자상거래 플랫폼**: 이벤트 소싱을 사용하여 사용자, 제품, 결제, 알림 서비스를 위한 마이크로서비스 설계
- **실시간 분석**: 스트림 처리 및 시계열 저장소를 통한 고처리량 데이터 수집 아키텍처
- **멀티 테넌트 SaaS**: 테넌트 격리, 공유 인프라, 수평 확장 전략을 갖춘 시스템 설계

**성공 기준**:
- ✅ 응답에서 시스템 수준 사고가 명확
- ✅ 서비스 경계 및 통합 패턴 언급
- ✅ 확장성 및 안정성 고려 사항 포함
- ✅ 기술 스택 권장 사항 제공

**검증**: `/sc:design "마이크로서비스 플랫폼"`은 system-architect를 활성화해야 함
**테스트**: 출력에 서비스 분해 및 통합 패턴이 포함되어야 함
**확인**: 인프라 문제에 대해 devops-architect와 조정해야 함

**함께 잘 작동하는 에이전트**: devops-architect (인프라), performance-engineer (최적화), security-engineer (준수)

---

#### backend-architect ⚙️

**전문 분야**: API 안정성과 데이터 무결성에 중점을 둔 견고한 서버 측 시스템 설계

**자동 활성화**:

- **키워드**: "API", "백엔드", "서버", "데이터베이스", "REST", "GraphQL", "엔드포인트"
- **파일 유형**: API 스펙, 서버 설정, 데이터베이스 스키마
- **컨텍스트**: 서버 측 로직, 데이터 지속성, API 개발

**기능**:

- RESTful 및 GraphQL API 아키텍처와 설계 패턴
- 데이터베이스 스키마 설계 및 쿼리 최적화 전략
- 인증, 권한 부여, 보안 구현
- 오류 처리, 로깅, 모니터링 통합
- 캐싱 전략 및 성능 최적화

**예제**:

- **사용자 관리 API**: 역할 기반 접근 제어 및 속도 제한을 갖춘 JWT 인증
- **결제 처리**: 멱등성과 감사 추적을 갖춘 PCI 준수 트랜잭션 처리
- **콘텐츠 관리**: 캐싱, 페이지네이션, 실시간 알림을 갖춘 RESTful API

**함께 잘 작동하는 에이전트**: security-engineer (인증/보안), performance-engineer (최적화), quality-engineer (테스팅)

---

#### frontend-architect 🎨

**전문 분야**: 접근성과 사용자 경험에 초점을 맞춘 현대적인 웹 애플리케이션 아키텍처

**자동 활성화**:

- **키워드**: "UI", "프론트엔드", "React", "Vue", "Angular", "컴포넌트", "접근성", "반응형"
- **파일 유형**: `.jsx`, `.vue`, `.ts` (프론트엔드), `.css`, `.scss`
- **컨텍스트**: 사용자 인터페이스 개발, 컴포넌트 설계, 클라이언트 측 아키텍처

**기능**:

- 컴포넌트 아키텍처 및 디자인 시스템 구현
- 상태 관리 패턴 (Redux, Zustand, Pinia)
- 접근성 준수 (WCAG 2.1) 및 포용적 설계
- 성능 최적화 및 번들 분석
- 프로그레시브 웹 앱 및 모바일 우선 개발

**예제**:

- **대시보드 인터페이스**: 실시간 업데이트와 반응형 그리드 레이아웃을 갖춘 접근 가능한 데이터 시각화
- **폼 시스템**: 유효성 검사, 오류 처리, 접근성 기능을 갖춘 복잡한 다단계 폼
- **디자인 시스템**: 일관된 스타일링과 상호작용 패턴을 갖춘 재사용 가능한 컴포넌트 라이브러리

**함께 잘 작동하는 에이전트**: learning-guide (사용자 안내), performance-engineer (최적화), quality-engineer (테스팅)

---

#### devops-architect 🚀

**전문 분야**: 안정적인 소프트웨어 제공을 위한 인프라 자동화 및 배포 파이프라인 설계

**자동 활성화**:

- **키워드**: "배포", "CI/CD", "Docker", "Kubernetes", "인프라", "모니터링", "파이프라인"
- **파일 유형**: Dockerfile, docker-compose.yml, k8s 매니페스트, CI 설정
- **컨텍스트**: 배포 프로세스, 인프라 관리, 자동화

**기능**:

- 자동화된 테스트 및 배포를 갖춘 CI/CD 파이프라인 설계
- 컨테이너 오케스트레이션 및 Kubernetes 클러스터 관리
- Terraform 및 클라우드 플랫폼을 사용한 Infrastructure as Code
- 모니터링, 로깅, 관찰 가능성 스택 구현
- 보안 스캐닝 및 준수 자동화

**예제**:

- **마이크로서비스 배포**: 서비스 메시, 자동 확장, 블루-그린 릴리스를 갖춘 Kubernetes 배포
- **다중 환경 파이프라인**: 자동화된 테스트, 보안 스캐닝, 단계별 배포를 갖춘 GitOps 워크플로우
- **모니터링 스택**: 메트릭, 로그, 트레이스, 알림 시스템을 갖춘 종합적인 관찰 가능성

**함께 잘 작동하는 에이전트**: system-architect (인프라 계획), security-engineer (준수), performance-engineer (모니터링)

---

#### deep-research-agent 🔬

**전문 분야**: 적응형 전략과 다단계 추론을 갖춘 종합적인 연구

**자동 활성화**:

- **키워드**: "연구", "조사", "발견", "탐색", "알아내기", "검색", "최신", "현재"
- **명령어**: `/sc:research`가 자동으로 이 에이전트를 활성화
- **컨텍스트**: 철저한 연구가 필요한 복잡한 쿼리, 현재 정보 요구, 사실 확인
- **복잡성**: 여러 도메인에 걸치거나 반복적 탐색이 필요한 질문

**기능**:

- **적응형 계획 전략**: Planning (직접), Intent (먼저 명확히), Unified (협업)
- **다단계 추론**: 최대 5 레벨 - 엔티티 확장, 시간적 진행, 개념적 심화, 인과 체인
- **자기 성찰 메커니즘**: 각 주요 단계 후 진행 상황 평가 및 재계획 트리거
- **증거 관리**: 명확한 인용, 관련성 점수, 불확실성 인정
- **도구 오케스트레이션**: Tavily (검색), Playwright (JavaScript 콘텐츠), Sequential (추론)을 사용한 병렬 우선 실행
- **학습 통합**: Serena 메모리를 통한 패턴 인식 및 전략 재사용

**연구 깊이 레벨**:

| 레벨 | 설명 |
|------|------|
| Quick | 기본 검색, 1 홉, 요약 출력 |
| Standard | 확장 검색, 2-3 홉, 구조화된 보고서 (기본값) |
| Deep | 종합 검색, 3-4 홉, 상세 분석 |
| Exhaustive | 최대 깊이, 5 홉, 완전한 조사 |

**예제**:

- **기술 연구**: `/sc:research "최신 React Server Components 패턴"` → 구현 예제를 포함한 종합적인 기술 연구
- **시장 분석**: `/sc:research "AI 코딩 어시스턴트 환경 2024" --strategy unified` → 사용자 입력을 통한 협업 분석
- **학술 조사**: `/sc:research "양자 컴퓨팅 돌파구" --depth exhaustive` → 증거 체인을 포함한 종합적인 문헌 검토

**워크플로우 패턴 (6단계)**:

1. **이해 (5-10%)**: 쿼리 복잡성 평가
2. **계획 (10-15%)**: 전략 선택 및 병렬 기회 식별
3. **TodoWrite (5%)**: 적응형 작업 계층 생성 (3-15개 작업)
4. **실행 (50-60%)**: 병렬 검색 및 추출
5. **추적 (지속적)**: 진행 상황 및 신뢰도 모니터링
6. **검증 (10-15%)**: 증거 체인 확인

**출력**: 보고서가 `docs/research/[주제]_[타임스탬프].md`에 저장됨

**함께 잘 작동하는 에이전트**: system-architect (기술 연구), learning-guide (교육 연구), requirements-analyst (시장 연구)

---

### 품질 및 분석 에이전트 🔍

#### security-engineer 🔒

**전문 분야**: 위협 모델링과 취약점 예방에 초점을 맞춘 애플리케이션 보안 아키텍처

**자동 활성화**:

- **키워드**: "보안", "인증", "auth", "취약점", "암호화", "준수", "OWASP"
- **컨텍스트**: 보안 검토, 인증 흐름, 데이터 보호 요구 사항
- **위험 지표**: 결제 처리, 사용자 데이터, API 접근, 규정 준수 요구

**기능**:

- 위협 모델링 및 공격 표면 분석
- 안전한 인증 및 권한 부여 설계 (OAuth, JWT, SAML)
- 데이터 암호화 전략 및 키 관리
- 취약점 평가 및 침투 테스트 가이드
- 보안 준수 (GDPR, HIPAA, PCI-DSS) 구현

**예제**:

- **OAuth 구현**: 토큰 갱신 및 역할 기반 접근을 갖춘 안전한 멀티 테넌트 인증
- **API 보안**: 속도 제한, 입력 유효성 검사, SQL 인젝션 방지, 보안 헤더
- **데이터 보호**: 저장/전송 시 암호화, 키 순환, 프라이버시 바이 디자인 아키텍처

**함께 잘 작동하는 에이전트**: backend-architect (API 보안), quality-engineer (보안 테스팅), root-cause-analyst (인시던트 대응)

---

#### performance-engineer ⚡

**전문 분야**: 확장성과 자원 효율성에 초점을 맞춘 시스템 성능 최적화

**자동 활성화**:

- **키워드**: "성능", "느림", "최적화", "병목", "지연 시간", "메모리", "CPU"
- **컨텍스트**: 성능 문제, 확장성 우려, 자원 제약
- **메트릭**: 응답 시간 >500ms, 높은 메모리 사용량, 낮은 처리량

**기능**:

- 성능 프로파일링 및 병목 식별
- 데이터베이스 쿼리 최적화 및 인덱싱 전략
- 캐싱 구현 (Redis, CDN, 애플리케이션 레벨)
- 부하 테스트 및 용량 계획
- 메모리 관리 및 자원 최적화

**예제**:

- **API 최적화**: 캐싱과 쿼리 최적화를 통해 응답 시간을 2초에서 200ms로 감소
- **데이터베이스 확장**: 읽기 복제본, 연결 풀링, 쿼리 결과 캐싱 구현
- **프론트엔드 성능**: 3초 미만 로드 시간을 위한 번들 최적화, 지연 로딩, CDN 구현

**함께 잘 작동하는 에이전트**: system-architect (확장성), devops-architect (인프라), root-cause-analyst (디버깅)

---

#### root-cause-analyst 🔍

**전문 분야**: 증거 기반 분석과 가설 테스트를 사용한 체계적인 문제 조사

**자동 활성화**:

- **키워드**: "버그", "이슈", "문제", "디버깅", "조사", "문제 해결", "오류"
- **컨텍스트**: 시스템 장애, 예상치 못한 동작, 복잡한 다중 컴포넌트 문제
- **복잡성**: 체계적인 조사가 필요한 교차 시스템 문제

**기능**:

- 체계적인 디버깅 방법론 및 근본 원인 분석
- 시스템 간 오류 상관관계 및 종속성 매핑
- 장애 조사를 위한 로그 분석 및 패턴 인식
- 복잡한 문제에 대한 가설 형성 및 테스트
- 인시던트 대응 및 사후 분석 절차

**예제**:

- **데이터베이스 연결 실패**: 연결 풀, 네트워크 타임아웃, 자원 제한에 걸친 간헐적 실패 추적
- **결제 처리 오류**: API 로그, 데이터베이스 상태, 외부 서비스 응답을 통한 트랜잭션 실패 조사
- **성능 저하**: 메트릭 상관관계, 자원 사용량, 코드 변경을 통한 점진적 둔화 분석

**함께 잘 작동하는 에이전트**: performance-engineer (성능 문제), security-engineer (보안 인시던트), quality-engineer (테스팅 실패)

---

#### quality-engineer ✅

**전문 분야**: 자동화와 커버리지에 초점을 맞춘 종합적인 테스트 전략 및 품질 보증

**자동 활성화**:

- **키워드**: "테스트", "테스팅", "품질", "QA", "유효성 검사", "커버리지", "자동화"
- **컨텍스트**: 테스트 계획, 품질 게이트, 유효성 검사 요구 사항
- **품질 우려**: 코드 커버리지 <80%, 누락된 테스트 자동화, 품질 문제

**기능**:

- 테스트 전략 설계 (단위, 통합, e2e, 성능 테스팅)
- 테스트 자동화 프레임워크 구현 및 CI/CD 통합
- 품질 메트릭 정의 및 모니터링 (커버리지, 결함률)
- 엣지 케이스 식별 및 경계 테스트 시나리오
- 접근성 테스트 및 준수 유효성 검사

**예제**:

- **전자상거래 테스팅**: 사용자 흐름, 결제 처리, 재고 관리를 포함하는 종합적인 테스트 스위트
- **API 테스팅**: REST/GraphQL API를 위한 자동화된 계약 테스트, 부하 테스트, 보안 테스트
- **접근성 유효성 검사**: 자동화 및 수동 접근성 감사를 통한 WCAG 2.1 준수 테스트

**함께 잘 작동하는 에이전트**: security-engineer (보안 테스팅), performance-engineer (부하 테스팅), frontend-architect (UI 테스팅)

---

#### refactoring-expert 🔧

**전문 분야**: 체계적인 리팩토링과 기술 부채 관리를 통한 코드 품질 개선

**자동 활성화**:

- **키워드**: "리팩토링", "클린 코드", "기술 부채", "SOLID", "유지 보수성", "코드 스멜"
- **컨텍스트**: 레거시 코드 개선, 아키텍처 업데이트, 코드 품질 문제
- **품질 지표**: 높은 복잡성, 중복 코드, 낮은 테스트 커버리지

**기능**:

- SOLID 원칙 적용 및 디자인 패턴 구현
- 코드 스멜 식별 및 체계적 제거
- 레거시 코드 현대화 전략 및 마이그레이션 계획
- 기술 부채 평가 및 우선순위 프레임워크
- 코드 구조 개선 및 아키텍처 리팩토링

**예제**:

- **레거시 현대화**: 모놀리식 애플리케이션을 향상된 테스트 가능성을 갖춘 모듈식 아키텍처로 변환
- **디자인 패턴**: 결합도 감소 및 확장성 향상을 위한 결제 처리의 Strategy 패턴 구현
- **코드 정리**: 중복 코드 제거, 명명 규칙 개선, 재사용 가능한 컴포넌트 추출

**함께 잘 작동하는 에이전트**: system-architect (아키텍처 개선), quality-engineer (테스팅 전략), python-expert (언어별 패턴)

---

### 전문화된 개발 에이전트 🎯

#### python-expert 🐍

**전문 분야**: 현대적인 프레임워크와 성능에 중점을 둔 프로덕션 레디 Python 개발

**자동 활성화**:

- **키워드**: "Python", "Django", "FastAPI", "Flask", "asyncio", "pandas", "pytest"
- **파일 유형**: `.py`, `requirements.txt`, `pyproject.toml`, `Pipfile`
- **컨텍스트**: Python 개발 작업, API 개발, 데이터 처리, 테스팅

**기능**:

- 현대적인 Python 아키텍처 패턴 및 프레임워크 선택
- asyncio 및 concurrent futures를 사용한 비동기 프로그래밍
- 프로파일링 및 알고리즘 개선을 통한 성능 최적화
- pytest, 픽스처, 테스트 자동화를 사용한 테스팅 전략
- pip, poetry, Docker를 사용한 패키지 관리 및 배포

**예제**:

- **FastAPI 마이크로서비스**: Pydantic 유효성 검사, 의존성 주입, OpenAPI 문서를 갖춘 고성능 비동기 API
- **데이터 파이프라인**: 대규모 데이터셋을 위한 오류 처리, 로깅, 병렬 처리를 갖춘 Pandas 기반 ETL
- **Django 애플리케이션**: 커스텀 사용자 모델, API 엔드포인트, 종합적인 테스트 커버리지를 갖춘 풀스택 웹 앱

**함께 잘 작동하는 에이전트**: backend-architect (API 설계), quality-engineer (테스팅), performance-engineer (최적화)

---

#### requirements-analyst 📝

**전문 분야**: 체계적인 이해관계자 분석을 통한 요구 사항 발견 및 명세 개발

**자동 활성화**:

- **키워드**: "요구 사항", "명세", "PRD", "사용자 스토리", "기능", "범위", "이해관계자"
- **컨텍스트**: 프로젝트 시작, 불명확한 요구 사항, 범위 정의 필요
- **복잡성**: 다중 이해관계자 프로젝트, 불명확한 목표, 상충하는 요구 사항

**기능**:

- 이해관계자 인터뷰 및 워크숍을 통한 요구 사항 도출
- 수용 기준 및 완료 정의를 포함한 사용자 스토리 작성
- 기능적 및 비기능적 명세 문서화
- 이해관계자 분석 및 요구 사항 우선순위 프레임워크
- 범위 관리 및 변경 통제 프로세스

**예제**:

- **제품 요구 사항 문서**: 사용자 페르소나, 기능 명세, 성공 메트릭을 포함한 핀테크 모바일 앱을 위한 종합적인 PRD
- **API 명세**: 오류 처리, 보안, 성능 기준을 포함한 결제 처리 API를 위한 상세 요구 사항
- **마이그레이션 요구 사항**: 데이터 마이그레이션, 사용자 교육, 롤백 절차를 포함한 레거시 시스템 현대화 요구 사항

**함께 잘 작동하는 에이전트**: system-architect (기술적 실현 가능성), technical-writer (문서화), learning-guide (사용자 안내)

---

### 커뮤니케이션 및 학습 에이전트 📚

#### technical-writer 📚

**전문 분야**: 청중 분석과 명확성에 초점을 맞춘 기술 문서화 및 커뮤니케이션

**자동 활성화**:

- **키워드**: "문서화", "readme", "API 문서", "사용자 가이드", "기술 작성", "매뉴얼"
- **컨텍스트**: 문서화 요청, API 문서화, 사용자 가이드, 기술 설명
- **파일 유형**: `.md`, `.rst`, API 스펙, 문서 파일

**기능**:

- 기술 문서화 아키텍처 및 정보 설계
- 다양한 기술 수준을 위한 청중 분석 및 콘텐츠 타겟팅
- 작동하는 예제 및 통합 안내를 포함한 API 문서화
- 단계별 절차 및 문제 해결을 포함한 사용자 가이드 작성
- 접근성 표준 적용 및 포용적 언어 사용

**예제**:

- **API 문서화**: 인증, 엔드포인트, 예제, SDK 통합 가이드를 포함한 종합적인 REST API 문서
- **사용자 매뉴얼**: 스크린샷, 문제 해결, FAQ 섹션을 포함한 단계별 설치 및 구성 가이드
- **기술 명세**: 다이어그램, 데이터 흐름, 구현 세부 사항을 포함한 시스템 아키텍처 문서화

**함께 잘 작동하는 에이전트**: requirements-analyst (명세 명확성), learning-guide (교육 콘텐츠), frontend-architect (UI 문서화)

---

#### learning-guide 🎓

**전문 분야**: 기술 개발과 멘토십에 초점을 맞춘 교육 콘텐츠 설계 및 점진적 학습

**자동 활성화**:

- **키워드**: "설명", "학습", "튜토리얼", "초보자", "교육", "훈련"
- **컨텍스트**: 교육 요청, 개념 설명, 기술 개발, 학습 경로
- **복잡성**: 단계별 분해 및 점진적 이해가 필요한 복잡한 주제

**기능**:

- 점진적 기술 개발을 포함한 학습 경로 설계
- 유추 및 예제를 통한 복잡한 개념 설명
- 실습 연습을 포함한 대화형 튜토리얼 작성
- 기술 평가 및 역량 평가 프레임워크
- 멘토십 전략 및 개인화된 학습 접근 방식

**예제**:

- **프로그래밍 튜토리얼**: 실습 연습, 코드 예제, 점진적 복잡성을 포함한 대화형 React 튜토리얼
- **개념 설명**: 시각적 다이어그램과 연습 문제를 포함한 실제 예제를 통한 데이터베이스 정규화 설명
- **기술 평가**: 실용적인 프로젝트와 피드백을 포함한 풀스택 개발을 위한 종합적인 평가 프레임워크

**함께 잘 작동하는 에이전트**: technical-writer (교육 문서화), frontend-architect (대화형 학습), requirements-analyst (학습 목표)

---

## 에이전트 조정 및 통합 🤝

### 조정 패턴

**아키텍처 팀**:

- **풀스택 개발**: frontend-architect + backend-architect + security-engineer + quality-engineer
- **시스템 설계**: system-architect + devops-architect + performance-engineer + security-engineer
- **레거시 현대화**: refactoring-expert + system-architect + quality-engineer + technical-writer

**품질 팀**:

- **보안 감사**: security-engineer + quality-engineer + root-cause-analyst + requirements-analyst
- **성능 최적화**: performance-engineer + system-architect + devops-architect + root-cause-analyst
- **테스팅 전략**: quality-engineer + security-engineer + performance-engineer + frontend-architect

**커뮤니케이션 팀**:

- **문서화 프로젝트**: technical-writer + requirements-analyst + learning-guide + 도메인 전문가
- **학습 플랫폼**: learning-guide + frontend-architect + technical-writer + quality-engineer
- **API 문서화**: backend-architect + technical-writer + security-engineer + quality-engineer

### MCP 서버 통합

**MCP 서버를 통한 향상된 기능**:

| MCP 서버 | 기능 | 관련 에이전트 |
|----------|------|---------------|
| Context7 | 공식 문서 패턴 | 모든 아키텍트 및 전문가 |
| Sequential | 다단계 분석 | root-cause-analyst, system-architect, performance-engineer |
| Magic | UI 생성 | frontend-architect, learning-guide 대화형 콘텐츠 |
| Playwright | 브라우저 테스팅 | quality-engineer, frontend-architect 접근성 유효성 검사 |
| Morphllm | 코드 변환 | refactoring-expert, python-expert 대량 변경 |
| Serena | 프로젝트 메모리 | 모든 에이전트, 세션 간 컨텍스트 보존 |

---

## 문제 해결

### 일반적인 문제

| 문제 | 해결 방법 |
|------|----------|
| 에이전트가 활성화되지 않음 | 도메인 키워드 사용: "security", "performance", "frontend" |
| 잘못된 에이전트 선택됨 | 에이전트 문서에서 트리거 키워드 확인 |
| 너무 많은 에이전트 | 주요 도메인에 키워드 집중 또는 `/sc:focus [도메인]` 사용 |
| 에이전트가 조정되지 않음 | 작업 복잡성 증가 또는 다중 도메인 키워드 사용 |
| 에이전트 전문성 불일치 | 더 구체적인 기술 용어 사용 |

### 즉각적인 해결책

- **강제 에이전트 활성화**: 요청에 명시적인 도메인 키워드 사용
- **에이전트 선택 재설정**: Claude Code 세션 재시작으로 에이전트 상태 리셋
- **에이전트 패턴 확인**: 에이전트 문서에서 트리거 키워드 검토
- **기본 활성화 테스트**: `/sc:implement "security auth"`로 security-engineer 테스트

### 에이전트별 문제 해결

**보안 에이전트가 없을 때**:

```bash
# 문제: 보안 우려가 security-engineer를 트리거하지 않음
# 빠른 해결: 명시적인 보안 키워드 사용
"인증 구현"                    # 일반적 - 트리거되지 않을 수 있음
"JWT 인증 보안 구현"            # 명시적 - security-engineer 트리거
"암호화를 사용한 안전한 사용자 로그인"  # 보안 중심 - security-engineer 트리거
```

**성능 에이전트가 없을 때**:

```bash
# 문제: 성능 문제가 performance-engineer를 트리거하지 않음
# 빠른 해결: 성능별 용어 사용
"더 빠르게 만들어줘"             # 모호함 - 트리거되지 않을 수 있음
"느린 데이터베이스 쿼리 최적화"    # 구체적 - performance-engineer 트리거
"API 지연 시간 및 병목 감소"     # 성능 중심 - performance-engineer 트리거
```

**아키텍처 에이전트가 없을 때**:

```bash
# 문제: 시스템 설계가 아키텍처 에이전트를 트리거하지 않음
# 빠른 해결: 아키텍처 키워드 사용
"앱 만들어줘"                   # 일반적 - 기본 에이전트 트리거
"마이크로서비스 아키텍처 설계"     # 구체적 - system-architect 트리거
"확장 가능한 분산 시스템 설계"    # 아키텍처 중심 - system-architect 트리거
```

**잘못된 에이전트 조합일 때**:

```bash
# 문제: 백엔드 작업에 프론트엔드 에이전트가 나옴
# 빠른 해결: 도메인별 용어 사용
"사용자 인터페이스 생성"         # frontend-architect를 트리거할 수 있음
"REST API 엔드포인트 생성"      # 구체적 - backend-architect 트리거
"서버 측 인증 구현"             # 백엔드 중심 - backend-architect 트리거
```

### 성공 검증

에이전트 수정을 적용한 후 다음을 테스트하세요:

- ✅ 도메인별 요청이 올바른 에이전트를 활성화 (security → security-engineer)
- ✅ 복잡한 작업이 다중 에이전트 조정을 트리거 (3개 이상 에이전트)
- ✅ 에이전트 전문성이 작업 요구 사항과 일치 (API → backend-architect)
- ✅ 품질 에이전트가 적절할 때 자동 포함 (보안, 성능, 테스팅)
- ✅ 응답이 도메인 전문성과 전문화된 지식을 보여줌

---

## 빠른 참조 📋

### 에이전트 트리거 조회

| 트리거 유형 | 키워드/패턴 | 활성화되는 에이전트 |
|------------|------------|-------------------|
| 보안 | "auth", "security", "vulnerability", "encryption" | security-engineer |
| 성능 | "slow", "optimization", "bottleneck", "latency" | performance-engineer |
| 프론트엔드 | "UI", "React", "Vue", "component", "responsive" | frontend-architect |
| 백엔드 | "API", "server", "database", "REST", "GraphQL" | backend-architect |
| 테스팅 | "test", "QA", "validation", "coverage" | quality-engineer |
| DevOps | "deploy", "CI/CD", "Docker", "Kubernetes" | devops-architect |
| 아키텍처 | "architecture", "microservices", "scalability" | system-architect |
| Python | ".py", "Django", "FastAPI", "asyncio" | python-expert |
| 문제 | "bug", "issue", "debugging", "troubleshoot" | root-cause-analyst |
| 코드 품질 | "refactor", "clean code", "technical debt" | refactoring-expert |
| 문서화 | "documentation", "readme", "API docs" | technical-writer |
| 학습 | "explain", "tutorial", "beginner", "teaching" | learning-guide |
| 요구사항 | "requirements", "PRD", "specification" | requirements-analyst |
| 연구 | "research", "investigate", "latest", "current" | deep-research-agent |

### 명령어-에이전트 매핑

| 명령어 | 주요 에이전트 | 지원 에이전트 |
|--------|--------------|--------------|
| /sc:implement | 도메인 아키텍트 (frontend, backend) | security-engineer, quality-engineer |
| /sc:analyze | quality-engineer, security-engineer | performance-engineer, root-cause-analyst |
| /sc:troubleshoot | root-cause-analyst | 도메인 전문가, performance-engineer |
| /sc:improve | refactoring-expert | quality-engineer, performance-engineer |
| /sc:document | technical-writer | 도메인 전문가, learning-guide |
| /sc:design | system-architect | 도메인 아키텍트, requirements-analyst |
| /sc:test | quality-engineer | security-engineer, performance-engineer |
| /sc:explain | learning-guide | technical-writer, 도메인 전문가 |
| /sc:research | deep-research-agent | 기술 전문가, learning-guide |

### 효과적인 에이전트 조합

**개발 워크플로우**:

- **웹 애플리케이션**: frontend-architect + backend-architect + security-engineer + quality-engineer + devops-architect
- **API 개발**: backend-architect + security-engineer + technical-writer + quality-engineer
- **데이터 플랫폼**: python-expert + performance-engineer + security-engineer + system-architect

**분석 워크플로우**:

- **보안 감사**: security-engineer + quality-engineer + root-cause-analyst + technical-writer
- **성능 조사**: performance-engineer + root-cause-analyst + system-architect + devops-architect
- **레거시 평가**: refactoring-expert + system-architect + quality-engineer + security-engineer + technical-writer

**커뮤니케이션 워크플로우**:

- **기술 문서화**: technical-writer + requirements-analyst + 도메인 전문가 + learning-guide
- **교육 콘텐츠**: learning-guide + technical-writer + frontend-architect + quality-engineer

---

## 모범 사례 💡

### 시작하기 (간단한 접근 방식)

**자연어 먼저**:

1. **목표 설명**: 도메인별 키워드와 함께 자연어 사용
2. **자동 활성화 신뢰**: 시스템이 자동으로 적절한 에이전트에 라우팅하도록 함
3. **패턴에서 학습**: 어떤 요청 유형에 어떤 에이전트가 활성화되는지 관찰
4. **반복하고 개선**: 추가 전문가 에이전트를 활성화하기 위해 구체성 추가

### 에이전트 선택 최적화

**효과적인 키워드 사용**:

- **구체적 > 일반적**: security-engineer를 위해 "login" 대신 "authentication" 사용
- **기술 용어**: 프레임워크 이름, 기술, 구체적인 과제 포함
- **컨텍스트 단서**: 파일 유형, 프로젝트 범위, 복잡성 지표 언급
- **품질 키워드**: 종합적인 커버리지를 위해 "security", "performance", "accessibility" 추가

**요청 최적화 예제**:

```bash
# 일반적 (제한된 에이전트 활성화)
"로그인 기능 수정해줘"

# 최적화 (다중 에이전트 조정)
"속도 제한과 접근성 준수를 갖춘 안전한 JWT 인증 구현"
# → 트리거: security-engineer + backend-architect + frontend-architect + quality-engineer
```

### 일반적인 사용 패턴

**개발 워크플로우**:

```bash
# 풀스택 기능 개발
/sc:implement "실시간 알림을 갖춘 반응형 사용자 대시보드"
# → frontend-architect + backend-architect + performance-engineer

# 문서화를 포함한 API 개발
/sc:create "종합적인 문서를 갖춘 결제 처리 REST API"
# → backend-architect + security-engineer + technical-writer + quality-engineer

# 성능 최적화 조사
/sc:troubleshoot "사용자 경험에 영향을 미치는 느린 데이터베이스 쿼리"
# → performance-engineer + root-cause-analyst + backend-architect
```

**분석 워크플로우**:

```bash
# 보안 평가
/sc:analyze "GDPR 준수 취약점에 대한 인증 시스템"
# → security-engineer + quality-engineer + requirements-analyst

# 코드 품질 검토
/sc:review "현대화 기회를 위한 레거시 코드베이스"
# → refactoring-expert + system-architect + quality-engineer + technical-writer

# 학습 및 설명
/sc:explain "실습 예제를 포함한 마이크로서비스 패턴"
# → system-architect + learning-guide + technical-writer
```

### 고급 에이전트 조정

**다중 도메인 프로젝트**:

1. **광범위하게 시작**: 아키텍처 에이전트를 활성화하기 위해 시스템 수준 키워드로 시작
2. **구체성 추가**: 전문가 에이전트를 활성화하기 위해 도메인별 요구 사항 포함
3. **품질 통합**: 보안, 성능, 테스팅 관점을 자동으로 포함
4. **문서화 포함**: 종합적인 커버리지를 위해 학습 또는 문서화 요구 사항 추가

**에이전트 선택 문제 해결**:

| 문제 | 해결 방법 | 예제 |
|------|----------|------|
| 잘못된 에이전트 활성화 | 더 구체적인 도메인 용어 사용 | "database optimization" → performance-engineer + backend-architect |
| 에이전트 부족 | 복잡성 지표와 교차 도메인 키워드 증가 | 요청에 "security", "performance", "documentation" 추가 |
| 에이전트 과다 | 구체적인 기술 용어로 주요 도메인에 집중 | "/sc:focus backend" 사용으로 범위 제한 |

### 품질 중심 개발

- **보안 우선 접근**: 개발 요청에 항상 보안 고려 사항을 포함하여 도메인 전문가와 함께 security-engineer가 자동으로 활성화되도록 함
- **성능 통합**: 처음부터 performance-engineer 조정을 보장하기 위해 성능 키워드 ("fast", "efficient", "scalable") 포함
- **접근성 준수**: 프론트엔드 개발에서 접근성 유효성 검사를 자동으로 포함하기 위해 "accessible", "WCAG", "inclusive" 사용
- **문서화 문화**: 자동 technical-writer 포함 및 지식 전달을 위해 요청에 "documented", "explained", "tutorial" 추가

---

## 에이전트 지능 이해하기 🧠

### 에이전트를 효과적으로 만드는 것

- **도메인 전문성**: 각 에이전트는 해당 도메인에 특화된 지식 패턴, 행동 접근 방식, 문제 해결 방법론을 가짐
- **컨텍스트 활성화**: 에이전트는 키워드뿐만 아니라 요청 컨텍스트를 분석하여 관련성과 활성화 수준을 결정
- **협업 지능**: 다중 에이전트 조정은 개별 에이전트 능력을 초과하는 시너지 결과를 생성
- **적응형 학습**: 에이전트 선택은 요청 패턴과 성공적인 조정 결과를 기반으로 개선

### 에이전트 vs 전통적 AI

| 전통적 접근 | 에이전트 접근 |
|------------|--------------|
| 단일 AI가 다양한 수준의 전문성으로 모든 도메인 처리 | 전문화된 전문가가 깊은 도메인 지식과 집중된 문제 해결로 협업 |

**장점**:

- 도메인별 작업에서 더 높은 정확도
- 더 정교한 문제 해결 방법론
- 전문가 검토를 통한 더 나은 품질 보증
- 조정된 다중 관점 분석

### 시스템 신뢰, 패턴 이해

**기대할 수 있는 것**:

- 적절한 도메인 전문가에게 자동 라우팅
- 복잡한 작업을 위한 다중 에이전트 조정
- 자동 QA 에이전트 포함을 통한 품질 통합
- 교육 에이전트 활성화를 통한 학습 기회

**걱정하지 않아도 되는 것**:

- 수동 에이전트 선택 또는 구성
- 복잡한 라우팅 규칙 또는 에이전트 관리
- 에이전트 구성 또는 조정
- 에이전트 상호작용 마이크로매니징

---

## 관련 리소스 📚

### 필수 문서

- **Commands Guide** - 최적의 에이전트 조정을 트리거하는 SuperClaude 명령어 마스터
- **MCP Servers** - 전문 도구 통합을 통한 향상된 에이전트 기능
- **Session Management** - 지속적인 에이전트 컨텍스트를 갖춘 장기 워크플로우

### 고급 사용

- **Behavioral Modes** - 향상된 에이전트 조정을 위한 컨텍스트 최적화
- **Getting Started** - 에이전트 최적화를 위한 전문가 기술
- **Examples Cookbook** - 실제 에이전트 조정 패턴

### 개발 리소스

- **Technical Architecture** - SuperClaude의 에이전트 시스템 설계 이해
- **Contributing** - 에이전트 기능 및 조정 패턴 확장

---

## 당신의 에이전트 여정 🚀

### 1주차: 자연스러운 사용

자연어 설명으로 시작하세요. 어떤 에이전트가 왜 활성화되는지 관찰하세요. 과정을 과도하게 생각하지 않고 키워드 패턴에 대한 직관을 구축하세요.

### 2-3주차: 패턴 인식

에이전트 조정 패턴을 관찰하세요. 복잡성과 도메인 키워드가 에이전트 선택에 어떤 영향을 미치는지 이해하세요. 더 나은 조정을 위해 요청 표현을 최적화하기 시작하세요.

### 2개월 이후: 전문가 조정

최적의 에이전트 조합을 트리거하는 다중 도메인 요청을 마스터하세요. 효과적인 에이전트 선택을 위한 문제 해결 기술을 활용하세요. 복잡한 워크플로우를 위한 고급 패턴을 사용하세요.

---

## SuperClaude의 장점

간단하고 자연스러운 언어 요청을 통해 조정된 응답으로 작동하는 14명의 전문화된 AI 전문가의 힘을 경험하세요. 구성 없음, 관리 없음, 당신의 필요에 따라 확장되는 지능적인 협업만 있습니다.

🎯 **지능적인 에이전트 조정을 경험할 준비가 되셨나요?** `/sc:implement`로 시작하여 전문화된 AI 협업의 마법을 발견하세요.
