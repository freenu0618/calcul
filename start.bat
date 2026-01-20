@echo off
chcp 65001 > nul
title 급여 계산기

echo ========================================
echo     급여 계산기 - 시작 중...
echo ========================================
echo.

:: 백엔드 시작
echo [1/2] 백엔드 서버 시작 중...
start /min cmd /c "cd /d %~dp0backend && python -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000"

:: 잠시 대기
timeout /t 3 /nobreak > nul

:: 프론트엔드 시작
echo [2/2] 프론트엔드 시작 중...
start /min cmd /c "cd /d %~dp0frontend && npm run dev"

:: 잠시 대기
timeout /t 3 /nobreak > nul

:: 브라우저 열기
echo.
echo ========================================
echo     브라우저에서 열기...
echo ========================================
start http://localhost:5175

echo.
echo 급여 계산기가 시작되었습니다!
echo.
echo - 웹 주소: http://localhost:5175
echo - 종료하려면 이 창을 닫으세요.
echo.
pause
