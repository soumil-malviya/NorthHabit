import { useLocalStorageString } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';

const TOTAL_STEPS = 6;

export function useOnboarding() {
  const [raw, setRaw] = useLocalStorageString(STORAGE_KEYS.onboardingComplete, '');
  const [stepRaw, setStepRaw] = useLocalStorageString(STORAGE_KEYS.onboardingStep, '0');

  const isComplete = raw === 'true';
  const currentStep = Math.min(
    TOTAL_STEPS - 1,
    Math.max(0, Number.parseInt(stepRaw, 10) || 0),
  );

  const completeOnboarding = () => {
    setRaw('true');
    setStepRaw(String(TOTAL_STEPS));
  };

  const setStep = (step: number) => {
    setStepRaw(String(Math.min(TOTAL_STEPS - 1, Math.max(0, step))));
  };

  const skipOnboarding = () => completeOnboarding();

  return {
    isComplete,
    currentStep,
    totalSteps: TOTAL_STEPS,
    completeOnboarding,
    setStep,
    skipOnboarding,
  };
}
