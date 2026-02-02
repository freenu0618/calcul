package com.paytools.api.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.paytools.api.config.ResendConfig
import com.paytools.domain.model.SubscriptionTier
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.text.NumberFormat
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

/**
 * Resend 이메일 발송 서비스
 */
@Service
class ResendService(
    private val resendConfig: ResendConfig,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val httpClient = HttpClient.newHttpClient()
    private val krFormatter = NumberFormat.getCurrencyInstance(Locale.KOREA)

    /**
     * 결제 완료 리포트 이메일 발송
     */
    fun sendPaymentReportEmail(
        toEmail: String,
        userName: String,
        tier: SubscriptionTier,
        amount: Int,
        periodEnd: LocalDateTime?
    ): Boolean {
        if (!resendConfig.enabled || resendConfig.apiKey.isBlank()) {
            logger.warn("Resend is disabled or API key is missing")
            return false
        }

        val planName = when (tier) {
            SubscriptionTier.BASIC -> "Basic"
            SubscriptionTier.PRO -> "Pro"
            else -> tier.name
        }

        val periodEndStr = periodEnd?.format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"))
            ?: "다음 결제일"

        val html = buildPaymentReportHtml(userName, planName, amount, periodEndStr)

        return sendEmail(
            to = toEmail,
            subject = "[PayTools] 결제가 완료되었습니다 - $planName 플랜",
            html = html
        )
    }

    /**
     * 구독 환영 이메일 발송
     */
    fun sendWelcomeEmail(toEmail: String, userName: String, tier: SubscriptionTier): Boolean {
        if (!resendConfig.enabled || resendConfig.apiKey.isBlank()) {
            logger.warn("Resend is disabled or API key is missing")
            return false
        }

        val planName = when (tier) {
            SubscriptionTier.BASIC -> "Basic"
            SubscriptionTier.PRO -> "Pro"
            else -> tier.name
        }

        val html = buildWelcomeHtml(userName, planName)

        return sendEmail(
            to = toEmail,
            subject = "[PayTools] $planName 플랜 가입을 환영합니다!",
            html = html
        )
    }

    /**
     * Resend API로 이메일 발송
     */
    private fun sendEmail(to: String, subject: String, html: String): Boolean {
        return try {
            val payload = mapOf(
                "from" to resendConfig.fromEmail,
                "to" to listOf(to),
                "subject" to subject,
                "html" to html
            )

            val request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer ${resendConfig.apiKey}")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build()

            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())

            if (response.statusCode() in 200..299) {
                logger.info("Email sent successfully to $to")
                true
            } else {
                logger.error("Email send failed: ${response.statusCode()} - ${response.body()}")
                false
            }
        } catch (e: Exception) {
            logger.error("Email send error: ${e.message}", e)
            false
        }
    }

    private fun buildPaymentReportHtml(userName: String, planName: String, amount: Int, periodEnd: String): String {
        val amountStr = krFormatter.format(amount)
        return """
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">PayTools</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">결제 완료 안내</p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px;">${userName}님, 안녕하세요!</p>
    <p style="color: #64748b; line-height: 1.6; margin: 0;">
      <strong>$planName 플랜</strong> 결제가 성공적으로 완료되었습니다.<br>
      이제 모든 프리미엄 기능을 이용하실 수 있습니다.
    </p>
  </div>

  <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 16px;">결제 내역</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">플랜</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b;">$planName</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">결제 금액</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b;">$amountStr</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; color: #64748b;">다음 결제일</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b;">$periodEnd</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin-bottom: 24px;">
    <a href="https://paytools.work/dashboard" style="display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      대시보드로 이동
    </a>
  </div>

  <div style="text-align: center; color: #94a3b8; font-size: 12px;">
    <p>본 메일은 발신 전용입니다.</p>
    <p>© 2026 PayTools. All rights reserved.</p>
  </div>
</body>
</html>
        """.trimIndent()
    }

    private fun buildWelcomeHtml(userName: String, planName: String): String {
        return """
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 환영합니다!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">PayTools $planName 플랜</p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px;">${userName}님, 환영합니다!</p>
    <p style="color: #64748b; line-height: 1.6; margin: 0;">
      <strong>$planName 플랜</strong>에 가입해 주셔서 감사합니다.<br>
      이제 급여 계산부터 PDF 명세서까지 모든 기능을 자유롭게 이용하세요.
    </p>
  </div>

  <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 16px;">이용 가능한 기능</h3>
    <ul style="margin: 0; padding-left: 20px; color: #64748b; line-height: 1.8;">
      <li>무제한 급여 계산</li>
      <li>PDF 급여명세서 다운로드</li>
      <li>직원 관리 (최대 ${if (planName == "Pro") "30" else "10"}명)</li>
      <li>급여대장 관리</li>
      ${if (planName == "Pro") "<li>엑셀 내보내기</li><li>AI 법령 검색</li>" else ""}
    </ul>
  </div>

  <div style="text-align: center; margin-bottom: 24px;">
    <a href="https://paytools.work/calculator" style="display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      급여 계산 시작하기
    </a>
  </div>

  <div style="text-align: center; color: #94a3b8; font-size: 12px;">
    <p>궁금한 점이 있으시면 언제든 문의해주세요.</p>
    <p>© 2026 PayTools. All rights reserved.</p>
  </div>
</body>
</html>
        """.trimIndent()
    }
}
