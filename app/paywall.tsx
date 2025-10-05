import React from 'react';
import { useRouter } from 'expo-router';
import PaywallScreen from '../components/PaywallScreen';

export default function PaywallRoute() {
  const router = useRouter();

  return (
    <PaywallScreen
      onClose={() => router.back()}
      onStartTrial={() => {
        // Wire to purchase flow here
      }}
      onRestore={() => {
        // Wire to restore purchases here
      }}
    />
  );
}


