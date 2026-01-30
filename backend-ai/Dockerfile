FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드
COPY . .

# 포트 노출 (Railway는 PORT 환경변수 사용)
EXPOSE ${PORT:-8001}

# 실행 (Railway PORT 환경변수 지원)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}
