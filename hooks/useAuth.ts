import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export type AuthState = 'loading' | 'guest' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  authState: AuthState;
  isGuest: boolean;
  hasRecordedFirstDream: boolean;
  setAuthState: (state: AuthState) => void;
  setGuestMode: (isGuest: boolean) => void;
  markFirstDreamRecorded: () => void;
  logout: () => void;
}

const GUEST_MODE_KEY = 'is_guest_mode';
const FIRST_DREAM_KEY = 'has_recorded_first_dream';

export function useAuth() {
  const [authState, setAuthStateInternal] = useState<AuthState>('loading');
  const [isGuest, setIsGuest] = useState(false);
  const [hasRecordedFirstDream, setHasRecordedFirstDream] = useState(false);

  useEffect(() => {
    loadInitialState();
    
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.isAnonymous) {
          setAuthStateInternal('guest');
          setIsGuest(true);
        } else {
          setAuthStateInternal('authenticated');
          setIsGuest(false);
        }
      } else {
        setAuthStateInternal('unauthenticated');
        setIsGuest(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadInitialState = async () => {
    try {
      const [savedGuestMode, savedFirstDream] = await Promise.all([
        AsyncStorage.getItem(GUEST_MODE_KEY),
        AsyncStorage.getItem(FIRST_DREAM_KEY)
      ]);

      setIsGuest(savedGuestMode === 'true');
      setHasRecordedFirstDream(savedFirstDream === 'true');
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  };

  const setAuthState = (state: AuthState) => {
    // Auth state is now managed by Firebase, this is just for compatibility
    setAuthStateInternal(state);
  };

  const setGuestMode = async (guest: boolean) => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, guest.toString());
      setIsGuest(guest);
      if (guest) {
        setAuthState('guest');
      }
    } catch (error) {
      console.error('Error saving guest mode:', error);
    }
  };

  const markFirstDreamRecorded = async () => {
    try {
      await AsyncStorage.setItem(FIRST_DREAM_KEY, 'true');
      setHasRecordedFirstDream(true);
    } catch (error) {
      console.error('Error marking first dream recorded:', error);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear local storage
      await Promise.all([
        AsyncStorage.removeItem(GUEST_MODE_KEY),
        AsyncStorage.removeItem(FIRST_DREAM_KEY)
      ]);
      
      setIsGuest(false);
      setHasRecordedFirstDream(false);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    authState,
    isGuest,
    hasRecordedFirstDream,
    setAuthState,
    setGuestMode,
    markFirstDreamRecorded,
    logout,
  };
}
