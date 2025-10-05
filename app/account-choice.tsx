import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { User, Sparkles, ArrowRight, LogIn } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AccountChoiceScreen() {
  const router = useRouter();
  const { setGuestMode } = useAuth();
  
  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    slideUp.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.2)) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const handleContinueAsGuest = async () => {
    await setGuestMode(true);
    router.replace('/record');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  return (
    <LinearGradient 
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#A78BFA', '#C084FC']}
                style={styles.iconGradient}
              >
                <User size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Welcome to DreamLens!</Text>
            <Text style={styles.subtitle}>
              Do you already have an account, or would you like to try the app first?
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Continue as Guest */}
            <TouchableOpacity 
              style={styles.guestOption} 
              onPress={handleContinueAsGuest}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.optionBlur}>
                <View style={styles.optionContent}>
                  <View style={styles.optionIcon}>
                    <Sparkles size={24} color="#FBBF24" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Try the App First</Text>
                    <Text style={styles.optionDescription}>
                      Record and analyze your first dream to see how DreamLens works
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#A78BFA" />
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* Login */}
            <TouchableOpacity 
              style={styles.loginOption} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.optionBlur}>
                <View style={styles.optionContent}>
                  <View style={styles.optionIcon}>
                    <LogIn size={24} color="#10B981" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>I Have an Account</Text>
                    <Text style={styles.optionDescription}>
                      Sign in to access your saved dreams and insights
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#A78BFA" />
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* Sign Up */}
            <TouchableOpacity 
              style={styles.signupOption} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.signupGradient}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIcon}>
                    <User size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, { color: '#FFFFFF' }]}>Create New Account</Text>
                    <Text style={[styles.optionDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                      Get full access to all features and save your dreams
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom Note */}
          <View style={styles.bottomNote}>
            <Text style={styles.noteText}>
              You can always create an account later to save your dreams and unlock premium features
            </Text>
          </View>
        </Animated.View>
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
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  guestOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  signupOption: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  optionBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signupGradient: {
    // No additional styles needed, gradient handles the background
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#C7D2FE',
    lineHeight: 20,
  },
  bottomNote: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
