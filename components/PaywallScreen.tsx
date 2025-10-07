import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface PaywallScreenProps {
  onClose?: () => void;
  onStartTrial?: () => void;
  onRestore?: () => void;
  selectedPlan?: 'monthly' | 'yearly' | null;
  onSelectPlan?: (plan: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
}

export default function PaywallScreen({ onClose, onStartTrial, onRestore, selectedPlan, onSelectPlan, isLoading }: PaywallScreenProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.iconButton} disabled={isLoading}>
            <MaterialIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Upgrade to Premium ✨</Text>
          </View>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <MaterialIcons name="all-inclusive" size={24} color="#f2b90d" />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Unlimited Analysis</Text>
                <Text style={styles.benefitDesc}>Unlock unlimited dream analysis and insights</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <MaterialIcons name="article" size={24} color="#f2b90d" />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Detailed Interpretations</Text>
                <Text style={styles.benefitDesc}>Receive in-depth interpretations of your dreams</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <MaterialIcons name="video-library" size={24} color="#f2b90d" />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>4 Monthly Videos</Text>
                <Text style={styles.benefitDesc}>Create 4 high-quality dream videos every month</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <MaterialIcons name="hd" size={24} color="#f2b90d" />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>HD Visuals</Text>
                <Text style={styles.benefitDesc}>Generate stunning high-definition dream visuals</Text>
              </View>
            </View>
          </View>

          <View style={styles.plansRow}>
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
              activeOpacity={0.9}
              onPress={() => onSelectPlan && onSelectPlan('monthly')}
              disabled={isLoading}
            >
              <Text style={styles.planTitle}>Monthly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>$4.99</Text>
                <Text style={styles.priceSuffix}>/month</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, styles.bestPlanCard, selectedPlan === 'yearly' && styles.planCardSelected]}
              activeOpacity={0.9}
              onPress={() => onSelectPlan && onSelectPlan('yearly')}
              disabled={isLoading}
            >
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

          <TouchableOpacity onPress={onStartTrial} activeOpacity={0.9} style={[styles.ctaButton, (isLoading || !selectedPlan) && styles.ctaButtonDisabled]} disabled={isLoading || !selectedPlan}>
            <LinearGradient colors={["#f2b90d", "#f2b90d"]} style={styles.ctaGradient}>
              {isLoading ? (
                <ActivityIndicator color="#221e10" />
              ) : (
                <Text style={styles.ctaText}>Start 7-day free trial</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <MaterialIcons name="verified-user" size={16} color="#f2b90d" />
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
            <View style={styles.trustItem}>
              <MaterialIcons name="privacy-tip" size={16} color="#f2b90d" />
              <Text style={styles.trustText}>Privacy Protected</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onRestore} style={styles.restoreButton} disabled={isLoading}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#221e10', // background-dark from HTML
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    fontSize: 16,
  },
  headerSpacer: { width: 40, height: 40 },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  benefits: { 
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,185,13,0.2)',
    marginRight: 16,
  },
  benefitTextWrap: { flex: 1 },
  benefitTitle: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 16,
  },
  benefitDesc: { 
    color: 'rgba(255,255,255,0.6)', 
    marginTop: 4,
    fontSize: 14,
  },

  plansRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 32,
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#f2b90d',
  },
  bestPlanCard: {
    backgroundColor: 'rgba(242,185,13,0.2)',
    borderColor: '#f2b90d',
  },
  badge: {
    position: 'absolute',
    right: 16,
    top: -14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#f2b90d',
  },
  badgeText: { 
    color: '#221e10', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  planTitle: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 16,
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginTop: 4,
    flexWrap: 'wrap',
  },
  priceText: { 
    color: '#ffffff', 
    fontSize: 32, 
    fontWeight: '700',
    flexShrink: 0,
  },
  priceSuffix: { 
    color: 'rgba(255,255,255,0.6)', 
    marginLeft: 4,
    fontSize: 14,
    flexShrink: 1,
  },

  ctaButton: {
    marginTop: 32,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: { 
    paddingVertical: 16, 
    alignItems: 'center' 
  },
  ctaText: { 
    color: '#221e10', 
    fontWeight: '700',
    fontSize: 16,
  },

  trustRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 12 
  },

  restoreButton: { 
    marginTop: 16, 
    alignItems: 'center' 
  },
  restoreText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontWeight: '600',
    fontSize: 16,
  },
  legalText: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});


