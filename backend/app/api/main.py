"""FastAPI 메인 애플리케이션

한국 근로기준법 기반 급여 계산 API
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 버전 정보
API_VERSION = "1.0.0"
API_TITLE = "급여 계산기 API"
API_DESCRIPTION = """
한국 근로기준법 및 세법에 따른 근로자 실수령액 계산 API

## 주요 기능

* **급여 계산**: 기본급, 수당, 4대 보험, 소득세 계산
* **가산수당**: 연장/야간/휴일 근로 수당 자동 계산
* **주휴수당**: 주 근로시간 기준 비례 지급
* **세금 계산**: 2026년 간이세액표 기반 소득세 계산

## 법적 고지

⚠️ 본 계산기는 참고용이며, 실제 급여 지급 시
노무사 또는 세무사와 상담하시기 바랍니다.
"""

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
# 환경 변수에서 허용할 도메인 목록을 읽어옴 (쉼표로 구분)
# 예: ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5175
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5175,http://localhost:5173,https://calcul-1b9.pages.dev"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "급여 계산기 API",
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "version": API_VERSION,
    }

# DB 초기화
from app.db import init_db

@app.on_event("startup")
async def startup_event():
    """앱 시작 시 DB 테이블 생성"""
    init_db()


# 라우터 등록
from app.api.routers import salary, insurance, tax, employees, records

app.include_router(
    salary.router,
    prefix="/api/v1/salary",
    tags=["Salary"],
)

app.include_router(
    insurance.router,
    prefix="/api/v1/insurance",
    tags=["Insurance"],
)

app.include_router(
    tax.router,
    prefix="/api/v1/tax",
    tags=["Tax"],
)

app.include_router(
    employees.router,
    prefix="/api/v1/employees",
    tags=["Employees"],
)

app.include_router(
    records.router,
    prefix="/api/v1/records",
    tags=["Records"],
)
