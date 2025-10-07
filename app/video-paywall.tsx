import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth } from '@/config/firebase';
import { setUserPremium } from '@/services/user';
import VideoPaywallScreen from '../components/VideoPaywallScreen';

export default function VideoPaywallRoute() {
  const router = useRouter();
  const { dreamTitle, dreamDescription } = useLocalSearchParams<{ 
    dreamTitle?: string; 
    dreamDescription?: string; 
  }>();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <VideoPaywallScreen
      onClose={() => router.back()}
      onStartTrial={async () => {
        if (!selectedPlan || isLoading) return;
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 2000));
        const user = auth.currentUser;
        if (user) await setUserPremium(user.uid, true);
        setIsLoading(false);
        router.back();
      }}
      onRestore={() => {
        router.back();
      }}
      selectedPlan={selectedPlan}
      onSelectPlan={setSelectedPlan}
      isLoading={isLoading}
      dreamTitle={dreamTitle}
      dreamDescription={dreamDescription}
    />
  );
}

