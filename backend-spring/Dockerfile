# Multi-stage build for Spring Boot application
# Stage 1: Build
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

# Copy gradle files first for caching
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY api/build.gradle.kts api/
COPY domain/build.gradle.kts domain/
COPY infrastructure/build.gradle.kts infrastructure/
COPY common/build.gradle.kts common/

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY api/src api/src
COPY domain/src domain/src
COPY infrastructure/src infrastructure/src
COPY common/src common/src

# Build the application
RUN gradle :api:bootJar --no-daemon

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built JAR
COPY --from=builder /app/api/build/libs/*.jar app.jar

# Environment variables
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENV SPRING_PROFILES_ACTIVE=prod

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
