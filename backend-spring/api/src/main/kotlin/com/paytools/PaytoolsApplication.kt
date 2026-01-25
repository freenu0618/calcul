package com.paytools

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(scanBasePackages = ["com.paytools"])
@EntityScan(basePackages = ["com.paytools.domain.entity", "com.paytools.infrastructure.entity"])
@EnableJpaRepositories(basePackages = ["com.paytools.infrastructure.repository"])
class PaytoolsApplication

fun main(args: Array<String>) {
    runApplication<PaytoolsApplication>(*args)
}