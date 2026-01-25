plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    kotlin("plugin.spring")
}

// common 모듈은 bootJar 생성 불필요
tasks.bootJar { enabled = false }
tasks.jar { enabled = true }

dependencies {
    // Jackson for JSON
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Validation
    implementation("jakarta.validation:jakarta.validation-api")

    // Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
}