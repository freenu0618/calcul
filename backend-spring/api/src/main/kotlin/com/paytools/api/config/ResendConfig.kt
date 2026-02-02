package com.paytools.api.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * Resend 이메일 서비스 설정
 */
@Configuration
@ConfigurationProperties(prefix = "resend")
class ResendConfig {
    var apiKey: String = ""
    var fromEmail: String = "PayTools <noreply@paytools.work>"
    var enabled: Boolean = true
}
