import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  title: string;
  description: string;
  emoji: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  isLastStep?: boolean;
}

export default function OnboardingScreen({
  title,
  description,
  emoji,
  currentStep,
  totalSteps,
  onNext,
  isLastStep = false,
}: OnboardingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value((currentStep + 1) / totalSteps)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const renderProgress = () => {
    const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
    return (
      <View style={styles.progressWrapper}>
        <View
          style={styles.progressTrack}
          onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}`}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: trackWidth ? Animated.multiply(progressAnim, trackWidth) : 0,
              },
            ]}
          />
        </View>
        <Animated.Text style={[styles.stepText, { transform: [{ translateY }] }]}>
          {currentStep + 1}/{totalSteps}
        </Animated.Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#3a2e5c', '#171121']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#171121" />

      {/* Animated Background Blobs */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            top: -80,
            left: -80,
            opacity: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.45] }),
            transform: [
              { translateX: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) },
              { translateY: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
              { scale: 1.2 },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#7b3fe4', 'rgba(123,63,228,0.2)']} style={styles.blobGradient} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            bottom: -120,
            right: -100,
            opacity: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.35] }),
            transform: [
              { translateX: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
              { translateY: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
              { scale: 1.1 },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#a172f5', 'rgba(161,114,245,0.15)']} style={styles.blobGradient} />
      </Animated.View>

      {/* Header reserved space (skip removed) */}
      <View style={styles.header} />

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={[styles.emojiContainer, { transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {renderProgress()}
        <TouchableOpacity
          style={[styles.button, isLastStep && styles.lastButton]}
          onPress={onNext}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isLastStep ? 'Get Started' : 'Continue'}
        >
          <LinearGradient
            colors={['#7b3fe4', '#a172f5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {isLastStep ? 'Get Started' : 'Continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  // skip removed
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -32,
  },
  emojiContainer: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(123, 63, 228, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 96,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Space Grotesk',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  progressWrapper: {
    marginBottom: 24,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(123, 63, 228, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#7b3fe4',
  },
  stepText: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#7b3fe4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lastButton: {
    shadowColor: '#7b3fe4',
    shadowOpacity: 0.4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  blobGradient: {
    flex: 1,
    borderRadius: 130,
  },
});
