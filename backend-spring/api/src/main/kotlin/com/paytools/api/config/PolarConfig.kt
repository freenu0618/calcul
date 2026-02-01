package com.paytools.api.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * Polar 결제 서비스 설정
 */
@Configuration
@ConfigurationProperties(prefix = "polar")
class PolarConfig {
    var apiUrl: String = "https://api.polar.sh"
    var apiToken: String = ""
    var webhookSecret: String = ""
    var successUrl: String = ""
    var cancelUrl: String = ""
    var products: Products = Products()

    class Products {
        var basic: String = ""
        var basicAnnual: String = ""
        var pro: String = ""
        var proAnnual: String = ""
    }

    fun getProductId(plan: String): String? {
        return when (plan.lowercase()) {
            "basic" -> products.basic
            "basic_annual", "basic-annual" -> products.basicAnnual
            "pro" -> products.pro
            "pro_annual", "pro-annual" -> products.proAnnual
            else -> null
        }
    }
}
