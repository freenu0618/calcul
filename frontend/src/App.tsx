/**
 * 급여 계산기 메인 앱 (Router 설정)
 * 코드 스플리팅 적용으로 초기 로딩 속도 최적화
 */

import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

// 핵심 페이지는 즉시 로드
import LandingPage from './pages/Landing';
import CalculatorPage from './pages/Calculator';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// 나머지 페이지는 Lazy Loading
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const OAuthCallback = lazy(() => import('./pages/Auth/OAuthCallback'));
const GuidePage = lazy(() => import('./pages/Guide/GuidePage'));
const InsuranceGuide = lazy(() => import('./pages/Guide/InsuranceGuide'));
const TaxGuide = lazy(() => import('./pages/Guide/TaxGuide'));
const OvertimeGuide = lazy(() => import('./pages/Guide/OvertimeGuide'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ExamplesPage = lazy(() => import('./pages/Examples/ExamplesPage'));
const FulltimeExample = lazy(() => import('./pages/Examples/FulltimeExample'));
const ParttimeExample = lazy(() => import('./pages/Examples/ParttimeExample'));
const ShiftWorkExample = lazy(() => import('./pages/Examples/ShiftWorkExample'));
const Legal = lazy(() => import('./pages/Legal'));
const BlogPage = lazy(() => import('./pages/Blog/BlogPage'));
const BlogPost = lazy(() => import('./pages/Blog/BlogPost'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const ReverseCalculator = lazy(() => import('./pages/ReverseCalculator'));
const SalarySimulation = lazy(() => import('./pages/Simulation'));

// 인증 필요 페이지
const EmployeeList = lazy(() => import('./pages/Employees/EmployeeList'));
const EmployeeForm = lazy(() => import('./pages/Employees/EmployeeForm'));
const PayrollList = lazy(() => import('./pages/Payroll/PayrollList'));
const PayrollDetail = lazy(() => import('./pages/Payroll/PayrollDetail'));

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// 인증 필요 라우트
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// GA4 페이지뷰 추적 컴포넌트
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-26QRZ1CK71', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <PageViewTracker />
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* 인증 페이지 */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />

                    {/* 메인 페이지 (즉시 로드) */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/calculator" element={<CalculatorPage />} />

                    {/* Lazy Loading 페이지 */}
                    <Route path="/reverse-calculator" element={<ReverseCalculator />} />
                    <Route path="/simulation" element={<SalarySimulation />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* 가이드 페이지 */}
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/guide/insurance" element={<InsuranceGuide />} />
                    <Route path="/guide/tax" element={<TaxGuide />} />
                    <Route path="/guide/overtime" element={<OvertimeGuide />} />

                    {/* FAQ */}
                    <Route path="/faq" element={<FAQ />} />

                    {/* 계산 사례 */}
                    <Route path="/examples" element={<ExamplesPage />} />
                    <Route path="/examples/fulltime" element={<FulltimeExample />} />
                    <Route path="/examples/parttime" element={<ParttimeExample />} />
                    <Route path="/examples/shift-work" element={<ShiftWorkExample />} />

                    {/* 법률 정보 */}
                    <Route path="/legal" element={<Legal />} />

                    {/* 블로그 */}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:postId" element={<BlogPost />} />

                    {/* 직원 관리 (인증 필요) */}
                    <Route path="/employees" element={<PrivateRoute><EmployeeList /></PrivateRoute>} />
                    <Route path="/employees/new" element={<PrivateRoute><EmployeeForm /></PrivateRoute>} />
                    <Route path="/employees/:id/edit" element={<PrivateRoute><EmployeeForm /></PrivateRoute>} />

                    {/* 급여대장 (인증 필요) */}
                    <Route path="/payroll" element={<PrivateRoute><PayrollList /></PrivateRoute>} />
                    <Route path="/payroll/:id" element={<PrivateRoute><PayrollDetail /></PrivateRoute>} />

                    {/* 기타 페이지 */}
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
