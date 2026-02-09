import React, { createContext, useState } from "react";

export interface OnboardingData {
  sobriety_substance: string | null;
  duration_addicted: string | null;
  previous_attempts: string | null;
  primary_goal: string | null;
  day_30_goal: string | null;
  main_triggers: string[];
  coping_strategies: string[];
  support_network: string[];
  preferred_reminder_times: string[];
}

interface OnboardingContextType {
  onboarding: OnboardingData;
  updateOnboarding: (key: keyof OnboardingData, value: any) => void;
  resetOnboarding: () => void;
}

const defaultOnboarding: OnboardingData = {
  sobriety_substance: null,
  duration_addicted: null,
  previous_attempts: null,
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
  const [onboarding, setOnboarding] = useState<OnboardingData>(defaultOnboarding);

  const updateOnboarding = (key: keyof OnboardingData, value: any) => {
    setOnboarding((prev) => ({ ...prev, [key]: value }));
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
