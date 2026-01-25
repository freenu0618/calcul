package com.paytools

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PaytoolsApplication

fun main(args: Array<String>) {
    runApplication<PaytoolsApplication>(*args)
}