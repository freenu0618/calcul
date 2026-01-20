/**
 * MainLayout 레이아웃 컴포넌트
 */

import React from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>⚠️ 법적 고지</strong>
            </p>
            <p>
              본 계산기는 참고용이며, 실제 급여 지급 시 노무사 또는 세무사와 상담하시기 바랍니다.
            </p>
            <p className="mt-1">
              계산 결과로 인한 법적 책임은 사용자에게 있습니다.
            </p>

            {/* Google AdSense 개인정보 처리방침 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                본 사이트는 <strong>Google AdSense</strong>를 사용하여 광고를 게재합니다.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Google은 쿠키를 사용하여 사용자의 관심사에 맞는 광고를 표시합니다.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                자세한 내용은{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Google 광고 정책
                </a>
                을 참조하세요.
              </p>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              © 2026 급여 계산기. 한국 근로기준법 및 세법 기준.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
