/**
 * 마이페이지 - 계정 및 구독 관리
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import type { SubscriptionTier } from '../../hooks/useSubscription';

// 플랜 정보
const planInfo: Record<SubscriptionTier, { name: string; price: string; color: string }> = {
  FREE: { name: 'Free', price: '$0', color: 'gray' },
  TRIAL: { name: 'Basic (체험)', price: '$9.99', color: 'green' },
  BASIC: { name: 'Basic', price: '$9.99', color: 'blue' },
  PRO: { name: 'Pro', price: '$14.99', color: 'purple' },
  ENTERPRISE: { name: 'Enterprise', price: '문의', color: 'amber' },
};

export default function MyPage() {
  const { user, logout } = useAuth();
  const { tier, tierLabel, usage, limits } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const plan = planInfo[tier];

  // 사용량 계산
  const usageItems = [
    {
      label: '등록 직원',
      used: usage.employees,
      limit: limits.maxEmployees,
      unit: '명',
    },
    {
      label: 'AI 상담',
      used: usage.aiChats,
      limit: limits.aiChatsPerMonth,
      unit: '회/월',
    },
    {
      label: '급여 계산',
      used: usage.salaryCalcs,
      limit: limits.salaryCalcsPerMonth,
      unit: '회/월',
    },
  ];

  return (
    <>
      <Helmet>
        <title>마이페이지 | PayTools</title>
      </Helmet>

      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 계정 정보 */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                계정 정보
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">이름</label>
                  <p className="font-medium text-gray-900">{user?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">이메일</label>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">요금제</label>
                  <p className="font-medium text-gray-900">{tierLabel}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </div>
            </section>

            {/* 구독 정보 */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                구독 정보
              </h2>

              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-${plan.color}-100 text-${plan.color}-700`}>
                  <span className={`w-2 h-2 rounded-full bg-${plan.color}-500`} />
                  {tierLabel} 플랜
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">월 요금</span>
                  <span className="font-medium">{plan.price}/월</span>
                </div>
                {tier === 'TRIAL' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">체험 종료일</span>
                    <span className="font-medium text-orange-600">3일 후</span>
                  </div>
                )}
                {(tier === 'BASIC' || tier === 'PRO') && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">다음 결제일</span>
                    <span className="font-medium">-</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {tier === 'FREE' && (
                  <Link
                    to="/#pricing"
                    className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-semibold rounded-lg transition-colors"
                  >
                    플랜 업그레이드
                  </Link>
                )}
                {tier === 'BASIC' && (
                  <Link
                    to="/#pricing"
                    className="block w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-center text-sm font-semibold rounded-lg transition-colors"
                  >
                    Pro로 업그레이드
                  </Link>
                )}
                {(tier === 'BASIC' || tier === 'PRO' || tier === 'TRIAL') && (
                  <button className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium">
                    구독 관리
                  </button>
                )}
              </div>
            </section>

            {/* 사용량 현황 */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                이번 달 사용량
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                {usageItems.map((item) => {
                  const percent = item.limit === Infinity ? 0 : Math.round((item.used / item.limit) * 100);
                  const isWarning = percent >= 80;

                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-medium ${isWarning ? 'text-orange-600' : ''}`}>
                          {item.used} / {item.limit === Infinity ? '무제한' : `${item.limit}${item.unit}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isWarning ? 'bg-orange-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {tier === 'FREE' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Basic 플랜으로 업그레이드하면 무제한 급여 계산과 더 많은 AI 상담을 이용할 수 있습니다.
                  </p>
                </div>
              )}
            </section>

            {/* 계정 설정 */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 설정</h2>

              <div className="space-y-4">
                <button className="flex items-center justify-between w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="font-medium text-gray-900">비밀번호 변경</p>
                    <p className="text-sm text-gray-500">계정 보안을 위해 정기적으로 변경하세요</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-between w-full p-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-red-600">계정 삭제</p>
                    <p className="text-sm text-gray-500">모든 데이터가 영구적으로 삭제됩니다</p>
                  </div>
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* 계정 삭제 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
              <p className="text-gray-600 mb-6">
                탈퇴 시 모든 데이터(직원 정보, 급여 기록 등)가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  취소
                </button>
                <button className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </>
  );
}
