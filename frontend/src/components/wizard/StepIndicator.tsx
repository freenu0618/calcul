/**
 * Step Indicator 컴포넌트
 * 현재 진행 단계를 시각적으로 표시
 */

import type { WizardStep } from './useWizard';

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  allowClickPrevious?: boolean;
}

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowClickPrevious = true,
}: StepIndicatorProps) {
  const handleClick = (index: number) => {
    if (allowClickPrevious && index < currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full">
      {/* 데스크톱 버전 */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* 스텝 원 */}
            <button
              type="button"
              onClick={() => handleClick(index)}
              disabled={!allowClickPrevious || index >= currentStep}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all
                ${index < currentStep
                  ? 'bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700'
                  : index === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>

            {/* 스텝 정보 */}
            <div className="ml-3 min-w-0 flex-1">
              <p className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 truncate">{step.description}</p>
              )}
            </div>

            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-0.5 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 모바일 버전 */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            {currentStep + 1}단계: {steps[currentStep].title}
          </span>
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
