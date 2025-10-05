import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await setAuthState('authenticated');
      router.replace('/(tabs)');
    } catch (e: any) {
      const message = e?.message ?? 'Sign-in failed';
      setError(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#3a2e5c", "#171121"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}> 
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.linksRow}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <TouchableOpacity disabled={loading} onPress={onLogin} style={styles.button} activeOpacity={0.9}>
            <LinearGradient colors={["#7b3fe4", "#a172f5"]} style={styles.buttonGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.muted}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  header: { marginTop: 24, marginBottom: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  form: { marginTop: 16 },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontWeight: '600' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  linksRow: { alignItems: 'flex-end', marginTop: 4 },
  link: { color: '#7b3fe4', fontWeight: '700' },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  buttonGradient: { paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  bottomRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'center' },
  muted: { color: 'rgba(255,255,255,0.7)' },
  errorText: { color: '#ffb4b4', marginBottom: 8 },
});


