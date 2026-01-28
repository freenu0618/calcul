plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    kotlin("plugin.spring")
}

// api 모듈이 실행 가능한 bootJar 생성
tasks.bootJar {
    enabled = true
    archiveFileName.set("api.jar")  // 버전 없이 고정 이름
}
tasks.jar { enabled = false }

// PostgreSQL 드라이버 버전 강제 오버라이드
ext["postgresql.version"] = "42.7.1"

dependencies {
    implementation(project(":common"))
    implementation(project(":domain"))
    implementation(project(":infrastructure"))

    // Spring Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Spring Data JPA (for @Transactional)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Spring Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // OAuth2 Client (Google, Kakao, Naver)
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

    // WebFlux (for Mono/WebClient in ProxyController)
    implementation("org.springframework.boot:spring-boot-starter-webflux")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Actuator (health check)
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // OpenAPI / Swagger
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0")

    // Jackson Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Kotlin Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")

    // PostgreSQL Driver (강제 버전 지정)
    runtimeOnly("org.postgresql:postgresql:42.7.1")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("io.mockk:mockk:1.13.9")
    testImplementation("com.h2database:h2")
}