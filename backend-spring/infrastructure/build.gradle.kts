plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
}

// infrastructure 모듈은 bootJar 생성 불필요
tasks.bootJar { enabled = false }
tasks.jar { enabled = true }

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

dependencies {
    implementation(project(":common"))
    implementation(project(":domain"))

    // Spring Web (jakarta.servlet 포함)
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Spring Data JPA
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Kotlin Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")

    // PostgreSQL Driver (최신 버전으로 명시적 지정)
    runtimeOnly("org.postgresql:postgresql:42.7.1")

    // Flyway 9.x (더 안정적)
    implementation("org.flywaydb:flyway-core:9.22.3")

    // Spring Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")

    // WebClient for Python Proxy
    implementation("org.springframework.boot:spring-boot-starter-webflux")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("io.mockk:mockk:1.13.9")
}