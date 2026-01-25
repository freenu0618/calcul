package com.paytools.infrastructure.proxy

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Mono
import java.time.Duration

private val logger = KotlinLogging.logger {}

/**
 * Python FastAPI 서버로 요청을 프록시하는 서비스
 * 1단계 게이트웨이: Spring Boot가 인증 후 Python으로 급여계산 요청 전달
 */
@Service
class PythonProxyService(
    @Value("\${python.proxy.base-url}") private val baseUrl: String,
    @Value("\${python.proxy.timeout}") private val timeout: Long
) {
    private val webClient: WebClient = WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build()

    /**
     * GET 요청 프록시
     */
    fun get(path: String, headers: Map<String, String> = emptyMap()): Mono<String> {
        logger.debug { "Proxying GET request to Python: $path" }
        return webClient.get()
            .uri(path)
            .headers { h -> headers.forEach { (k, v) -> h.add(k, v) } }
            .retrieve()
            .bodyToMono(String::class.java)
            .timeout(Duration.ofMillis(timeout))
            .doOnError { e -> logger.error(e) { "Python proxy GET error: $path" } }
            .onErrorResume(WebClientResponseException::class.java) { e ->
                Mono.just(e.responseBodyAsString)
            }
    }

    /**
     * POST 요청 프록시
     */
    fun post(path: String, body: String, headers: Map<String, String> = emptyMap()): Mono<String> {
        logger.debug { "Proxying POST request to Python: $path" }
        return webClient.post()
            .uri(path)
            .headers { h -> headers.forEach { (k, v) -> h.add(k, v) } }
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String::class.java)
            .timeout(Duration.ofMillis(timeout))
            .doOnError { e -> logger.error(e) { "Python proxy POST error: $path" } }
            .onErrorResume(WebClientResponseException::class.java) { e ->
                Mono.just(e.responseBodyAsString)
            }
    }

    /**
     * 헬스체크
     */
    fun healthCheck(): Mono<Boolean> {
        return webClient.get()
            .uri("/health")
            .retrieve()
            .bodyToMono(String::class.java)
            .timeout(Duration.ofSeconds(5))
            .map { true }
            .onErrorReturn(false)
    }
}