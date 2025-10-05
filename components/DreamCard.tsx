import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Eye, Share2 } from 'lucide-react-native';

interface DreamCardProps {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  vividness: number;
  isLiked: boolean;
  views: number;
  onPress?: () => void;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function DreamCard({
  id,
  title,
  date,
  imageUrl,
  vividness,
  isLiked,
  views,
  onPress,
  onLike,
  onShare,
}: DreamCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.vividnessBadge}>
              <Text style={styles.vividnessText}>{vividness}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onLike?.(id)}
              >
                <Heart
                  size={16}
                  color={isLiked ? '#EF4444' : '#FFFFFF'}
                  fill={isLiked ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onShare?.(id)}
              >
                <Share2 size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.date}>
              {new Date(date).toLocaleDateString()}
            </Text>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Eye size={12} color="#9CA3AF" />
                <Text style={styles.statText}>{views}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vividnessBadge: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vividnessText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statText: {
    fontSize: 10,
    color: '#C7D2FE',
    marginLeft: 4,
  },
});