import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface PaywallScreenProps {
  onClose?: () => void;
  onStartTrial?: () => void;
  onRestore?: () => void;
}

export default function PaywallScreen({ onClose, onStartTrial, onRestore }: PaywallScreenProps) {
  return (
    <LinearGradient colors={["#3a2e5c", "#171121"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Upgrade to Premium ✨</Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <Text style={styles.benefitIcon}>∞</Text>
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Unlimited Analysis</Text>
                <Text style={styles.benefitDesc}>Unlock unlimited dream analysis and insights</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <Text style={styles.benefitIcon}>📄</Text>
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Detailed Interpretations</Text>
                <Text style={styles.benefitDesc}>Receive in-depth interpretations of your dreams</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <Text style={styles.benefitIcon}>🌙</Text>
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Lucid Dream Guide</Text>
                <Text style={styles.benefitDesc}>Learn techniques to control your dreams</Text>
              </View>
            </View>
          </View>

          <View style={styles.plansRow}>
            <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
              <Text style={styles.planTitle}>Monthly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>$4.99</Text>
                <Text style={styles.priceSuffix}>/month</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planCard, styles.bestPlanCard]} activeOpacity={0.9}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Best Value</Text>
              </View>
              <Text style={styles.planTitle}>Yearly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>$39.99</Text>
                <Text style={styles.priceSuffix}>/year</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onStartTrial} activeOpacity={0.9} style={styles.ctaButton}>
            <LinearGradient colors={["#f2b90d", "#f2b90d"]} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Start 7-day free trial</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <Text style={styles.trustText}>✔ Secure Payment</Text>
            <Text style={styles.trustDot}>•</Text>
            <Text style={styles.trustText}>🔒 Privacy Protected</Text>
          </View>

          <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 18,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  headerSpacer: { width: 40, height: 40 },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  benefits: { marginTop: 24, gap: 12 },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,185,13,0.2)',
    marginRight: 12,
  },
  benefitIcon: { fontSize: 20 },
  benefitTextWrap: { flex: 1 },
  benefitTitle: { color: '#ffffff', fontWeight: '700' },
  benefitDesc: { color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  plansRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bestPlanCard: {
    backgroundColor: 'rgba(242,185,13,0.2)',
    borderColor: '#f2b90d',
  },
  badge: {
    position: 'absolute',
    right: 12,
    top: -10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#f2b90d',
  },
  badgeText: { color: '#221e10', fontSize: 10, fontWeight: '800' },
  planTitle: { color: '#ffffff', fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  priceText: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  priceSuffix: { color: 'rgba(255,255,255,0.6)', marginLeft: 6 },

  ctaButton: {
    marginTop: 24,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#221e10', fontWeight: '800' },

  trustRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trustText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  trustDot: { color: 'rgba(255,255,255,0.6)' },

  restoreButton: { marginTop: 16, alignItems: 'center' },
  restoreText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  legalText: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});


