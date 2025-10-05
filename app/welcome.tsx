import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Moon, Star, Sparkles, ArrowRight, Eye, Brain, Heart } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  
  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  const starRotation = useSharedValue(0);
  const floatingY = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    fadeIn.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });
    slideUp.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    
    // Continuous animations
    starRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }), 
      -1
    );
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const animatedStarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  const animatedFloatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingY.value }],
  }));

  return (
    <LinearGradient 
      colors={['#0F0A2E', '#2D1B69', '#6B46C1', '#8B5CF6']} 
      style={styles.container}
    >
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingElement,
              animatedFloatingStyle,
              {
                left: Math.random() * width * 0.8,
                top: Math.random() * height * 0.6 + 100,
                animationDelay: Math.random() * 2000,
              }
            ]}
          >
            <Star size={12 + Math.random() * 8} color="#A78BFA" opacity={0.6} />
          </Animated.View>
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, animatedContainerStyle]}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Animated.View style={[styles.logoContainer, animatedFloatingStyle]}>
              <LinearGradient
                colors={['#A78BFA', '#C084FC', '#E879F9']}
                style={styles.logoGradient}
              >
                <Animated.View style={animatedStarStyle}>
                  <Moon size={40} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
              <View style={styles.logoGlow} />
            </Animated.View>
            
            <Text style={styles.title}>DreamLens</Text>
            <Text style={styles.subtitle}>
              Unlock the mysteries of your subconscious mind with AI-powered dream analysis
            </Text>

            {/* Feature Pills */}
            <View style={styles.featurePills}>
              <BlurView intensity={20} style={styles.featurePill}>
                <Eye size={16} color="#A78BFA" />
                <Text style={styles.featurePillText}>AI Analysis</Text>
              </BlurView>
              <BlurView intensity={20} style={styles.featurePill}>
                <Brain size={16} color="#F472B6" />
                <Text style={styles.featurePillText}>Dream Insights</Text>
              </BlurView>
              <BlurView intensity={20} style={styles.featurePill}>
                <Heart size={16} color="#FBBF24" />
                <Text style={styles.featurePillText}>Personal Growth</Text>
              </BlurView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#8B5CF6', '#A78BFA']}
                  style={styles.primaryGradient}
                >
                  <Text style={styles.primaryButtonText}>Start Your Journey</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                <BlurView intensity={30} style={styles.secondaryBlur}>
                  <Text style={styles.secondaryButtonText}>I already have an account</Text>
                </BlurView>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)')} 
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Sparkles size={16} color="#A78BFA" />
              <Text style={styles.skipText}>Try as guest</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement: {
    position: 'absolute',
  },
  safeArea: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 20 
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#A78BFA',
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  title: { 
    color: '#FFFFFF', 
    fontSize: 42, 
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featurePillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionSection: {
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryBlur: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  skipButton: { 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
    gap: 8,
  },
  skipText: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 16,
    fontWeight: '500',
  },
});


