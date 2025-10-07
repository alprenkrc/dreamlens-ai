import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface VideoPaywallScreenProps {
  onClose?: () => void;
  onStartTrial?: () => void;
  onRestore?: () => void;
  selectedPlan?: 'monthly' | 'yearly' | null;
  onSelectPlan?: (plan: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
  dreamTitle?: string;
  dreamDescription?: string;
}

export default function VideoPaywallScreen({ 
  onClose, 
  onStartTrial, 
  onRestore, 
  selectedPlan, 
  onSelectPlan, 
  isLoading,
  dreamTitle,
  dreamDescription 
}: VideoPaywallScreenProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.iconButton} disabled={isLoading}>
            <MaterialIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Video</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.videoIconContainer}>
              <MaterialIcons name="play-circle-filled" size={80} color="#A78BFA" />
            </View>
            <Text style={styles.heroTitle}>Bring Your Dreams to Life</Text>
            <Text style={styles.heroSubtitle}>
              Transform your dream "{dreamTitle || 'story'}" into a stunning AI-generated video
            </Text>
          </View>

          {/* Dream Preview */}
          {(dreamTitle || dreamDescription) && (
            <View style={styles.dreamPreview}>
              <Text style={styles.dreamPreviewTitle}>Your Dream:</Text>
              <Text style={styles.dreamTitle}>"{dreamTitle || 'Untitled Dream'}"</Text>
              {dreamDescription && (
                <Text style={styles.dreamDescription} numberOfLines={3}>
                  {dreamDescription}
                </Text>
              )}
            </View>
          )}

          {/* Video Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What you'll get:</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialIcons name="movie" size={24} color="#A78BFA" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>AI-Generated Video</Text>
                <Text style={styles.featureDesc}>High-quality video created from your dream description</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialIcons name="hd" size={24} color="#A78BFA" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Quality Videos</Text>
                <Text style={styles.featureDesc}>Crystal clear, cinematic quality videos</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialIcons name="speed" size={24} color="#A78BFA" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Fast Generation</Text>
                <Text style={styles.featureDesc}>Get your video in minutes, not hours</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialIcons name="download" size={24} color="#A78BFA" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Download & Share</Text>
                <Text style={styles.featureDesc}>Save to your device and share with friends</Text>
              </View>
            </View>
          </View>

          {/* Pricing Plans */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>
            <Text style={styles.pricingSubtitle}>Start with a 7-day free trial</Text>

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
                <Text style={styles.planDesc}>4 videos per month</Text>
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
                <Text style={styles.planDesc}>4 videos per month</Text>
                <Text style={styles.savingsText}>Save 33%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity 
            onPress={onStartTrial} 
            activeOpacity={0.9} 
            style={[styles.ctaButton, (isLoading || !selectedPlan) && styles.ctaButtonDisabled]} 
            disabled={isLoading || !selectedPlan}
          >
            <LinearGradient colors={["#A78BFA", "#8B5CF6"]} style={styles.ctaGradient}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.ctaContent}>
                  <MaterialIcons name="play-circle-filled" size={24} color="#ffffff" />
                  <Text style={styles.ctaText}>Start Free Trial & Create Video</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <MaterialIcons name="verified-user" size={16} color="#A78BFA" />
                <Text style={styles.trustText}>Secure Payment</Text>
              </View>
              <View style={styles.trustItem}>
                <MaterialIcons name="cancel" size={16} color="#A78BFA" />
                <Text style={styles.trustText}>Cancel Anytime</Text>
              </View>
              <View style={styles.trustItem}>
                <MaterialIcons name="privacy-tip" size={16} color="#A78BFA" />
                <Text style={styles.trustText}>Privacy Protected</Text>
              </View>
            </View>
          </View>

          {/* Restore Purchase */}
          <TouchableOpacity onPress={onRestore} style={styles.restoreButton} disabled={isLoading}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          {/* Legal Text */}
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
    backgroundColor: '#0F0A2E',
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

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  videoIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Dream Preview
  dreamPreview: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  dreamPreviewTitle: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dreamTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  dreamDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },

  // Features Section
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    marginRight: 16,
  },
  featureTextWrap: { flex: 1 },
  featureTitle: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDesc: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 14,
  },

  // Pricing Section
  pricingSection: {
    marginBottom: 32,
  },
  pricingTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  pricingSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  plansRow: { 
    flexDirection: 'row', 
    gap: 16, 
  },
  planCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#A78BFA',
  },
  bestPlanCard: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: '#A78BFA',
  },
  badge: {
    position: 'absolute',
    right: 16,
    top: -14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#A78BFA',
  },
  badgeText: { 
    color: '#ffffff', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  planTitle: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 8,
  },
  priceText: { 
    color: '#ffffff', 
    fontSize: 32, 
    fontWeight: '700' 
  },
  priceSuffix: { 
    color: 'rgba(255,255,255,0.6)', 
    marginLeft: 4,
    fontSize: 14,
    marginBottom: 4,
  },
  planDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  savingsText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
  },

  // CTA Button
  ctaButton: {
    marginBottom: 24,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: { 
    paddingVertical: 18, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 18,
  },

  // Trust Section
  trustSection: {
    marginBottom: 16,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
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

  // Restore Button
  restoreButton: { 
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontWeight: '600',
    fontSize: 16,
  },

  // Legal Text
  legalText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    lineHeight: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#A78BFA',
  },
});

