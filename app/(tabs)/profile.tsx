import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { listDreams } from '@/services/dreams';
import { Dream } from '@/types/dream';
import { 
  User, 
  Settings, 
  Crown, 
  Moon,
  Zap,
  Star,
  Award,
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { isPremium } = usePremium();

  const [userStats, setUserStats] = useState({
    name: 'Dream Explorer',
    memberSince: '—',
    totalDreams: 0,
    lucidDreams: 0,
    currentStreak: 0,
    level: 'Mystic Dreamer',
    badges: 0,
  });
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is anonymous (guest) or has proper email/password account
  const isGuestUser = currentUser?.isAnonymous || !currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && !user.isAnonymous) {
        const displayName = user.displayName || user.email || 'Dream Explorer';
        let memberSince = '—';
        const created = user.metadata?.creationTime;
        if (created) {
          const date = new Date(created);
          memberSince = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
        }
        setUserStats((prev) => ({
          ...prev,
          name: String(displayName),
          memberSince,
        }));
      } else {
        setUserStats((prev) => ({ ...prev, name: 'Guest', memberSince: '—' }));
      }
    });
    return unsubscribe;
  }, []);

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
    
    // Calculate lucid dreams (dreams with high vividness or containing "lucid" in description)
    const lucidDreams = dreamsList.filter(dream => 
      dream.vividness && dream.vividness >= 8 || 
      dream.description.toLowerCase().includes('lucid')
    ).length;
    
    // Calculate current streak
    const currentStreak = calculateDreamStreak(dreamsList);
    
    // Calculate badges based on achievements
    const badges = calculateBadges(dreamsList);
    
    // Determine level based on total dreams
    const level = getLevel(totalDreams);
    
    setUserStats(prev => ({
      ...prev,
      totalDreams,
      lucidDreams,
      currentStreak,
      badges,
      level,
    }));
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

  const calculateBadges = (dreamsList: Dream[]): number => {
    let badgeCount = 0;
    
    // First Dream badge
    if (dreamsList.length >= 1) badgeCount++;
    
    // Dream Streak badge (7+ days)
    if (calculateDreamStreak(dreamsList) >= 7) badgeCount++;
    
    // Lucid Master badge (5+ lucid dreams)
    const lucidDreams = dreamsList.filter(dream => 
      dream.vividness && dream.vividness >= 8 || 
      dream.description.toLowerCase().includes('lucid')
    ).length;
    if (lucidDreams >= 5) badgeCount++;
    
    // Deep Dreamer badge (25+ total dreams)
    if (dreamsList.length >= 25) badgeCount++;
    
    return badgeCount;
  };

  const getLevel = (totalDreams: number): string => {
    if (totalDreams === 0) return 'Dream Novice';
    if (totalDreams < 5) return 'Dream Explorer';
    if (totalDreams < 15) return 'Mystic Dreamer';
    if (totalDreams < 30) return 'Dream Master';
    if (totalDreams < 50) return 'Lucid Legend';
    return 'Dream Oracle';
  };

  const achievements = [
    { 
      id: 1, 
      title: 'First Dream', 
      description: 'Recorded your first dream', 
      earned: userStats.totalDreams >= 1, 
      icon: Star 
    },
    { 
      id: 2, 
      title: 'Dream Streak', 
      description: '7 days in a row', 
      earned: userStats.currentStreak >= 7, 
      icon: Award 
    },
    { 
      id: 3, 
      title: 'Lucid Master', 
      description: '5 lucid dreams', 
      earned: userStats.lucidDreams >= 5, 
      icon: Zap 
    },
    { 
      id: 4, 
      title: 'Deep Dreamer', 
      description: '25 total dreams', 
      earned: userStats.totalDreams >= 25, 
      icon: Moon 
    },
  ];


  const showUpgradeDialog = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock unlimited dreams, AI counselor, and exclusive features!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => {} },
      ]
    );
  };

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
          <View style={styles.headerTop}>
            <View style={styles.headerSpacer} />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.avatar}
            >
              <User size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Crown size={12} color="#FBBF24" />
            </View>
          </View>
          
          <Text style={styles.userName}>{userStats.name}</Text>
          {isPremium && (
            <View style={styles.premiumBadgeRow}>
              <Crown size={14} color="#FBBF24" />
              <Text style={styles.premiumBadgeText}>Premium Member</Text>
            </View>
          )}
          <Text style={styles.userLevel}>{userStats.level}</Text>
          <Text style={styles.memberSince}>Member since {userStats.memberSince}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TrendingUp size={18} color="#10B981" />
              <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Award size={18} color="#EF4444" />
              <Text style={styles.statNumber}>{userStats.badges}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Premium Card */}
        {isPremium ? (
          <View style={styles.premiumCard}>
            <BlurView intensity={30} style={styles.premiumBlur}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                style={styles.premiumGradient}
              >
                <Crown size={24} color="#FBBF24" />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>You are Premium</Text>
                  <Text style={styles.premiumSubtitle}>Thanks for supporting Dreamlens</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        ) : (
          <TouchableOpacity style={styles.premiumCard} onPress={() => router.push('/paywall')}>
            <BlurView intensity={30} style={styles.premiumBlur}>
              <LinearGradient
                colors={['rgba(251, 191, 36, 0.2)', 'rgba(245, 101, 101, 0.2)']}
                style={styles.premiumGradient}
              >
                <Crown size={24} color="#FBBF24" />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumSubtitle}>Unlock unlimited features</Text>
                </View>
                <ChevronRight size={20} color="#FBBF24" />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        )}

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.earned ? '#A78BFA20' : '#6B728020' }
                ]}>
                  <achievement.icon 
                    size={16} 
                    color={achievement.earned ? '#A78BFA' : '#6B7280'} 
                  />
                </View>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>


        {/* Auth Actions */}
        {isGuestUser && (
          <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth-prompt')}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.authGradient}
            >
              <User size={20} color="#FFFFFF" />
              <Text style={styles.authText}>Create Account</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 20,
  },
  headerSpacer: {
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#0F0A2E',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  premiumBadgeText: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
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
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
  },
  premiumBlur: {
    padding: 1,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
  },
  premiumText: {
    flex: 1,
    marginLeft: 15,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: '#C7D2FE',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementLocked: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  achievementDescriptionLocked: {
    color: '#6B7280',
  },
  authButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  authGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  authText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});