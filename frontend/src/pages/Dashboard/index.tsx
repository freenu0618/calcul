/**
 * Dashboard - 로그인 후 메인 페이지
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useSubscription } from '../../hooks/useSubscription';

// 아이콘 컴포넌트
const icons = {
  calculator: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { openChat } = useChat();
  const { tier, tierLabel, usage, limits, remainingAiChats } = useSubscription();

  const aiUsagePercent = limits.aiChatsPerMonth === Infinity
    ? 0
    : Math.round((usage.aiChats / limits.aiChatsPerMonth) * 100);

  const quickActions = [
    {
      title: '급여 계산',
      description: '새로운 급여를 계산합니다',
      href: '/calculator',
      icon: icons.calculator,
      color: 'blue' as const,
    },
    {
      title: 'AI 노무 상담',
      description: '근로기준법 관련 질문하기',
      onClick: openChat,
      icon: icons.chat,
      color: 'purple' as const,
    },
    {
      title: '급여대장',
      description: '월별 급여 기록 관리',
      href: '/payroll',
      icon: icons.document,
      color: 'emerald' as const,
    },
    {
      title: '직원 관리',
      description: '직원 정보 등록 및 수정',
      href: '/employees',
      icon: icons.users,
      color: 'amber' as const,
    },
  ];

  return (
    <>
      <Helmet>
        <title>대시보드 | paytools</title>
      </Helmet>

      <MainLayout>
        <div className="max-w-6xl mx-auto">
          {/* 환영 메시지 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              안녕하세요, {user?.name || user?.email}님
            </h1>
            <p className="text-gray-600">오늘도 효율적인 급여 관리를 도와드릴게요.</p>
          </div>

          {/* 빠른 작업 */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) =>
                action.href ? (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className={`w-12 h-12 ${colorClasses[action.color]} rounded-lg flex items-center justify-center mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </Link>
                ) : (
                  <button
                    key={action.title}
                    onClick={action.onClick}
                    className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left"
                  >
                    <div className={`w-12 h-12 ${colorClasses[action.color]} rounded-lg flex items-center justify-center mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 급여 계산</h2>
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>아직 계산 기록이 없습니다</p>
                <Link to="/calculator" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  첫 급여 계산하기 →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI 상담 이용권</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">이번 달 사용량</span>
                  <span className="font-medium">
                    {limits.aiChatsPerMonth === Infinity
                      ? '무제한'
                      : `${usage.aiChats} / ${limits.aiChatsPerMonth}회`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${aiUsagePercent > 80 ? 'bg-orange-500' : 'bg-blue-600'}`}
                    style={{ width: `${aiUsagePercent}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {tierLabel} 플랜: 월 {limits.aiChatsPerMonth === Infinity ? '무제한' : `${limits.aiChatsPerMonth}회`} AI 상담 제공
              </p>
              {tier === 'FREE' && (
                <Link
                  to="/#pricing"
                  className="text-sm text-blue-600 hover:underline"
                >
                  더 많은 상담이 필요하신가요? →
                </Link>
              )}
            </div>
          </div>

          {/* 공지/팁 */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">2026년 법령 업데이트 완료</h3>
                <p className="text-sm text-blue-700">
                  국민연금 4.75%, 장기요양보험 13.14% 등 2026년 최신 요율이 반영되었습니다.
                  최저임금 10,320원도 자동 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
