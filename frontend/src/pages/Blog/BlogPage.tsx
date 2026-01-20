/**
 * 블로그 메인 페이지
 */

import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';

const BlogPage = () => {
  const posts = [
    {
      id: '2026-minimum-wage',
      title: '2026년 최저임금 변경사항',
      excerpt: '2026년 최저임금이 시급 10,030원으로 인상되었습니다. 월 환산액과 적용 기준을 알아봅니다.',
      date: '2026-01-15',
      category: '법률 업데이트',
    },
    {
      id: 'insurance-rate-2026',
      title: '2026년 4대 보험 요율 업데이트',
      excerpt: '2026년 적용되는 4대 보험 요율이 변경되었습니다. 국민연금, 건강보험, 장기요양보험, 고용보험의 새로운 요율을 확인하세요.',
      date: '2026-01-10',
      category: '법률 업데이트',
    },
    {
      id: 'overtime-calculation-tips',
      title: '연장수당 계산 꿀팁',
      excerpt: '연장근로 수당을 정확히 계산하는 방법과 주의사항을 알아봅니다. 주 40시간 기준과 통상시급 계산법을 이해하세요.',
      date: '2026-01-05',
      category: '계산 가이드',
    },
    {
      id: 'weekly-holiday-pay-guide',
      title: '주휴수당 완벽 가이드',
      excerpt: '주휴수당의 개념, 지급 요건, 계산 방법을 상세히 설명합니다. 5인 미만 사업장도 의무 적용됩니다.',
      date: '2025-12-28',
      category: '계산 가이드',
    },
    {
      id: 'year-end-tax-settlement-2026',
      title: '2026년 연말정산 준비하기',
      excerpt: '연말정산 시기가 다가왔습니다. 공제 항목과 절세 팁을 미리 준비하세요.',
      date: '2025-12-20',
      category: '세금',
    },
  ];

  const categories = Array.from(new Set(posts.map(post => post.category)));

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            블로그
          </h1>
          <p className="text-lg text-gray-600">
            급여 계산과 근로 관련 최신 소식과 유용한 정보를 제공합니다.
          </p>
        </div>

        {/* 카테고리 */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            전체
          </span>
          {categories.map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200"
            >
              {category}
            </span>
          ))}
        </div>

        {/* 블로그 포스트 목록 */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600">
                    {post.excerpt}
                  </p>
                  <span className="inline-block text-blue-600 hover:text-blue-700 font-medium">
                    자세히 읽기 →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 구독 안내 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            최신 소식 받아보기
          </h3>
          <p className="text-gray-700 mb-4">
            급여 계산과 근로 관련 최신 정보를 정기적으로 업데이트합니다.
          </p>
          <Link
            to="/contact"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            문의하기
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPage;
