/**
 * Step Wizard 컨테이너 컴포넌트
 */

import { type ReactNode } from 'react';
import type { WizardStep } from './useWizard';
import StepIndicator from './StepIndicator';

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  children: ReactNode;
  onStepClick?: (index: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  showNavigation?: boolean;
  isNextDisabled?: boolean;
}

export default function StepWizard({
  steps,
  currentStep,
  children,
  onStepClick,
  onPrev,
  onNext,
  isFirstStep,
  isLastStep,
  nextLabel = '다음',
  prevLabel = '이전',
  completeLabel = '계산하기',
  showNavigation = true,
  isNextDisabled = false,
}: StepWizardProps) {
  return (
    <div className="space-y-6">
      {/* 진행 표시기 */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepClick}
      />

      {/* 현재 단계 콘텐츠 */}
      <div className="min-h-[200px]">{children}</div>

      {/* 네비게이션 버튼 */}
      {showNavigation && (
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirstStep}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors
              ${isFirstStep
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {prevLabel}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors
              ${isNextDisabled
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isLastStep ? completeLabel : nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
