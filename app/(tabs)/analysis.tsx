import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BarChart3, TrendingUp, Calendar, Eye, Brain, Heart, Zap, Crown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const dreamStats = {
    totalDreams: 47,
    lucidDreams: 12,
    averageVividness: 8.2,
    mostCommonTheme: 'Flying',
    emotionalTone: 'Positive',
    sleepQuality: 8.5,
  };

  const weeklyData = [
    { day: 'Mon', dreams: 1, vividness: 7 },
    { day: 'Tue', dreams: 2, vividness: 9 },
    { day: 'Wed', dreams: 0, vividness: 0 },
    { day: 'Thu', dreams: 1, vividness: 6 },
    { day: 'Fri', dreams: 2, vividness: 8 },
    { day: 'Sat', dreams: 1, vividness: 9 },
    { day: 'Sun', dreams: 2, vividness: 7 },
  ];

  const dreamThemes = [
    { theme: 'Flying', count: 12, percentage: 25 },
    { theme: 'Water', count: 8, percentage: 17 },
    { theme: 'Animals', count: 7, percentage: 15 },
    { theme: 'Family', count: 6, percentage: 13 },
    { theme: 'School/Work', count: 5, percentage: 11 },
    { theme: 'Other', count: 9, percentage: 19 },
  ];

  const emotions = [
    { emotion: 'Joy', percentage: 35, color: '#FBBF24' },
    { emotion: 'Wonder', percentage: 25, color: '#A78BFA' },
    { emotion: 'Fear', percentage: 20, color: '#EF4444' },
    { emotion: 'Confusion', percentage: 12, color: '#6B7280' },
    { emotion: 'Sadness', percentage: 8, color: '#3B82F6' },
  ];

  const insights = [
    {
      title: 'Lucid Dream Potential',
      description: 'Your dream recall is excellent! Try reality checks during flying dreams.',
      icon: Zap,
      color: '#FBBF24',
    },
    {
      title: 'Recurring Patterns',
      description: 'Water appears frequently in your dreams, often symbolizing emotions.',
      icon: Brain,
      color: '#3B82F6',
    },
    {
      title: 'Emotional Balance',
      description: 'Your dreams show positive emotional patterns with occasional anxiety.',
      icon: Heart,
      color: '#EF4444',
    },
  ];

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
              <Zap size={20} color="#FBBF24" />
              <Text style={styles.statNumber}>{dreamStats.lucidDreams}</Text>
              <Text style={styles.statLabel}>Lucid Dreams</Text>
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
        <TouchableOpacity style={styles.premiumCard}>
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

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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