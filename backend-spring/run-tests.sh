#!/bin/bash
# Phase 3.5 근무자 관리 API 테스트 스크립트

set -e

BASE_URL="http://localhost:8080"
EMPLOYEE_ID=""

echo "🚀 Phase 3.5 근무자 관리 API 테스트 시작"
echo "================================================"
echo ""

# Health Check
echo "✓ Health Check"
curl -s "$BASE_URL/actuator/health" | jq .
echo ""

# 1. 근무자 등록 (내국인)
echo "📝 1. 근무자 등록 (내국인 - 35세)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "residentIdPrefix": "900101-1",
    "contractStartDate": "2026-01-01",
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "breakMinutes": 60,
    "weeklyWorkDays": 5,
    "dailyWorkHours": 8,
    "probationMonths": 3,
    "probationRate": 90
  }')
echo "$RESPONSE" | jq .
EMPLOYEE_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "✅ 등록 완료 (ID: $EMPLOYEE_ID)"
echo "   - 만 나이: $(echo "$RESPONSE" | jq -r '.age')세"
echo "   - 국민연금 가입대상: $(echo "$RESPONSE" | jq -r '.isPensionEligible')"
echo "   - 수습기간 중: $(echo "$RESPONSE" | jq -r '.isInProbation')"
echo ""

# 2. 근무자 등록 (외국인)
echo "📝 2. 근무자 등록 (외국인 - E-9 비자)"
FOREIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "응우옌 반 티엔",
    "residentIdPrefix": "920315-5",
    "contractStartDate": "2026-02-01",
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5",
    "visaType": "E-9",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "breakMinutes": 60,
    "weeklyWorkDays": 6,
    "dailyWorkHours": 8
  }')
echo "$FOREIGN_RESPONSE" | jq .
FOREIGN_ID=$(echo "$FOREIGN_RESPONSE" | jq -r '.id')
echo "✅ 외국인 근무자 등록 완료 (ID: $FOREIGN_ID)"
echo "   - 외국인 여부: $(echo "$FOREIGN_RESPONSE" | jq -r '.isForeigner')"
echo "   - 체류자격: $(echo "$FOREIGN_RESPONSE" | jq -r '.visaType')"
echo ""

# 3. 만 60세 이상 등록
echo "📝 3. 근무자 등록 (만 60세 이상 - 국민연금 비대상)"
ELDERLY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "강미정",
    "residentIdPrefix": "760623-2",
    "contractStartDate": "2025-05-02",
    "employmentType": "PART_TIME",
    "companySize": "UNDER_5",
    "workStartTime": "09:00",
    "workEndTime": "17:00",
    "breakMinutes": 60,
    "weeklyWorkDays": 6,
    "dailyWorkHours": 7,
    "probationMonths": 3,
    "probationRate": 100
  }')
echo "$ELDERLY_RESPONSE" | jq .
ELDERLY_ID=$(echo "$ELDERLY_RESPONSE" | jq -r '.id')
echo "✅ 만 60세 이상 근무자 등록 완료 (ID: $ELDERLY_ID)"
echo "   - 만 나이: $(echo "$ELDERLY_RESPONSE" | jq -r '.age')세"
echo "   - 국민연금 가입대상: $(echo "$ELDERLY_RESPONSE" | jq -r '.isPensionEligible')"
echo ""

# 4. 주민번호 중복 시도
echo "❌ 4. 주민번호 중복 등록 시도 (409 Conflict 예상)"
DUPLICATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동2",
    "residentIdPrefix": "900101-1",
    "contractStartDate": "2026-01-01",
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5"
  }')
HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | grep -oP 'HTTP_CODE:\K\d+')
echo "$DUPLICATE_RESPONSE" | sed 's/HTTP_CODE:.*//' | jq .
if [ "$HTTP_CODE" = "409" ]; then
  echo "✅ 409 Conflict 정상 응답"
else
  echo "⚠️  예상과 다른 응답 코드: $HTTP_CODE"
fi
echo ""

# 5. 외국인 체류자격 미입력
echo "❌ 5. 외국인 체류자격 미입력 (400 Bad Request 예상)"
VISA_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/v1/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "외국인 테스트",
    "residentIdPrefix": "950101-7",
    "contractStartDate": "2026-01-01",
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5"
  }')
