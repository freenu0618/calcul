/**
 * 404 페이지 - 존재하지 않는 경로 접근 시 표시
 * noindex 메타태그로 Google Soft 404 문제 방지
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>페이지를 찾을 수 없습니다 | PayTools</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
      </Helmet>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">페이지를 찾을 수 없습니다</p>
        <p className="text-gray-500 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            홈으로 이동
          </Link>
          <Link
            to="/calculator"
            className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            급여 계산기
          </Link>
        </div>
      </div>
    </>
  );
}
