import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text, BackHandler } from 'react-native';
import DreamDetailScreen from '@/components/DreamDetailScreen';
import { Dream } from '@/types/dream';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { deleteDream } from '@/services/dreams';

export default function DreamDetail() {
  const { dreamId } = useLocalSearchParams<{ dreamId: string }>();
  const { isGuest, hasRecordedFirstDream } = useAuth();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);


  // Check if this is a first-time guest user viewing their first dream
  const isFirstDreamForGuest = isGuest && hasRecordedFirstDream;

  useEffect(() => {
    loadDream();
  }, [dreamId]);

  const loadDream = async () => {
    if (!dreamId) {
      console.error('No dreamId provided');
      setLoading(false);
      // Show error message and redirect to home
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
      return;
    }

    try {
      const dreamDoc = await getDoc(doc(db, 'dreams', dreamId));
      
      if (!dreamDoc.exists()) {
        console.error('Dream not found:', dreamId);
        setLoading(false);
        setTimeout(() => {
          router.replace('/(tabs)/gallery');
        }, 1000);
        return;
      }

      const data = dreamDoc.data();
      
      const loadedDream: Dream = {
        id: dreamDoc.id,
        title: data.title ?? '',
        date: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
        description: data.description ?? '',
        originalDreamText: data.originalDreamText ?? '',
        imageUrl: data.imageUrl ?? '',
        symbols: data.symbols ?? [],
        emotions: data.emotions ?? [],
        fortune: data.fortune ?? '',
        vividness: data.vividness ?? 5,
        createdAt: data.createdAt?.toDate?.().toISOString?.(),
        updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
      };

      setDream(loadedDream);
    } catch (error) {
      console.error('Error loading dream:', error);
      setLoading(false);
      setTimeout(() => {
        router.replace('/(tabs)/gallery');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/gallery');
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  const handleEdit = () => {
    router.push('/(tabs)/gallery');
  };

  const handleDelete = async () => {
    if (!dreamId) return;
    
    try {
      await deleteDream(dreamId);
      // Navigate back to gallery after successful deletion
      router.replace('/(tabs)/gallery');
    } catch (error) {
      console.error('Error deleting dream:', error);
      // You could show an error alert here if needed
    }
  };

  const handleNavigate = (screen: string) => {
    switch (screen) {
      case 'home':
        router.push('/(tabs)');
        break;
      case 'journal':
        router.push('/(tabs)/gallery');
        break;
      case 'analysis':
        router.push('/(tabs)/analysis');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
    }
  };

  const handleContinueAsGuest = () => {
    // For first-time guest users, navigate to auth prompt
    if (isFirstDreamForGuest) {
      router.replace('/auth-prompt');
    } else {
      router.push('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading your dream...</Text>
      </View>
    );
  }

  if (!dream) {
    return null;
  }

  return (
    <DreamDetailScreen
      dream={dream}
      onBack={handleBack}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onNavigate={handleNavigate}
      isFirstDreamForGuest={isFirstDreamForGuest}
      onContinue={handleContinueAsGuest}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A2E',
  },
  loadingText: {
    color: '#A78BFA',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});
