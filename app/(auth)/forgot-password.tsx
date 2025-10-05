import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Password reset email sent. Check your inbox.');
      Alert.alert('Email sent', 'Check your inbox for reset instructions.');
    } catch (e: any) {
      const message = e?.message ?? 'Failed to send reset email';
      setError(message);
      Alert.alert('Reset Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#3a2e5c", "#171121"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}> 
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>We'll send you a reset link</Text>
        </View>

        <View style={styles.form}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!info && <Text style={styles.infoText}>{info}</Text>}
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

          <TouchableOpacity disabled={loading} onPress={onReset} style={styles.button} activeOpacity={0.9}>
            <LinearGradient colors={["#7b3fe4", "#a172f5"]} style={styles.buttonGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset link</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.muted}>Remembered your password?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Back to login</Text>
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
  infoText: { color: '#b8f5b8', marginBottom: 8 },
});


