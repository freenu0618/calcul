/**
 * Step Wizard 상태 관리 훅
 */

import { useState, useCallback } from 'react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface UseWizardOptions {
  steps: WizardStep[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseWizardReturn {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStepData: WizardStep;
  progress: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export function useWizard({
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
}: UseWizardOptions): UseWizardReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else {
      goToStep(currentStep + 1);
    }
  }, [currentStep, isLastStep, goToStep, onComplete]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, isFirstStep, goToStep]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    onStepChange?.(initialStep);
  }, [initialStep, onStepChange]);

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    currentStepData: steps[currentStep],
    progress,
    goToStep,
    nextStep,
    prevStep,
    reset,
  };
}
