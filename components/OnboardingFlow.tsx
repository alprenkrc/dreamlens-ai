import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingScreen from './OnboardingScreen';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingData = [
  {
    title: 'Discover Your Dreams',
    description: 'Track, analyze, and visualize your dreams with the power of AI.',
    emoji: '🌙',
  },
  {
    title: 'Visualize',
    description: 'Tell your dream and watch AI paint it into mesmerizing art.',
    emoji: '🎨',
  },
  {
    title: 'Analyze & Interpret',
    description: 'Symbolic analysis and personal insights tailored to your dreams.',
    emoji: '🔮',
  },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    onComplete();
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const currentData = useMemo(() => onboardingData[currentStep], [currentStep]);
  const isLastStep = useMemo(() => currentStep === onboardingData.length - 1, [currentStep]);

  return (
    <View style={styles.container}>
      <OnboardingScreen
        title={currentData.title}
        description={currentData.description}
        emoji={currentData.emoji}
        currentStep={currentStep}
        totalSteps={onboardingData.length}
        onNext={handleNext}
        onSkip={handleSkip}
        isLastStep={isLastStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

