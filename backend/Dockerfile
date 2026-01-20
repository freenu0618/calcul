# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 복사
COPY app ./app

# 포트 노출
EXPOSE 8000

# 서버 실행
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
