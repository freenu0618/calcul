# Paytools Documentation Hub

**급여 계산기 프로젝트 문서 허브**

| 항목 | 내용 |
|------|------|
| 서비스 URL | https://paytools.work |
| API URL | https://calcul-production.up.railway.app |
| 기술 스택 | Kotlin + Spring Boot / React + TypeScript |

---

## Quick Links

- [API 레퍼런스](./03-architecture/api-reference.md)
- [배포 가이드](./05-deployment/deployment-guide.md)
- [트러블슈팅](./06-operations/troubleshooting.md)

---

## 문서 카테고리

### 01. 비즈니스 (`01-business/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| service-overview.md | 서비스 개요 | 예정 |
| pricing-policy.md | 요금제 정책 | 예정 |
| roadmap.md | 제품 로드맵 | 예정 |

### 02. 법적 문서 (`02-legal/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| privacy-policy.md | 개인정보처리방침 | 예정 |
| terms-of-service.md | 이용약관 | 예정 |
| disclaimer.md | 면책 조항 | 예정 |

### 03. 아키텍처 (`03-architecture/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| [api-reference.md](./03-architecture/api-reference.md) | API 레퍼런스 | 완료 |
| [database-schema.md](./03-architecture/database-schema.md) | DB 스키마 | 완료 |
| [nfr-performance.md](./03-architecture/nfr-performance.md) | 성능 요구사항 | 완료 |
| [AI_CHATBOT_ARCHITECTURE.md](./03-architecture/AI_CHATBOT_ARCHITECTURE.md) | AI 챗봇 설계 | 완료 |

### 04. 개발 가이드 (`04-development/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| [testing-guide.md](./04-development/testing-guide.md) | 테스트 가이드 | 완료 |
| [component-employee-form.md](./04-development/component-employee-form.md) | 직원 폼 컴포넌트 | 완료 |
| getting-started.md | 시작 가이드 | 예정 |
| backend-guide.md | 백엔드 가이드 | 예정 |
| frontend-guide.md | 프론트엔드 가이드 | 예정 |

### 05. 배포 (`05-deployment/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| [deployment-guide.md](./05-deployment/deployment-guide.md) | 통합 배포 가이드 | 완료 |

### 06. 운영 (`06-operations/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| [troubleshooting.md](./06-operations/troubleshooting.md) | 트러블슈팅 | 완료 |
| monitoring-guide.md | 모니터링 가이드 | 예정 |
| incident-response.md | 장애 대응 가이드 | 예정 |

### 07. 기획 (`07-planning/`)
| 문서 | 설명 | 상태 |
|------|------|------|
| [project-analysis.md](./07-planning/project-analysis.md) | 프로젝트 분석 | 완료 |
| [prd-payroll-ledger.md](./07-planning/prd-payroll-ledger.md) | 급여대장 PRD | 완료 |
| [todo-list.md](./07-planning/todo-list.md) | 작업 목록 | 완료 |
| [NEXT_PHASE_WORKFLOW.md](./07-planning/NEXT_PHASE_WORKFLOW.md) | 다음 단계 계획 | 완료 |

### Archive (`archive/`)
더 이상 사용하지 않는 문서들

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **백엔드** | Kotlin 1.9 + Spring Boot 3.2.2 |
| **프론트엔드** | React 19 + TypeScript + Tailwind CSS |
| **데이터베이스** | PostgreSQL 16 + pgvector |
| **배포** | Railway (백엔드) + Cloudflare Pages (프론트엔드) |
| **인증** | JWT (Spring Security) |

---

## 프로젝트 규칙

상세 개발 가이드는 프로젝트 루트의 [CLAUDE.md](../CLAUDE.md) 참조

### 핵심 원칙
- **법적 정확성 > 기능 풍부함**
- 모든 금액은 `Money` 객체로 처리 (원 단위 반올림)
- 파일당 200줄 이하 (God Object 방지)

### 법적 계산 규칙 (2026년)
- 국민연금: 4.75% (상한 590만원)
- 건강보험: 3.595%
- 장기요양: 건강보험료 × 13.14%
- 고용보험: 0.9%

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| 백엔드 배포 | ✅ Railway 운영 중 |
| 프론트엔드 배포 | ✅ Cloudflare Pages 운영 중 |
| 테스트 | ✅ 20개 통합 테스트 통과 |
| Phase | 3.5 완료 (근무자 등록 시스템) |

---

*최종 수정: 2026-01-28*
