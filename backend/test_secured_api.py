"""보안 적용된 API 테스트"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("=== 0. 회원가입 ===")
register_data = {
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
}
response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(f"Status: {response.status_code}")
print()

print("=== 1. 로그인 (JWT 토큰 획득) ===")
login_data = {
    "email": "test@example.com",
    "password": "testpass123"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print(f"Status: {response.status_code}")
token = response.json()["access_token"]
print(f"Token: {token[:50]}...")
print()

headers = {"Authorization": f"Bearer {token}"}

print("=== 2. 직원 생성 (인증 필요) ===")
employee_data = {
    "name": "홍길동",
    "dependents_count": 2,
    "children_under_20": 1,
    "employment_type": "FULL_TIME",
    "company_size": "OVER_5",
    "scheduled_work_days": 5
}

response = requests.post(f"{BASE_URL}/employees", json=employee_data, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
employee_id = response.json()["id"]
print()

print("=== 3. 직원 목록 조회 (인증 필요) ===")
response = requests.get(f"{BASE_URL}/employees", headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
print()

print("=== 4. 급여 이력 저장 (인증 필요) ===")
record_data = {
    "employee_id": employee_id,
    "base_salary": 3000000,
    "allowances_json": [],
    "total_gross": 3000000,
    "total_deductions": 500000,
    "net_pay": 2500000,
    "calculation_detail": {"note": "테스트 계산"}
}

response = requests.post(f"{BASE_URL}/records", json=record_data, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
print()

print("=== 5. 급여 이력 조회 (인증 필요) ===")
response = requests.get(f"{BASE_URL}/records", headers=headers)
print(f"Status: {response.status_code}")
print(f"Records count: {len(response.json())}")
print()

print("=== 6. 인증 없이 접근 시도 (401 예상) ===")
response = requests.get(f"{BASE_URL}/employees")
print(f"Status: {response.status_code}")
if response.status_code == 401:
    print("✅ 인증 없이 접근 차단됨 (정상)")
else:
    print("❌ 인증 없이도 접근 가능 (보안 문제!)")
print()

print("=== 7. 잘못된 토큰으로 접근 시도 (401 예상) ===")
bad_headers = {"Authorization": "Bearer invalid_token"}
response = requests.get(f"{BASE_URL}/employees", headers=bad_headers)
print(f"Status: {response.status_code}")
if response.status_code == 401:
    print("✅ 잘못된 토큰 차단됨 (정상)")
else:
    print("❌ 잘못된 토큰으로 접근 가능 (보안 문제!)")
