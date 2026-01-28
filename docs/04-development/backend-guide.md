# 백엔드 개발 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

Spring Boot + Kotlin 백엔드 개발 가이드입니다.

---

## 1. 기술 스택

| 항목 | 기술 |
|------|------|
| 언어 | Kotlin 1.9 |
| 프레임워크 | Spring Boot 3.2.2 |
| 빌드 | Gradle (Kotlin DSL) |
| DB | PostgreSQL 16 + Flyway |
| 인증 | JWT (Spring Security) |
| 테스트 | JUnit 5 + MockK + TestContainers |

---

## 2. 프로젝트 구조 (DDD)

```
backend-spring/
├── api/                    # API 계층
│   └── src/main/kotlin/com/paytools/api/
│       ├── controller/     # REST Controller
│       └── dto/            # Request/Response DTO
├── domain/                 # 도메인 계층 (외부 의존성 없음)
│   └── src/main/kotlin/com/paytools/domain/
│       ├── model/          # 도메인 모델 (Employee, WorkShift)
│       ├── vo/             # 값 객체 (Money, WorkingHours)
│       └── service/        # 도메인 서비스
├── infrastructure/         # 인프라 계층
│   └── src/main/kotlin/com/paytools/infrastructure/
│       ├── entity/         # JPA Entity
│       ├── repository/     # JPA Repository
│       └── security/       # JWT, Spring Security
└── common/                 # 공통 유틸
```

---

## 3. 도메인 모델 규칙

### 3.1 값 객체 (Value Object)

**Money 객체**:
```kotlin
data class Money(val amount: BigDecimal) {
    fun roundToWon(): Money {
        return Money(amount.setScale(0, RoundingMode.HALF_UP))
    }

    operator fun plus(other: Money): Money = Money(amount + other.amount)
    operator fun minus(other: Money): Money = Money(amount - other.amount)
}
```

**규칙**:
- 모든 금액은 `Money` 객체로 처리
- 계산 후 반드시 `roundToWon()` 호출
- 불변 객체로 유지

### 3.2 도메인 서비스

```kotlin
// 순수 함수로 작성
fun calculateInsurance(salary: Money, rates: InsuranceRates): InsuranceResult {
    // 사이드 이펙트 없음
    return InsuranceResult(...)
}
```

---

## 4. Controller 작성 규칙

### 4.1 기본 구조

```kotlin
@Tag(name = "급여 계산", description = "급여 계산 API")
@RestController
@RequestMapping("/api/v1/salary")
class SalaryController(
    private val salaryService: SalaryService
) {
    @Operation(summary = "급여 계산")
    @PostMapping("/calculate")
    fun calculate(@Valid @RequestBody request: SalaryRequest): ResponseEntity<SalaryResponse> {
        val result = salaryService.calculate(request)
        return ResponseEntity.ok(result)
    }
}
```

### 4.2 규칙

- `@Tag`, `@Operation`으로 Swagger 문서화
- `@Valid`로 입력 검증
- 비즈니스 로직은 Service에 위임
- 200줄 이하 유지

---

## 5. DTO 작성 규칙

### 5.1 Request DTO

```kotlin
data class SalaryRequest(
    @field:NotNull
    @JsonProperty("employee")
    val employee: EmployeeDto,

    @JsonProperty("calculation_month")
    val calculationMonth: String
)
```

### 5.2 Response DTO

```kotlin
data class SalaryResponse(
    @JsonProperty("net_salary")
    val netSalary: Long,

    @JsonProperty("deductions")
    val deductions: DeductionsDto
)
```

### 5.3 필드명 규칙

- JSON: snake_case (`net_salary`)
- Kotlin: camelCase (`netSalary`)
- `@JsonProperty`로 매핑

---

## 6. 테스트 작성 규칙

### 6.1 통합 테스트

```kotlin
@SpringBootTest
@AutoConfigureMockMvc
class SalaryControllerTest {
    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `급여 계산 - 정상 케이스`() {
        mockMvc.perform(
            post("/api/v1/salary/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
        )
        .andExpect(status().isOk)
        .andExpect(jsonPath("$.net_salary").exists())
    }
}
```

### 6.2 필수 테스트 시나리오

- [ ] 풀타임 주5일 근무
- [ ] 주6일 근무 (주휴수당)
- [ ] 단시간 근로
- [ ] 야간근로 (22:00~06:00)
- [ ] 휴일근로
- [ ] 5인 미만 사업장
- [ ] 최저임금 미달

---

## 7. 법적 계산 규칙 (2026년)

### 7.1 4대 보험료율

| 항목 | 요율 | 상한 |
|------|------|------|
| 국민연금 | 4.75% | 590만원 |
| 건강보험 | 3.595% | - |
| 장기요양 | 건강보험 × 13.14% | - |
| 고용보험 | 0.9% | 1350만원 |

### 7.2 통상시급 계산

```kotlin
// 174시간 기준 (주휴수당 제외)
val hourlyWage = baseSalary / 174
```

### 7.3 가산수당

| 유형 | 가산율 |
|------|--------|
| 연장근로 | 1.5배 |
| 야간근로 | 0.5배 (가산분) |
| 휴일근로 | 1.5배 (8시간 이하) |
| 휴일근로 8시간 초과 | 2.0배 (5인 이상만) |

---

## 8. 보안 규칙

### 8.1 SecurityConfig

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/api/v1/auth/**").permitAll()
        .requestMatchers("/api/v1/salary/**").permitAll()
        .anyRequest().authenticated()
}
```

### 8.2 JWT 토큰

- Access Token: 1시간
- Refresh Token: 7일
- BCrypt로 비밀번호 암호화

---

## 9. 코딩 규칙

### 9.1 파일 크기

- 200줄 이하 권장
- God Object 방지

### 9.2 주석

```kotlin
/**
 * 급여 계산 오케스트레이터
 * @see 근로기준법 제56조 (가산수당)
 */
```

### 9.3 예외 처리

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(ValidationException::class)
    fun handleValidation(e: ValidationException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.badRequest().body(ErrorResponse(e.message))
    }
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 최초 작성 |
