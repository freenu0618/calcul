/**
 * 첫 방문자 튜토리얼 오버레이
 * - localStorage로 표시 여부 관리
 * - 3단계 급여 계산 과정 안내
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'paytools_tutorial_seen';

interface TutorialOverlayProps {
  onClose?: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dontShowAgain) {
          localStorage.setItem(STORAGE_KEY, 'true');
        }
        setIsVisible(false);
        onClose?.();
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isVisible, dontShowAgain, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-slide-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">&#128075;</div>
          <h2 className="text-xl font-bold text-gray-900">PayTools에 오신 것을 환영합니다!</h2>
          <p className="text-gray-600 mt-1">간단한 3단계로 급여를 계산해보세요</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">근로자 정보 입력</h3>
              <p className="text-sm text-gray-600">고용형태, 사업장 규모, 부양가족 등</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">급여/수당 설정</h3>
              <p className="text-sm text-gray-600">기본급, 각종 수당, 공제 방식 설정</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">근무시간 입력</h3>
              <p className="text-sm text-gray-600">이번 달 실제 근무한 시프트 등록</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Tip:</strong> 각 필드의 <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-200 rounded-full">?</span> 아이콘을 클릭하면 상세 설명을 볼 수 있습니다.
          </p>
        </div>

        {/* Don't show again */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="text-sm text-gray-600">다시 보지 않기</span>
        </label>

        {/* CTA */}
        <button
          onClick={handleClose}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}