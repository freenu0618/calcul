"""인증 API 간단 테스트"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# 1. 회원가입 테스트
print("=== 회원가입 테스트 ===")
register_data = {
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
}

try:
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
except Exception as e:
    print(f"Error: {e}")
    print()

# 2. 로그인 테스트
print("=== 로그인 테스트 ===")
login_data = {
    "email": "test@example.com",
    "password": "testpass123"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")

    if "access_token" in result:
        token = result["access_token"]
        print()

        # 3. 현재 사용자 조회 테스트
        print("=== 현재 사용자 조회 테스트 ===")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")
