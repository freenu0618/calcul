package com.paytools.api.health

import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.HealthIndicator
import org.springframework.stereotype.Component
import javax.sql.DataSource

/**
 * 상세 헬스체크 인디케이터
 * - DB 연결 상태
 * - 애플리케이션 정보
 */
@Component
class DetailedHealthIndicator(
    private val dataSource: DataSource
) : HealthIndicator {

    override fun health(): Health {
        return try {
            // DB 연결 체크
            dataSource.connection.use { conn ->
                conn.createStatement().use { stmt ->
                    stmt.executeQuery("SELECT 1").use { rs ->
                        if (rs.next()) {
                            Health.up()
                                .withDetail("database", "connected")
                                .withDetail("databaseProduct", conn.metaData.databaseProductName)
                                .withDetail("databaseVersion", conn.metaData.databaseProductVersion)
                                .withDetail("application", "paytools-api")
                                .withDetail("version", "1.0.0")
                                .build()
                        } else {
                            Health.down()
                                .withDetail("database", "query failed")
                                .build()
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Health.down()
                .withDetail("database", "disconnected")
                .withDetail("error", e.message ?: "Unknown error")
                .build()
        }
    }
}
