import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Calendar as CalendarIcon,
  TrendingUp,
  Moon
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { listDreams } from '@/services/dreams';
import { auth } from '@/config/firebase';
import { Dream } from '@/types/dream';

const { width } = Dimensions.get('window');

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  hasDream: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export default function DreamJournalScreen() {
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    loadDreams();
  }, []);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, dreams]);

  const loadDreams = async () => {
    try {
      const uid = auth.currentUser?.uid ?? null;
      const dreamList = await listDreams(uid);
      setDreams(dreamList);
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Check if there's a dream on this date
      const hasDream = dreams.some(dream => {
        const dreamDate = new Date(dream.date);
        return dreamDate.toDateString() === date.toDateString();
      });

      days.push({
        day: date.getDate(),
        isCurrentMonth,
        hasDream,
        isToday,
        isSelected,
      });
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectDate = (dayIndex: number) => {
    const day = calendarDays[dayIndex];
    if (!day.isCurrentMonth) return;

    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day);
    setSelectedDate(newSelectedDate);
  };

  const getMonthStats = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthDreams = dreams.filter(dream => {
      const dreamDate = new Date(dream.date);
      return dreamDate.getMonth() === currentMonth && dreamDate.getFullYear() === currentYear;
    });

    const lucidDreams = monthDreams.filter(dream => 
      dream.symbols?.includes('lucid') || dream.description?.toLowerCase().includes('lucid')
    ).length;

    return {
      totalDreams: monthDreams.length,
      lucidDreams,
    };
  };

  const getSelectedDateDream = () => {
    return dreams.find(dream => {
      const dreamDate = new Date(dream.date);
      return dreamDate.toDateString() === selectedDate.toDateString();
    });
  };

  const stats = getMonthStats();
  const selectedDream = getSelectedDateDream();

  return (
    <LinearGradient
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dream Journal</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <BlurView intensity={20} style={styles.calendarBlur}>
              {/* Month Navigation */}
              <View style={styles.monthHeader}>
                <TouchableOpacity 
                  style={styles.monthNavButton}
                  onPress={() => navigateMonth('prev')}
                >
                  <ChevronLeft size={20} color="#A78BFA" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity 
                  style={styles.monthNavButton}
                  onPress={() => navigateMonth('next')}
                >
                  <ChevronRight size={20} color="#A78BFA" />
                </TouchableOpacity>
              </View>

              {/* Day Names */}
              <View style={styles.dayNamesRow}>
                {dayNames.map((day, index) => (
                  <Text key={index} style={styles.dayName}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayInactive,
                      day.isToday && styles.calendarDayToday,
                      day.isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => selectDate(index)}
                    disabled={!day.isCurrentMonth}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextInactive,
                      day.isToday && styles.calendarDayTextToday,
                      day.isSelected && styles.calendarDayTextSelected,
                    ]}>
                      {day.day}
                    </Text>
                    {day.hasDream && (
                      <View style={[
                        styles.dreamIndicator,
                        day.isSelected && styles.dreamIndicatorSelected
                      ]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </View>

          {/* Month Statistics */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>
              {monthNames[currentDate.getMonth()]} Summary
            </Text>
            <BlurView intensity={20} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View>
                    <Text style={styles.statLabel}>Dreams Recorded</Text>
                    <Text style={styles.statValue}>{stats.totalDreams}</Text>
                  </View>
                  <BookOpen size={24} color="#A78BFA" />
                </View>
              </View>
            </BlurView>
          </View>

          {/* Selected Date Dream Entry */}
          {selectedDream ? (
            <View style={styles.dreamEntryContainer}>
              <Text style={styles.sectionTitle}>
                Dream Entry: {selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <BlurView intensity={20} style={styles.dreamEntryCard}>
                <View style={styles.dreamEntryContent}>
                  <Text style={styles.dreamTitle}>{selectedDream.title}</Text>
                  <Text style={styles.dreamDescription} numberOfLines={3}>
                    {selectedDream.description}
                  </Text>
                  <TouchableOpacity 
                    style={styles.readMoreButton}
                    onPress={() => router.push({
                      pathname: '/dream-detail',
                      params: { dreamId: selectedDream.id }
                    })}
                  >
                    <Text style={styles.readMoreText}>Read more</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          ) : (
            <View style={styles.noDreamContainer}>
              <Text style={styles.sectionTitle}>
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <BlurView intensity={20} style={styles.noDreamCard}>
                <View style={styles.noDreamContent}>
                  <CalendarIcon size={32} color="#6B7280" />
                  <Text style={styles.noDreamText}>No dream recorded for this date</Text>
                  <TouchableOpacity 
                    style={styles.addDreamButton}
                    onPress={() => router.push('/record')}
                  >
                    <Text style={styles.addDreamText}>Record a Dream</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  calendarBlur: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#1919e6',
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarDayTextInactive: {
    color: '#6B7280',
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dreamIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A78BFA',
  },
  dreamIndicatorSelected: {
    backgroundColor: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statCard: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statContent: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dreamEntryContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  dreamEntryCard: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dreamEntryContent: {
    padding: 20,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  dreamDescription: {
    fontSize: 14,
    color: '#C7D2FE',
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  noDreamContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  noDreamCard: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  noDreamContent: {
    padding: 30,
    alignItems: 'center',
  },
  noDreamText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  addDreamButton: {
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addDreamText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  bottomPadding: {
    height: 30,
  },
});
