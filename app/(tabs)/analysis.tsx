import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BarChart3, TrendingUp, Calendar, Eye, Brain, Heart, Zap, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePremium } from '@/hooks/usePremium';
import { auth } from '@/config/firebase';
import { listDreams } from '@/services/dreams';
import { Dream } from '@/types/dream';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { isPremium, isLoading } = usePremium();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid ?? null;
        const items = await listDreams(uid);
        setDreams(items);
      } catch (e) {
        console.error('Failed to load dreams for analysis', e);
      } finally {
        setIsDataLoading(false);
      }
    })();
  }, []);

  const dreamStats = useMemo(() => {
    if (dreams.length === 0) {
      return {
        totalDreams: 0,
        averageVividness: 0,
        mostCommonTheme: '-',
        emotionalTone: '-',
        sleepQuality: 0,
      };
    }
    const totalDreams = dreams.length;
    const vividList = dreams.map(d => d.vividness ?? 0).filter(v => v > 0);
    const averageVividness = vividList.length ? Number((vividList.reduce((a, b) => a + b, 0) / vividList.length).toFixed(1)) : 0;
    const symbolCounts: Record<string, number> = {};
    dreams.forEach(d => (d.symbols || []).forEach(s => { symbolCounts[s] = (symbolCounts[s] || 0) + 1; }));
    const mostCommonTheme = Object.keys(symbolCounts).sort((a, b) => (symbolCounts[b] || 0) - (symbolCounts[a] || 0))[0] || '-';
    const emotionCounts: Record<string, number> = {};
    dreams.forEach(d => (d.emotions || []).forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; }));
    const topEmotion = Object.keys(emotionCounts).sort((a, b) => (emotionCounts[b] || 0) - (emotionCounts[a] || 0))[0] || '-';
    const emotionalTone = topEmotion;
    const sleepQuality = averageVividness;
    return { totalDreams, averageVividness, mostCommonTheme, emotionalTone, sleepQuality };
  }, [dreams]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d;
    });
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days.map((d) => {
      const dayDreams = dreams.filter(dr => {
        const dt = new Date(dr.date);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth() && dt.getDate() === d.getDate();
      });
      const vividList = dayDreams.map(dr => dr.vividness ?? 0).filter(v => v > 0);
      const avgVivid = vividList.length ? Math.round(vividList.reduce((a, b) => a + b, 0) / vividList.length) : 0;
      return {
        day: labels[d.getDay()],
        dreams: dayDreams.length,
        vividness: avgVivid,
      };
    });
  }, [dreams, selectedPeriod]);

  const dreamThemes = useMemo(() => {
    if (!dreams.length) return [] as { theme: string; count: number; percentage: number }[];
    const counts: Record<string, number> = {};
    dreams.forEach(d => (d.symbols || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([theme, count]) => ({ theme, count, percentage: Math.round((count / total) * 100) }));
  }, [dreams]);

  const emotions = useMemo(() => {
    if (!dreams.length) return [] as { emotion: string; percentage: number; color: string }[];
    const palette: Record<string, string> = {
      Joy: '#FBBF24', Fear: '#EF4444', Sadness: '#3B82F6', Anger: '#F97316', Surprise: '#A78BFA', Love: '#10B981', Confusion: '#6B7280'
    };
    const counts: Record<string, number> = {};
    dreams.forEach(d => (d.emotions || []).forEach(e => { counts[e] = (counts[e] || 0) + 1; }));
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, percentage: Math.round((count / total) * 100), color: palette[emotion] || '#A78BFA' }));
  }, [dreams]);

  const insights = useMemo(() => {
    const result: { title: string; description: string; icon: any; color: string }[] = [];
    if (dreamStats.averageVividness >= 7) {
      result.push({
        title: 'High Vividness',
        description: 'Your dreams are vivid. Consider journaling right after waking to boost recall.',
        icon: Zap,
        color: '#FBBF24',
      });
    }
    if (dreamStats.mostCommonTheme && dreamStats.mostCommonTheme !== '-') {
      result.push({
        title: 'Recurring Theme',
        description: `Frequent theme detected: ${dreamStats.mostCommonTheme}. Reflect on its meaning for you.`,
        icon: Brain,
        color: '#3B82F6',
      });
    }
    if (emotions[0]?.emotion) {
      result.push({
        title: 'Emotional Trend',
        description: `Dominant emotion appears to be ${emotions[0].emotion}.`,
        icon: Heart,
        color: '#EF4444',
      });
    }
    return result;
  }, [dreamStats, emotions]);

  if (isLoading || isDataLoading) {
    return (
      <LinearGradient colors={['#0F0A2E', '#2D1B69', '#6B46C1']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#C7D2FE' }}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!isPremium) {
    return (
      <LinearGradient
        colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.header}>
            <BarChart3 size={32} color="#A78BFA" />
            <Text style={styles.title}>Dream Analysis</Text>
            <Text style={styles.subtitle}>Available with Premium</Text>
          </View>

          <View style={styles.premiumGateCard}>
            <BlurView intensity={25} style={styles.premiumGateBlur}>
              <View style={styles.premiumGateInner}>
                <View style={styles.premiumGateIconWrap}>
                  <Crown size={28} color="#FBBF24" />
                </View>
                <Text style={styles.premiumGateTitle}>AI Dream Analysis</Text>
                <Text style={styles.premiumGateSubtitle}>
                  Unlock personalized interpretations, themes, and emotional insights powered by AI.
                </Text>
                <View style={styles.premiumGateFeatures}>
                  <Text style={styles.premiumGateFeature}>• Unlimited analysis and insights</Text>
                  <Text style={styles.premiumGateFeature}>• Recurring pattern detection</Text>
                  <Text style={styles.premiumGateFeature}>• Emotional tone and theme analysis</Text>
                </View>

                <View style={styles.planRow}> 
                  <View style={styles.planCard}>
                    <Text style={styles.planTitle}>Monthly</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>$4.99</Text>
                      <Text style={styles.planPriceSuffix}>/month</Text>
                    </View>
                  </View>
                  <View style={[styles.planCard, styles.planBestCard]}> 
                    <View style={styles.planBadge}><Text style={styles.planBadgeText}>Best Value</Text></View>
                    <Text style={styles.planTitle}>Yearly</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>$39.99</Text>
                      <Text style={styles.planPriceSuffix}>/year</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push('/paywall')}
                  style={styles.premiumGateButton}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#FBBF24", "#F59E0B"]}
                    style={styles.premiumGateButtonGradient}
                  >
                    <Text style={styles.premiumGateButtonText}>Start 7-day free trial</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.trustRow}>
                  <Text style={styles.trustText}>Secure • Private • Cancel anytime</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/paywall')}>
                  <Text style={styles.restoreText}>Restore Purchase</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BarChart3 size={32} color="#A78BFA" />
          <Text style={styles.title}>Dream Analysis</Text>
          <Text style={styles.subtitle}>Insights into your subconscious patterns</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Eye size={20} color="#A78BFA" />
              <Text style={styles.statNumber}>{dreamStats.totalDreams}</Text>
              <Text style={styles.statLabel}>Total Dreams</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={20} color="#F472B6" />
              <Text style={styles.statNumber}>{String(dreamStats.emotionalTone)}</Text>
              <Text style={styles.statLabel}>Top Emotion</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.statNumber}>{dreamStats.averageVividness}</Text>
              <Text style={styles.statLabel}>Avg Vividness</Text>
            </View>
            <View style={styles.statCard}>
              <Brain size={20} color="#EF4444" />
              <Text style={styles.statNumber}>{dreamStats.sleepQuality}</Text>
              <Text style={styles.statLabel}>Sleep Quality</Text>
            </View>
          </View>
        </View>

        {/* Dream Frequency Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Dream Frequency</Text>
          <BlurView intensity={20} style={styles.chartBlur}>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      { 
                        height: day.dreams * 30 + 10,
                        backgroundColor: day.vividness > 7 ? '#A78BFA' : '#6B7280'
                      }
                    ]}
                  />
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Dream Themes */}
        <View style={styles.themesContainer}>
          <Text style={styles.sectionTitle}>Common Themes</Text>
          {dreamThemes.map((theme, index) => (
            <View key={index} style={styles.themeItem}>
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{theme.theme}</Text>
                <Text style={styles.themeCount}>{theme.count} dreams</Text>
              </View>
              <View style={styles.themeBarContainer}>
                <View 
                  style={[
                    styles.themeBar,
                    { width: `${theme.percentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.themePercentage}>{theme.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* Emotional Analysis */}
        <View style={styles.emotionsContainer}>
          <Text style={styles.sectionTitle}>Emotional Patterns</Text>
          <BlurView intensity={20} style={styles.emotionsBlur}>
            {emotions.map((emotion, index) => (
              <View key={index} style={styles.emotionItem}>
                <View style={styles.emotionInfo}>
                  <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                  <Text style={styles.emotionName}>{emotion.emotion}</Text>
                </View>
                <Text style={styles.emotionPercentage}>{emotion.percentage}%</Text>
              </View>
            ))}
          </BlurView>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {insights.map((insight, index) => (
            <TouchableOpacity key={index} style={styles.insightCard}>
              <BlurView intensity={30} style={styles.insightBlur}>
                <View style={styles.insightContent}>
                  <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
                    <insight.icon size={20} color={insight.color} />
                  </View>
                  <View style={styles.insightText}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium AI Counselor CTA */}
        {isPremium ? null : (
          <TouchableOpacity style={styles.premiumCard} onPress={() => router.push('/paywall')}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.2)', 'rgba(245, 101, 101, 0.2)']}
              style={styles.premiumGradient}
            >
              <Crown size={24} color="#FBBF24" />
              <Text style={styles.premiumTitle}>Unlock AI Dream Counselor</Text>
              <Text style={styles.premiumSubtitle}>Get personalized interpretations and deeper psychological insights</Text>
              <View style={styles.premiumFeatures}>
                <Text style={styles.premiumFeature}>• Detailed dream symbolism analysis</Text>
                <Text style={styles.premiumFeature}>• Personal growth recommendations</Text>
                <Text style={styles.premiumFeature}>• Advanced pattern recognition</Text>
              </View>
              <Text style={styles.premiumPrice}>Upgrade from $4.99/month</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumGateCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  premiumGateBlur: {
    borderRadius: 20,
  },
  premiumGateInner: {
    padding: 24,
    alignItems: 'center',
  },
  premiumGateIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  premiumGateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 6,
  },
  premiumGateSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumGateFeatures: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  premiumGateFeature: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  premiumGateButton: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  premiumGateButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  premiumGateButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
  premiumGateHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  planRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  planCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planBestCard: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderColor: '#FBBF24',
  },
  planBadge: {
    position: 'absolute',
    right: 12,
    top: -12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  planBadgeText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '700',
  },
  planTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  planPriceSuffix: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
    fontSize: 12,
  },
  trustRow: {
    marginTop: 10,
  },
  trustText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  restoreText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  periodContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  periodTextActive: {
    color: '#6366F1',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  chartBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chartBar: {
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#C7D2FE',
  },
  themesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  themeInfo: {
    width: 100,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  themeCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  themeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 15,
  },
  themeBar: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  themePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    width: 40,
    textAlign: 'right',
  },
  emotionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  emotionsBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  emotionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  emotionName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emotionPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  insightCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  insightBlur: {
    padding: 1,
  },
  insightContent: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#C7D2FE',
    lineHeight: 20,
  },
  premiumCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  premiumGradient: {
    padding: 25,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 15,
  },
  premiumFeatures: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  premiumFeature: {
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 4,
  },
  premiumPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  bottomPadding: {
    height: 20,
  },
});