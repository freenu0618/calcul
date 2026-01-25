package com.paytools.infrastructure.client

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

/**
 * AI 서비스 클라이언트
 *
 * Python AI 마이크로서비스와 통신하는 클라이언트
 * - /ai/chat/stream: RAG 챗봇 스트리밍 응답
 * - /ai/embed: 문서 임베딩
 * - /ai/search: 벡터 검색
 *
 * Phase S3.3에서 구현됨
 */
@Component
class AiServiceClient(
    private val webClientBuilder: WebClient.Builder
) {
    private val pythonAiUrl = System.getenv("PYTHON_AI_URL") ?: "http://localhost:8001"

    private val webClient: WebClient = webClientBuilder
        .baseUrl(pythonAiUrl)
        .build()

    /**
     * AI 챗봇 스트리밍 응답 요청
     *
     * @param message 사용자 메시지
     * @param sessionId 세션 ID
     * @return SSE 스트리밍 응답
     */
    fun chatStream(message: String, sessionId: String): Mono<String> {
        return webClient.post()
            .uri("/ai/chat/stream")
            .bodyValue(mapOf(
                "message" to message,
                "session_id" to sessionId
            ))
            .retrieve()
            .bodyToMono(String::class.java)
    }

    /**
     * 문서 임베딩 요청
     *
     * @param text 임베딩할 텍스트
     * @return 1024차원 벡터 (multilingual-e5-large)
     */
    fun embed(text: String): Mono<List<Float>> {
        return webClient.post()
            .uri("/ai/embed")
            .bodyValue(mapOf("text" to text))
            .retrieve()
            .bodyToMono(EmbedResponse::class.java)
            .map { it.embedding }
    }

    /**
     * 벡터 검색 요청
     *
     * @param query 검색 쿼리
     * @param topK 상위 K개 결과 (기본값: 5)
     * @return 검색 결과 리스트
     */
    fun search(query: String, topK: Int = 5): Mono<List<SearchResult>> {
        return webClient.post()
            .uri("/ai/search")
            .bodyValue(mapOf(
                "query" to query,
                "top_k" to topK
            ))
            .retrieve()
            .bodyToMono(SearchResponse::class.java)
            .map { it.results }
    }

    /**
     * 헬스 체크
     */
    fun health(): Mono<String> {
        return webClient.get()
            .uri("/health")
            .retrieve()
            .bodyToMono(String::class.java)
    }

    // Response DTOs
    data class EmbedResponse(
        val embedding: List<Float>
    )

    data class SearchResponse(
        val results: List<SearchResult>
    )

    data class SearchResult(
        val id: String,
        val text: String,
        val score: Double,
        val metadata: Map<String, Any>
    )
}
