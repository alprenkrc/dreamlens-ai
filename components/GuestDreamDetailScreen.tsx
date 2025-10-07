import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Dream } from '@/types/dream';

const { width } = Dimensions.get('window');

interface GuestDreamDetailScreenProps {
  dream: Dream;
  onPrimaryCta: () => void;
  onBackBlocked: () => void;
}

export function GuestDreamDetailScreen({ dream, onPrimaryCta, onBackBlocked }: GuestDreamDetailScreenProps) {
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0F0A2E", "#2D1B69"]} style={styles.background}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBackBlocked} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dream Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            <View style={styles.section}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Title</Text>
                <Text style={styles.infoValue}>{dream.title}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(dream.date)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Dream Description</Text>
                <Text style={styles.description}>{dream.description}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Visual</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: dream.imageUrl }} style={styles.dreamImage} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.lockNotice}>
              <Text style={styles.lockTitle}>Create an account to continue</Text>
              <Text style={styles.lockSubtitle}>Save your dreams, unlock AI analysis and videos.</Text>
              <TouchableOpacity style={styles.primaryCta} onPress={onPrimaryCta} accessibilityRole="button" accessibilityLabel="Create account">
                <Text style={styles.primaryCtaText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { marginTop: 24 },
  infoItem: { marginBottom: 16 },
  infoLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)', marginBottom: 8 },
  infoValue: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
  description: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  imageContainer: { aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  dreamImage: { width: '100%', height: '100%' },
  lockNotice: { marginTop: 24, alignItems: 'center', gap: 12 },
  lockTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  lockSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  primaryCta: { backgroundColor: '#7C3AED', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, marginTop: 8 },
  primaryCtaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default GuestDreamDetailScreen;


