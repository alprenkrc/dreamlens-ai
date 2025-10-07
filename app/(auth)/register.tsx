import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme, useWindowDimensions } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  const colorScheme = useColorScheme();
  const { height } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme !== 'light';
  const gradientColors = useMemo(() => (isDark ? ["#0f0c29", "#302b63", "#24243e"] : ["#f2f7ff", "#e8ecff"]), [isDark]);
  const buttonColors = useMemo(() => (isDark ? ["#7b3fe4", "#a172f5"] : ["#6a5be2", "#8b79f7"]), [isDark]);

  const onRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user && name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await setAuthState('authenticated');
      router.replace('/(tabs)');
    } catch (e: any) {
      const message = e?.message ?? 'Registration failed';
      setError(message);
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradientColors as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>Create your account</Text>
              <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>Join DreamLens AI</Text>
            </View>

            <View style={styles.form}>
              {!!error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}

              <View style={styles.field}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>Name</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="Your name"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={name}
                  onChangeText={setName}
                  textContentType="name"
                  accessibilityLabel="Name"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>Email</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="you@example.com"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  textContentType="emailAddress"
                  accessibilityLabel="Email"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, isDark ? styles.inputDark : styles.inputLight]}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    textContentType="password"
                    accessibilityLabel="Password"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.toggle}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                disabled={loading}
                onPress={onRegister}
                style={[styles.button, loading && styles.buttonDisabled]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Sign Up"
              >
                <LinearGradient colors={buttonColors as any} style={styles.buttonGradient}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={[styles.muted, isDark ? styles.mutedDark : styles.mutedLight]}>Already have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity accessibilityRole="link" accessibilityLabel="Log in">
                    <Text style={styles.link}>Log in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  scrollContent: { paddingBottom: 24 },
  header: { marginTop: 8, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  titleDark: { color: '#fff' },
  titleLight: { color: '#0f0c29' },
  subtitle: { marginTop: 6 },
  subtitleDark: { color: 'rgba(255,255,255,0.7)' },
  subtitleLight: { color: 'rgba(0,0,0,0.6)' },
  form: { marginTop: 16 },
  field: { marginBottom: 16 },
  label: { marginBottom: 8, fontWeight: '600' },
  labelDark: { color: 'rgba(255,255,255,0.9)' },
  labelLight: { color: 'rgba(0,0,0,0.8)' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputDark: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
  inputLight: { color: '#111826', backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 64 },
  toggle: { position: 'absolute', right: 12, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  toggleText: { color: '#7b3fe4', fontWeight: '700' },
  link: { color: '#7b3fe4', fontWeight: '700' },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  bottomRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'center' },
  muted: {},
  mutedDark: { color: 'rgba(255,255,255,0.7)' },
  mutedLight: { color: 'rgba(0,0,0,0.6)' },
  errorText: { color: '#ffb4b4', marginBottom: 8 },
});


