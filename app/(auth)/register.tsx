import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <LinearGradient colors={["#3a2e5c", "#171121"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}> 
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join DreamLens AI</Text>
        </View>

        <View style={styles.form}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
            />
          </View>
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

          <TouchableOpacity disabled={loading} onPress={onRegister} style={styles.button} activeOpacity={0.9}>
            <LinearGradient colors={["#7b3fe4", "#a172f5"]} style={styles.buttonGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.muted}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Log in</Text>
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


