# 프론트엔드 개발 가이드

**버전**: v1.0.0
**최종 수정**: 2026-01-28
**상태**: Approved

---

## 개요

React + TypeScript 프론트엔드 개발 가이드입니다.

---

## 1. 기술 스택

| 항목 | 기술 |
|------|------|
| 언어 | TypeScript |
| 프레임워크 | React 19 |
| 빌드 | Vite |
| 스타일 | Tailwind CSS |
| 라우팅 | React Router v7 |
| HTTP | Axios |
| 캘린더 | FullCalendar 6.x |

---

## 2. 프로젝트 구조

```
frontend/src/
├── pages/                  # 페이지 컴포넌트
│   ├── Calculator/         # 급여 계산기
│   ├── Dashboard/          # 대시보드
│   ├── Employees/          # 직원 관리
│   └── Auth/               # 로그인/회원가입
├── components/             # 재사용 컴포넌트
│   ├── layout/             # Navigation, Footer
│   ├── forms/              # 폼 컴포넌트
│   └── ui/                 # UI 컴포넌트
├── api/                    # API 클라이언트
│   ├── client.ts           # Axios 설정
│   ├── salaryApi.ts        # 급여 API
│   └── employeeApi.ts      # 직원 API
├── contexts/               # React Context
│   └── AuthContext.tsx     # 인증 상태
├── hooks/                  # 커스텀 훅
├── types/                  # TypeScript 타입
└── config/                 # 설정
```

---

## 3. 컴포넌트 작성 규칙

### 3.1 기본 구조

```tsx
/**
 * 직원 목록 컴포넌트
 */
export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

### 3.2 규칙

- 함수형 컴포넌트 사용
- 200줄 이하 유지
- 한 파일에 하나의 주요 컴포넌트

---

## 4. API 클라이언트

### 4.1 Axios 설정

```typescript
// api/client.ts
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4.2 API 함수

```typescript
// api/employeeApi.ts
export const employeeApi = {
  getAll: () => client.get<EmployeeListResponse>('/api/v1/employees'),
  getById: (id: string) => client.get<EmployeeResponse>(`/api/v1/employees/${id}`),
  create: (data: EmployeeRequest) => client.post<EmployeeResponse>('/api/v1/employees', data),
  update: (id: string, data: EmployeeRequest) => client.put<EmployeeResponse>(`/api/v1/employees/${id}`, data),
  delete: (id: string) => client.delete(`/api/v1/employees/${id}`),
};
```

---

## 5. 타입 정의

### 5.1 타입 파일

```typescript
// types/employee.ts
export interface Employee {
  id: string;
  name: string;
  residentIdPrefix: string;
  employmentType: 'FULL_TIME' | 'PART_TIME';
  companySize: 'OVER_5' | 'UNDER_5';
}

export interface EmployeeRequest {
  name: string;
  resident_id_prefix: string;
  employment_type: string;
  company_size: string;
}
```

### 5.2 필드명 변환

- API 응답: snake_case
- 프론트엔드: camelCase
- 변환은 api/client.ts에서 자동 처리

---

## 6. Tailwind CSS 스타일

### 6.1 기본 클래스

```tsx
// 컨테이너
<div className="max-w-7xl mx-auto px-4 py-8">

// 카드
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

// 버튼 (Primary)
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">

// 버튼 (Secondary)
<button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">

// 입력 필드
<input className="form-input" />
```

### 6.2 커스텀 색상 (tailwind.config.js)

```javascript
colors: {
  primary: {
    DEFAULT: '#3B82F6',
    600: '#2563EB',
  },
  text: {
    main: '#1F2937',
    sub: '#6B7280',
  },
}
```

---

## 7. 상태 관리

### 7.1 AuthContext

```tsx
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // 로그인 로직
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 7.2 사용법

```tsx
const { isAuthenticated, user, logout } = useAuth();
```

---

## 8. 라우팅

### 8.1 라우트 정의

```tsx
// App.tsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/calculator" element={<CalculatorPage />} />
  <Route path="/login" element={<Login />} />

  {/* 인증 필요 라우트 */}
  <Route path="/employees" element={
    <PrivateRoute><EmployeeList /></PrivateRoute>
  } />
</Routes>
```

### 8.2 PrivateRoute

```tsx
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}
```

---

## 9. 폼 처리

### 9.1 기본 패턴

```tsx
const [form, setForm] = useState<EmployeeRequest>({
  name: '',
  resident_id_prefix: '',
  employment_type: 'FULL_TIME',
});

const handleChange = (field: keyof EmployeeRequest, value: string) => {
  setForm({ ...form, [field]: value });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await employeeApi.create(form);
    navigate('/employees');
  } catch (error) {
    setError('저장에 실패했습니다.');
  }
};
```

### 9.2 입력 검증

```tsx
<input
  type="text"
  value={form.name}
  onChange={(e) => handleChange('name', e.target.value)}
  pattern="[가-힣a-zA-Z]+"
  required
/>
```

---

## 10. 환경 변수

### 10.1 .env 파일

```bash
# .env.local (로컬 개발)
VITE_API_BASE_URL=http://localhost:8080

# .env.production (프로덕션)
VITE_API_BASE_URL=https://calcul-production.up.railway.app
```

### 10.2 사용법

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2026-01-28 | 최초 작성 |
