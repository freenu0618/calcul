/**
 * 급여 계산기 메인 앱 (Router 설정)
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GuidePage from './pages/Guide/GuidePage';
import InsuranceGuide from './pages/Guide/InsuranceGuide';
import TaxGuide from './pages/Guide/TaxGuide';
import OvertimeGuide from './pages/Guide/OvertimeGuide';
import FAQ from './pages/FAQ';
import ExamplesPage from './pages/Examples/ExamplesPage';
import FulltimeExample from './pages/Examples/FulltimeExample';
import ParttimeExample from './pages/Examples/ParttimeExample';
import ShiftWorkExample from './pages/Examples/ShiftWorkExample';
import Legal from './pages/Legal';
import BlogPage from './pages/Blog/BlogPage';
import BlogPost from './pages/Blog/BlogPost';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// GA 타입은 index.html의 전역 스크립트에서 정의됨

// GA4 페이지뷰 추적 컴포넌트
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // 페이지 변경 시 GA4에 페이지뷰 전송
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
            <PageViewTracker />
            <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              <Routes>
                {/* 인증 페이지 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 메인 페이지 */}
                <Route path="/" element={<Home />} />

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

                {/* 기타 페이지 */}
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
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