HTTP_CODE=$(echo "$VISA_RESPONSE" | grep -oP 'HTTP_CODE:\K\d+')
echo "$VISA_RESPONSE" | sed 's/HTTP_CODE:.*//' | jq .
if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ 400 Bad Request 정상 응답"
else
  echo "⚠️  예상과 다른 응답 코드: $HTTP_CODE"
fi
echo ""

# 6. 목록 조회
echo "📋 6. 근무자 목록 조회"
LIST_RESPONSE=$(curl -s "$BASE_URL/api/v1/employees")
echo "$LIST_RESPONSE" | jq .
TOTAL_COUNT=$(echo "$LIST_RESPONSE" | jq -r '.totalCount')
echo "✅ 총 $TOTAL_COUNT명 조회"
echo ""

# 7. 상세 조회
echo "📄 7. 근무자 상세 조회 (ID: $EMPLOYEE_ID)"
DETAIL_RESPONSE=$(curl -s "$BASE_URL/api/v1/employees/$EMPLOYEE_ID")
echo "$DETAIL_RESPONSE" | jq .
echo "✅ 상세 조회 성공"
echo ""

# 8. 국민연금 비대상자 조회
echo "🔍 8. 국민연금 비대상자 조회 (만 60세 이상)"
PENSION_RESPONSE=$(curl -s "$BASE_URL/api/v1/employees/pension-ineligible")
echo "$PENSION_RESPONSE" | jq .
PENSION_COUNT=$(echo "$PENSION_RESPONSE" | jq -r '.totalCount')
echo "✅ 국민연금 비대상자: $PENSION_COUNT명"
echo ""

# 9. 이름 검색
echo "🔎 9. 이름 검색 (name=홍길동)"
SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/v1/employees/search?name=홍길동")
echo "$SEARCH_RESPONSE" | jq .
SEARCH_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.totalCount')
echo "✅ 검색 결과: $SEARCH_COUNT명"
echo ""

# 10. 정보 수정
echo "✏️  10. 근무자 정보 수정 (ID: $EMPLOYEE_ID)"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/v1/employees/$EMPLOYEE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "residentIdPrefix": "900101-1",
    "contractStartDate": "2026-01-01",
    "employmentType": "FULL_TIME",
    "companySize": "OVER_5",
    "workStartTime": "09:00",
    "workEndTime": "19:00",
    "breakMinutes": 60,
    "weeklyWorkDays": 5,
    "dailyWorkHours": 9,
    "probationMonths": 0,
    "probationRate": 100
  }')
echo "$UPDATE_RESPONSE" | jq .
echo "✅ 수정 완료"
echo "   - 일일 근로시간: 8시간 → 9시간"
echo "   - 수습기간: 3개월 → 0개월"
echo ""

# 11. 삭제
echo "🗑️  11. 근무자 삭제 (ID: $EMPLOYEE_ID)"
curl -s -X DELETE "$BASE_URL/api/v1/employees/$EMPLOYEE_ID"
echo "✅ 삭제 완료"
echo ""

# 12. 삭제된 근무자 조회
echo "❌ 12. 삭제된 근무자 조회 (404 Not Found 예상)"
NOT_FOUND_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/v1/employees/$EMPLOYEE_ID")
HTTP_CODE=$(echo "$NOT_FOUND_RESPONSE" | grep -oP 'HTTP_CODE:\K\d+')
echo "$NOT_FOUND_RESPONSE" | sed 's/HTTP_CODE:.*//' | jq .
if [ "$HTTP_CODE" = "404" ]; then
  echo "✅ 404 Not Found 정상 응답"
else
  echo "⚠️  예상과 다른 응답 코드: $HTTP_CODE"
fi
echo ""

echo "================================================"
echo "✅ 모든 테스트 시나리오 완료!"
echo ""
echo "남은 근무자 정리..."
curl -s -X DELETE "$BASE_URL/api/v1/employees/$FOREIGN_ID" > /dev/null
curl -s -X DELETE "$BASE_URL/api/v1/employees/$ELDERLY_ID" > /dev/null
echo "✅ 정리 완료"
