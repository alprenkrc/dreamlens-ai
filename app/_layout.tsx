import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const { isLoading: onboardingLoading, hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { authState, isGuest, hasRecordedFirstDream, setGuestMode } = useAuth();

  // Handle navigation based on app state
  useEffect(() => {
    if (onboardingLoading || authState === 'loading') return;

    if (!hasCompletedOnboarding) {
      // User hasn't seen onboarding yet - show onboarding regardless of auth state
      return;
    }

    // After onboarding is completed, handle navigation based on auth state
    if (authState === 'authenticated') {
      // Existing user with proper account - go directly to main app
      router.replace('/(tabs)');
    } else if (authState === 'guest' && !hasRecordedFirstDream) {
      // Anonymous user (guest) hasn't recorded first dream yet
      router.replace('/record');
    } else if (authState === 'unauthenticated') {
      // New user - show account choice screen
      router.replace('/account-choice');
    }
    // Removed the hasRecordedFirstDream navigation to prevent race condition
    // Navigation to auth-prompt will be handled by record screen or dream-detail screen
  }, [hasCompletedOnboarding, authState, hasRecordedFirstDream, onboardingLoading]);

  if (onboardingLoading || authState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#171121' }}>
        <ActivityIndicator size="large" color="#7b3fe4" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <OnboardingFlow
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="account-choice" />
        <Stack.Screen name="record" />
        <Stack.Screen name="auth-prompt" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dream-detail" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
