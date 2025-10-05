import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Heart, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPromptScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0F0A2E', '#2D1B69', '#6B46C1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Decorative stars */}
        <View style={styles.starsContainer}>
          <Star size={20} color="#A78BFA" style={[styles.star, { top: 50, left: 30 }]} />
          <Star size={16} color="#F472B6" style={[styles.star, { top: 80, right: 40 }]} />
          <Star size={12} color="#FBBF24" style={[styles.star, { top: 120, left: 60 }]} />
          <Sparkles size={18} color="#A78BFA" style={[styles.star, { top: 140, right: 80 }]} />
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Heart size={32} color="#F472B6" />
            </View>
            <Text style={styles.title}>Great job on your first dream!</Text>
            <Text style={styles.subtitle}>
              To save your dreams and unlock all features, create an account or sign in.
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Star size={20} color="#FBBF24" />
              </View>
              <Text style={styles.benefitText}>Save unlimited dreams</Text>
            </View>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Sparkles size={20} color="#A78BFA" />
              </View>
              <Text style={styles.benefitText}>AI-powered dream analysis</Text>
            </View>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Heart size={20} color="#F472B6" />
              </View>
              <Text style={styles.benefitText}>Track your dream patterns</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleSignUp}>
              <Text style={styles.primaryText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleLogin}>
              <Text style={styles.secondaryText}>Sign In</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.skipButton} onPress={handleContinueAsGuest}>
              <Text style={styles.skipText}>Continue as guest</Text>
            </TouchableOpacity> */}
          </View>
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
    paddingHorizontal: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  star: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    marginBottom: 40,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#7C3AED',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});
