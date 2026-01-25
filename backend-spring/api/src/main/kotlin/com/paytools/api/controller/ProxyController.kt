package com.paytools.api.controller

import com.paytools.infrastructure.proxy.PythonProxyService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.io.BufferedReader

/**
 * Python FastAPI 서버로 요청을 프록시하는 컨트롤러
 * 1단계 게이트웨이: 급여계산, 보험, 세금 API를 Python으로 전달
 */
@RestController
@RequestMapping("/api/v1")
class ProxyController(
    private val pythonProxyService: PythonProxyService
) {

    /**
     * 급여 계산 API 프록시
     */
    @PostMapping("/salary/calculate", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxySalaryCalculate(
        @RequestBody body: String,
        request: HttpServletRequest
    ): Mono<ResponseEntity<String>> {
        return pythonProxyService.post("/api/v1/salary/calculate", body)
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * 역산 계산 API 프록시
     */
    @PostMapping("/salary/reverse-calculate", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxyReverseCalculate(
        @RequestBody body: String
    ): Mono<ResponseEntity<String>> {
        return pythonProxyService.post("/api/v1/salary/reverse-calculate", body)
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * 보험료 조회 API 프록시
     */
    @GetMapping("/insurance/rates", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxyInsuranceRates(): Mono<ResponseEntity<String>> {
        return pythonProxyService.get("/api/v1/insurance/rates")
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * 보험료 계산 API 프록시
     */
    @PostMapping("/insurance/calculate", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxyInsuranceCalculate(
        @RequestBody body: String
    ): Mono<ResponseEntity<String>> {
        return pythonProxyService.post("/api/v1/insurance/calculate", body)
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * 세금 계산 API 프록시
     */
    @PostMapping("/tax/estimate", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxyTaxEstimate(
        @RequestBody body: String
    ): Mono<ResponseEntity<String>> {
        return pythonProxyService.post("/api/v1/tax/estimate", body)
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * 연간 세금 계산 API 프록시
     */
    @PostMapping("/tax/estimate-annual", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun proxyTaxEstimateAnnual(
        @RequestBody body: String
    ): Mono<ResponseEntity<String>> {
        return pythonProxyService.post("/api/v1/tax/estimate-annual", body)
            .map { ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(it) }
    }

    /**
     * Python 서버 헬스체크
     */
    @GetMapping("/proxy/health")
    fun proxyHealth(): Mono<ResponseEntity<Map<String, Any>>> {
        return pythonProxyService.healthCheck()
            .map { healthy ->
                ResponseEntity.ok(mapOf(
                    "python_server" to if (healthy) "UP" else "DOWN",
                    "proxy" to "ENABLED"
                ))
            }
    }
}