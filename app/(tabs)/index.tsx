import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Moon, Star, Zap, TrendingUp, Crown, Heart, BookOpen, Calendar, Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePremium } from '@/hooks/usePremium';
import { listDreams } from '@/services/dreams';
import { Dream } from '@/types/dream';
import { auth } from '@/config/firebase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dreamStats, setDreamStats] = useState({
    totalDreams: 0,
    mostCommonEmotion: 'Joy',
    currentStreak: 0,
    averageVividness: 0
  });
  const { isPremium } = usePremium();

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening';
    } else {
      return 'Sweet Dreams';
    }
  };

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const uid = auth.currentUser?.uid ?? null;
      const dreamsList = await listDreams(uid);
      setDreams(dreamsList);
      calculateStats(dreamsList);
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDreams();
  };

  const calculateStats = (dreamsList: Dream[]) => {
    const totalDreams = dreamsList.length;
    
    // Calculate average vividness
    const vividDreams = dreamsList.filter(d => d.vividness && d.vividness > 0);
    const averageVividness = vividDreams.length > 0 
      ? Number((vividDreams.reduce((sum, d) => sum + (d.vividness || 0), 0) / vividDreams.length).toFixed(1))
      : 0;
    
    // Find most common emotion
    const emotionCounts: { [key: string]: number } = {};
    dreamsList.forEach(dream => {
      dream.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    
    const mostCommonEmotion = Object.keys(emotionCounts).length > 0
      ? Object.entries(emotionCounts).reduce((a, b) => emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b)[0]
      : 'Joy';
    
    // Calculate current streak (consecutive days with dreams)
    const currentStreak = calculateDreamStreak(dreamsList);
    
    setDreamStats({
      totalDreams,
      mostCommonEmotion,
      currentStreak,
      averageVividness
    });
  };

  const calculateDreamStreak = (dreamsList: Dream[]): number => {
    if (dreamsList.length === 0) return 0;
    
    const today = new Date();
    const sortedDreams = dreamsList.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const dream of sortedDreams) {
      const dreamDate = new Date(dream.date);
      const daysDiff = Math.floor((currentDate.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(dreamDate);
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysAgo} days ago`;
    }
  };

  const recentDreams = dreams.slice(0, 3).map(dream => ({
    id: dream.id,
    title: dream.title,
    date: formatDate(dream.date),
    vividness: dream.vividness || 0
  })).filter(dream => dream.id); // Filter out dreams without ID

  return (
    <LinearGradient
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
          <Text style={styles.title}>Dream Explorer</Text>
          <View style={styles.constellation}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={8} 
                color="#A78BFA" 
                style={[styles.star, { 
                  left: Math.random() * width * 0.8,
                  top: Math.random() * 50
                }]} 
              />
            ))}
          </View>
        </View>

        {/* Quick Record Button */}
        <TouchableOpacity
          style={styles.quickRecordButton}
          onPress={() => router.push('/record')}
        >
          <BlurView intensity={40} style={styles.quickRecordBlur}>
            <Moon size={24} color="#A78BFA" />
            <Text style={styles.quickRecordText}>Record Last Night's Dream</Text>
            <Zap size={20} color="#FBBF24" />
          </BlurView>
        </TouchableOpacity>

        {/* Dream Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Dream Insights</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BookOpen size={20} color="#8B5CF6" style={{ marginBottom: 5 }} />
              <Text style={styles.statNumber}>{dreamStats.totalDreams}</Text>
              <Text style={styles.statLabel}>Total Dreams</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={20} color="#F472B6" style={{ marginBottom: 5 }} />
              <Text style={styles.statNumber}>{dreamStats.mostCommonEmotion}</Text>
              <Text style={styles.statLabel}>Top Emotion</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={20} color="#10B981" style={{ marginBottom: 5 }} />
              <Text style={styles.statNumber}>{dreamStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Eye size={20} color="#FBBF24" style={{ marginBottom: 5 }} />
              <Text style={styles.statNumber}>{dreamStats.averageVividness}</Text>
              <Text style={styles.statLabel}>Avg Vividness</Text>
            </View>
          </View>
        </View>

        {/* Recent Dreams */}
        <View style={styles.recentDreamsContainer}>
          <Text style={styles.sectionTitle}>Recent Dreams</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading dreams...</Text>
            </View>
          ) : recentDreams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No dreams recorded yet</Text>
              <Text style={styles.emptySubtext}>Start by recording your first dream!</Text>
            </View>
          ) : (
            recentDreams.map((dream) => (
            <TouchableOpacity 
              key={dream.id} 
              style={styles.dreamCard}
              onPress={() => {
                router.push({ pathname: '/dream-detail', params: { dreamId: dream.id } });
              }}
            >
              <BlurView intensity={30} style={styles.dreamCardBlur}>
                <View style={styles.dreamCardContent}>
                  <View style={styles.dreamInfoContainer}>
                    <Text style={styles.dreamTitle} numberOfLines={1} ellipsizeMode="tail">
                      {dream.title}
                    </Text>
                    <Text style={styles.dreamDate}>{dream.date}</Text>
                  </View>
                  <View style={styles.vividnessContainer}>
                    <Text style={styles.vividnessScore}>{dream.vividness}</Text>
                    <Text style={styles.vividnessLabel}>Vividness</Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
            ))
          )}
        </View>

        {/* Premium Upgrade */}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => router.push('/paywall')}
          >
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.2)', 'rgba(245, 101, 101, 0.2)']}
              style={styles.premiumGradient}
            >
              <Crown size={24} color="#FBBF24" />
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>Unlimited dreams • AI Counselor • HD Visuals</Text>
              <Text style={styles.premiumPrice}>$4.99/month</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    position: 'relative',
  },
  constellation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
  },
  greeting: {
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickRecordButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickRecordBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  quickRecordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 15,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
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
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 5,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  recentDreamsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  dreamCard: {
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  dreamCardBlur: {
    padding: 1,
  },
  dreamCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
  },
  dreamInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dreamDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  vividnessContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  vividnessScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  vividnessLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  premiumCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 20,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 10,
  },
  premiumPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  bottomPadding: {
    height: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#A78BFA',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});