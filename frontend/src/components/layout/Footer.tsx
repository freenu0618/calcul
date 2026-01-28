/**
 * Footer 컴포넌트
 */

import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 서비스 소개 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">PayTools</h3>
            <p className="text-sm text-gray-600">
              급여 계산 30분 → 3분으로<br />
              2026년 최신 법령 반영
            </p>
          </div>

          {/* 가이드 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">가이드</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guide" className="text-sm text-gray-600 hover:text-blue-600">
                  급여 계산 가이드
                </Link>
              </li>
              <li>
                <Link to="/guide/insurance" className="text-sm text-gray-600 hover:text-blue-600">
                  4대 보험 이해하기
                </Link>
              </li>
              <li>
                <Link to="/guide/tax" className="text-sm text-gray-600 hover:text-blue-600">
                  소득세 계산법
                </Link>
              </li>
              <li>
                <Link to="/guide/overtime" className="text-sm text-gray-600 hover:text-blue-600">
                  연장·야간·휴일 수당
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">정보</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-blue-600">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="/examples" className="text-sm text-gray-600 hover:text-blue-600">
                  계산 사례
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-sm text-gray-600 hover:text-blue-600">
                  법률 정보
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-blue-600">
                  블로그
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">법적 정보</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-blue-600">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-blue-600">
                  연락처
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 저작권 및 면책 조항 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              ⚠️ <strong>법적 고지:</strong> 본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
            </p>
            <p className="text-xs text-gray-500">
              계산 결과로 인한 법적 책임은 사용자에게 있습니다.
            </p>
            <p className="mt-4 text-gray-500">
              © {currentYear} PayTools. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
