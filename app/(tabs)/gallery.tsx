import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Eye, Heart, Share2, Download, Sparkles, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const imageWidth = (width - 60) / 2;

import { listDreams, migratePlaceholderDreams } from '@/services/dreams';
import { auth } from '@/config/firebase';
import { Dream } from '@/types/dream';

export default function GalleryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dreamImages, setDreamImages] = useState<Dream[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const uid = auth.currentUser?.uid ?? null;
      
      // Migrate placeholder dreams if user is authenticated (run in background)
      if (uid) {
        migratePlaceholderDreams(uid).catch(error => {
          console.warn('Migration failed, but continuing with app:', error);
        });
      }
      
      const items = await listDreams(uid);
      setDreamImages(items);
      
      // Debug filtered images
      const filtered = selectedFilter === 'all' 
        ? items 
        : items.filter(dream => 
            dream.symbols?.some(symbol => symbol.toLowerCase() === selectedFilter) || 
            dream.emotions?.some(emotion => emotion.toLowerCase() === selectedFilter)
          );
    } catch (error) {
      console.error('Gallery: Error loading dreams:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Generate dynamic filters based on dream categories
  const generateFilters = () => {
    const categoryCount: { [key: string]: number } = {};
    
    // Predefined popular categories with better labels
    const categoryLabels: { [key: string]: string } = {
      'flying': '✈️ Flying',
      'water': '🌊 Water',
      'animals': '🐾 Animals',
      'falling': '⬇️ Falling',
      'chase': '🏃 Chase',
      'death': '💀 Death',
      'love': '❤️ Love',
      'fear': '😨 Fear',
      'joy': '😊 Joy',
      'anxiety': '😰 Anxiety',
      'peace': '☮️ Peace',
      'anger': '😡 Anger',
      'lucid': '🌟 Lucid',
      'nightmare': '👻 Nightmare',
      'family': '👨‍👩‍👧‍👦 Family',
      'work': '💼 Work',
      'school': '🎓 School',
      'house': '🏠 House',
      'car': '🚗 Car',
      'fire': '🔥 Fire'
    };
    
    dreamImages.forEach(dream => {
      // Count symbols
      dream.symbols?.forEach(symbol => {
        const normalizedSymbol = symbol.toLowerCase();
        categoryCount[normalizedSymbol] = (categoryCount[normalizedSymbol] || 0) + 1;
      });
      
      // Count emotions
      dream.emotions?.forEach(emotion => {
        const normalizedEmotion = emotion.toLowerCase();
        categoryCount[normalizedEmotion] = (categoryCount[normalizedEmotion] || 0) + 1;
      });
    });

    const dynamicFilters = Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a) // Sort by count descending
      .slice(0, 8) // Limit to top 8 categories
      .map(([category, count]) => ({
        id: category,
        label: categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1),
        count
      }));

    return [
      { id: 'all', label: 'All Dreams', count: dreamImages.length },
      ...dynamicFilters
    ];
  };

  const filters = generateFilters();

  // Filter dreams based on selected category
  const filteredImages = selectedFilter === 'all' 
    ? dreamImages 
    : dreamImages.filter(dream => 
        dream.symbols?.some(symbol => symbol.toLowerCase() === selectedFilter) || 
        dream.emotions?.some(emotion => emotion.toLowerCase() === selectedFilter)
      );

  const openDreamDetail = (dream: Dream) => {
    router.push({
      pathname: '/dream-detail',
      params: { dreamId: dream.id }
    });
  };

  const toggleLike = (imageId: string) => {
    // In real app, update the like status
  };

  return (
    <LinearGradient
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Sparkles size={32} color="#A78BFA" />
            <TouchableOpacity 
              style={styles.journalButton}
              onPress={() => router.push('/dream-journal')}
            >
              <Calendar size={24} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Dream Gallery</Text>
          <Text style={styles.subtitle}>Your AI-Generated Dream Visualizations</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === filter.id && styles.filterCountActive
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === filter.id && styles.filterCountTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dream Images Grid */}
        <View style={styles.gridContainer}>
          {filteredImages.map((dream, index) => (
            <TouchableOpacity
              key={dream.id}
              style={[
                styles.imageContainer,
                { marginRight: index % 2 === 0 ? 15 : 0 }
              ]}
              onPress={() => openDreamDetail(dream)}
            >
              <Image
                source={{ uri: dream.imageUrl }}
                style={styles.dreamImage}
              />
              
              {/* Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
              >
                <View style={styles.imageInfo}>
                  <Text style={styles.dreamTitle} numberOfLines={1}>
                    {dream.title}
                  </Text>
                  <Text style={styles.dreamDate}>
                    {new Date(dream.date).toLocaleDateString()}
                  </Text>
                </View>
              </LinearGradient>

              {/* Actions placeholder */}

              {/* Vividness Badge */}
              <View style={styles.vividnessBadge}>
                <Text style={styles.vividnessText}>{dream.vividness}</Text>
              </View>

              {/* Stats */}
              <View style={styles.imageStats}>
                <View style={styles.statItem}>
                  <Eye size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>{dream.views}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate New Dreams CTA */}
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => router.push('/(tabs)/record')}
          activeOpacity={0.8}
        >
          <BlurView intensity={40} style={styles.generateBlur}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.3)']}
              style={styles.generateGradient}
            >
              <Sparkles size={24} color="#A78BFA" />
              <Text style={styles.generateText}>Generate New Dream Visual</Text>
              <Text style={styles.generateSubtext}>Record your latest dream to create new AI art</Text>
            </LinearGradient>
          </BlurView>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  journalButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
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
  filtersContainer: {
    marginBottom: 25,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C7D2FE',
    marginRight: 8,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: '#A78BFA',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C7D2FE',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  imageContainer: {
    width: imageWidth,
    height: imageWidth * 1.3,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  dreamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  imageInfo: {
    marginBottom: 5,
  },
  dreamTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dreamDate: {
    fontSize: 12,
    color: '#C7D2FE',
  },
  imageActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vividnessBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  vividnessText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageStats: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statText: {
    fontSize: 10,
    color: '#C7D2FE',
    marginLeft: 4,
  },
  generateButton: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  generateBlur: {
    padding: 1,
  },
  generateGradient: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 19,
  },
  generateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  generateSubtext: {
    fontSize: 14,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});