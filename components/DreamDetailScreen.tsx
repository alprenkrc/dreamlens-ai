import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit, Trash2, Home, BookOpen, BarChart3, User, X } from 'lucide-react-native';
import { Dream } from '@/types/dream';
import { DreamVideoGenerator } from './DreamVideoGenerator';

const { width } = Dimensions.get('window');

interface DreamDetailScreenProps {
  dream: Dream;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (screen: string) => void;
  isFirstDreamForGuest?: boolean;
  onContinue?: () => void;
}

export default function DreamDetailScreen({
  dream,
  onBack,
  onEdit,
  onDelete,
  onNavigate,
  isFirstDreamForGuest = false,
  onContinue,
}: DreamDetailScreenProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentDream, setCurrentDream] = useState(dream);

  // Update currentDream when dream prop changes
  React.useEffect(() => {
    setCurrentDream(dream);
  }, [dream]);

  const handleVideoGenerated = (videoUrl: string) => {
    setCurrentDream(prev => ({
      ...prev,
      videoUrl: videoUrl
    }));
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dreamDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Check if it's today
      if (dreamDate.getTime() === today.getTime()) {
        return `Today, ${date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })}`;
      }
      
      // Check if it's yesterday
      if (dreamDate.getTime() === yesterday.getTime()) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })}`;
      }
      
      // For other dates, show full date
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onDelete
        },
      ]
    );
  };

  const renderNavItem = (icon: React.ReactNode, label: string, isActive: boolean, onPress: () => void) => (
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#221E10', '#221E10']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dream Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Dream Info */}
            <View style={styles.section}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Title</Text>
                <Text style={styles.infoValue}>{currentDream.title}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(currentDream.date)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Dream Description</Text>
                <Text style={styles.description}>{currentDream.description}</Text>
              </View>
              
              {/* Original Dream Text */}
              {currentDream.originalDreamText && currentDream.originalDreamText !== currentDream.description && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Original Dream Text</Text>
                  <Text style={styles.originalText}>{currentDream.originalDreamText}</Text>
                </View>
              )}
            </View>

            {/* AI Visuals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Visuals</Text>
              <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => setImageModalVisible(true)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: currentDream.imageUrl }} 
                  style={styles.dreamImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Dream Video Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dream Video</Text>
              <View style={styles.noVideoSection}>
                <Text style={styles.noVideoText}>
                  Convert your dream into a magical video
                </Text>
                <DreamVideoGenerator
                  dreamId={currentDream.id}
                  dreamTitle={currentDream.title}
                  dreamDescription={currentDream.description}
                  onVideoGenerated={handleVideoGenerated}
                />
              </View>
            </View>

            {/* AI Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <View style={styles.analysisContainer}>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Symbols:</Text>
                  <Text style={styles.analysisValue}>{currentDream.symbols.join(', ')}</Text>
                </View>
                
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Emotions:</Text>
                  <Text style={styles.analysisValue}>{currentDream.emotions.join(', ')}</Text>
                </View>
                
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Fortune:</Text>
                  <Text style={styles.analysisValue}>{currentDream.fortune}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {isFirstDreamForGuest ? (
              <View style={styles.guestActionContainer}>
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={onContinue}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue Your Journey</Text>
                </TouchableOpacity>
                <Text style={styles.guestHint}>
                  Create an account to save your dreams and unlock more features
                </Text>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={onEdit}
                  activeOpacity={0.8}
                >
                  <Edit size={20} color="#f2b90d" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            {renderNavItem(
              <Home size={24} color="rgba(255, 255, 255, 0.6)" />,
              'Home',
              false,
              () => onNavigate('home')
            )}
            {renderNavItem(
              <BookOpen size={24} color="#f2b90d" />,
              'Journal',
              true,
              () => onNavigate('journal')
            )}
            {renderNavItem(
              <BarChart3 size={24} color="rgba(255, 255, 255, 0.6)" />,
              'Analysis',
              false,
              () => onNavigate('analysis')
            )}
            {renderNavItem(
              <User size={24} color="rgba(255, 255, 255, 0.6)" />,
              'Profile',
              false,
              () => onNavigate('profile')
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" barStyle="light-content" />
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <X size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Image 
            source={{ uri: currentDream.imageUrl }} 
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#221E10',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  originalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dreamImage: {
    width: '100%',
    height: '100%',
  },
  analysisContainer: {
    backgroundColor: 'rgba(242, 185, 13, 0.2)',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 80,
  },
  analysisValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(242, 185, 13, 0.2)',
  },
  editButtonText: {
    color: '#f2b90d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#221E10',
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 185, 13, 0.3)',
    paddingBottom: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  navLabelActive: {
    color: '#f2b90d',
    fontWeight: 'bold',
  },
  guestActionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guestHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImage: {
    width: width * 0.95,
    height: width * 0.95,
    maxHeight: '80%',
  },
  videoSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginTop: 8,
  },
  videoInfo: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  noVideoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  noVideoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
});
