import React, { createContext, useState } from "react";

export type RecoveryCategory =
  | "substance_addiction"
  | "love_failure"
  | "physical_injury"
  | "grief_loss"
  | "mental_health"
  | "burnout_stress"
  | "trauma"
  | "eating_disorder"
  | "self_harm"
  | "other";

export interface OnboardingData {
  // Step 0: Recovery Category
  recovery_category: RecoveryCategory | null;

  // Step 1: Category-specific focus
  specific_focus: string | null;       // e.g. "Alcohol", "Breakup", "Knee Surgery", "Job Burnout"
  duration_struggling: string | null;  // how long they've been struggling

  // Step 2: Goals
  primary_goal: string | null;
  day_30_goal: string | null;

  // Step 3: Triggers
  main_triggers: string[];

  // Step 4: Support & Coping
  support_network: string[];
  coping_strategies: string[];

  // Step 5: Preferences
  preferred_reminder_times: string[];
}

interface OnboardingContextType {
  onboarding: OnboardingData;
  updateOnboarding: (key: keyof OnboardingData, value: any) => void;
  resetOnboarding: () => void;
}

const defaultOnboarding: OnboardingData = {
  recovery_category: null,
  specific_focus: null,
  duration_struggling: null,
  primary_goal: null,
  day_30_goal: null,
  main_triggers: [],
  coping_strategies: [],
  support_network: [],
  preferred_reminder_times: []
};

export const OnboardingContext = createContext<OnboardingContextType>({
  onboarding: defaultOnboarding,
  updateOnboarding: () => {},
  resetOnboarding: () => {}
});

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [onboarding, setOnboarding] = useState<OnboardingData>(() => {
    // Restore recovery_category from localStorage if available
    const saved = localStorage.getItem('beacura_recovery_category');
    if (saved) {
      return { ...defaultOnboarding, recovery_category: saved as RecoveryCategory };
    }
    return defaultOnboarding;
  });

  const updateOnboarding = (key: keyof OnboardingData, value: any) => {
    setOnboarding((prev) => ({ ...prev, [key]: value }));
    // Persist category to localStorage so Dashboard can read it
    if (key === 'recovery_category' && value) {
      localStorage.setItem('beacura_recovery_category', value);
    }
  };

  const resetOnboarding = () => {
    setOnboarding(defaultOnboarding);
  };

  return (
    <OnboardingContext.Provider value={{ onboarding, updateOnboarding, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};
