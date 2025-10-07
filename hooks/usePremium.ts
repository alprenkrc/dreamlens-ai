import { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ensureUserDoc, observeUserPremium } from '@/services/user';

export function usePremium() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: undefined | (() => void);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up any previous snapshot when auth changes
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (!user) {
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      try {
        await ensureUserDoc(user.uid);
        unsubscribeSnapshot = observeUserPremium(user.uid, (value) => {
          setIsPremium(value);
          setIsLoading(false);
        });
      } catch (e) {
        setIsPremium(false);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  return { isPremium, isLoading };
}


