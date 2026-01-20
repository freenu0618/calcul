@echo off
chcp 65001 > nul
title 급여 계산기 종료

echo ========================================
echo     급여 계산기 종료 중...
echo ========================================
echo.

:: Python/Node 프로세스 종료
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo 급여 계산기가 종료되었습니다.
pause
