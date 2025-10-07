import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { generateDreamVideo } from '../services/fal';
import { consumeVideoQuota, getVideoQuotaUsage, hasPremiumAccess } from '../services/videoQuota';
import { useRouter } from 'expo-router';

const MONTHLY_VIDEO_LIMIT = 4;
import { useAuth } from '../hooks/useAuth';
import { usePremium } from '../hooks/usePremium';
import { auth } from '../config/firebase';

interface DreamVideoGeneratorProps {
  dreamId: string;
  dreamTitle: string;
  dreamDescription: string;
  visualPrompt?: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

export function DreamVideoGenerator({
  dreamId,
  dreamTitle,
  dreamDescription,
  visualPrompt,
  onVideoGenerated,
}: DreamVideoGeneratorProps) {
  const { authState } = useAuth();
  const router = useRouter();
  // Get actual user from auth context
  const user = authState === 'authenticated' && auth.currentUser?.uid ? { uid: auth.currentUser.uid } : null;
  const { isPremium } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<{
    remainingVideos: number;
    usedVideos: number;
    isLimitReached: boolean;
  } | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Videos are generated on-demand and stored in FAL AI
  // No need to load existing videos from Firebase

  // Create video player instances
  const thumbnailPlayer = useVideoPlayer(generatedVideoUrl || '', (player) => {
    if (player) {
      player.loop = false;
      player.muted = true;
      player.playbackRate = 1.0;
    }
  });

  const modalPlayer = useVideoPlayer(generatedVideoUrl || '', (player) => {
    if (player) {
      player.loop = true;
      player.muted = true;
      player.playbackRate = 1.0;
    }
  });

  const loadQuotaInfo = React.useCallback(async () => {
    try {
      if (!user?.uid) return;
      
      const quota = await getVideoQuotaUsage(user.uid);
      setQuotaInfo({
        remainingVideos: quota.remainingVideos,
        usedVideos: quota.usedVideos,
        isLimitReached: quota.isLimitReached,
      });
    } catch (error: any) {
      console.error('Error loading quota info:', error);
      
      // If it's a permission error, set unlimited quota
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        setQuotaInfo({
          remainingVideos: MONTHLY_VIDEO_LIMIT,
          usedVideos: 0,
          isLimitReached: false,
        });
        return;
      }
      
      // Set default values on other errors
      setQuotaInfo({
        remainingVideos: MONTHLY_VIDEO_LIMIT,
        usedVideos: 0,
        isLimitReached: false,
      });
    }
  }, [user?.uid]);

  // Load quota info when component mounts and user/premium status changes
  React.useEffect(() => {
    if (user && isPremium) {
      loadQuotaInfo();
    }
  }, [user?.uid, isPremium, loadQuotaInfo]);

  // Update video players when video URL changes
  React.useEffect(() => {
    if (generatedVideoUrl) {
      // Use replaceAsync instead of replace to avoid UI freezes
      try {
        thumbnailPlayer.replaceAsync(generatedVideoUrl);
        modalPlayer.replaceAsync(generatedVideoUrl);
      } catch (error) {
        
      }
    }
  }, [generatedVideoUrl]);

  const handleGenerateVideo = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to log in to create videos.');
      return;
    }

    if (!isPremium) {
      // Navigate to video paywall instead of showing alert
      router.push({
        pathname: '/video-paywall',
        params: {
          dreamTitle: dreamTitle,
          dreamDescription: dreamDescription,
        },
      });
      return;
    }

    if (quotaInfo?.isLimitReached) {
      Alert.alert(
        'Quota Exceeded',
        `You have used ${quotaInfo.usedVideos}/4 video credits this month. Your credits will renew at the beginning of next month.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsGenerating(true);

      // Check premium access
      const hasAccess = await hasPremiumAccess(user.uid);
      if (!hasAccess) {
        router.push({
          pathname: '/video-paywall',
          params: {
            dreamTitle: dreamTitle,
            dreamDescription: dreamDescription,
          },
        });
        return;
      }

      // Consume quota (with fallback for permission errors)
      try {
        await consumeVideoQuota(user.uid);
      } catch (error: any) {
        // If quota consumption fails due to permissions, continue anyway
        if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
          
        } else {
          throw error; // Re-throw other errors
        }
      }

      // Generate video prompt
      const videoPrompt = visualPrompt || dreamDescription;
      
      // Generate video with LTX Video
      const result = await generateDreamVideo({
        prompt: `A dream video: ${videoPrompt}. Surreal, ethereal, mystical atmosphere with soft lighting, pastel colors, dreamy fog, floating elements, otherworldly beauty, fantasy art style, cinematic composition, magical realism.`,
        duration: 4, // 4 seconds for good balance
        aspectRatio: '9:16', // Vertical format for mobile
        resolution: '720p', // High quality
        frameRate: 30, // Smooth 30 FPS
        expandPrompt: false, // Don't expand prompt to keep original meaning
        enableSafetyChecker: true, // Enable safety checker
      });

      // Video URL is stored in FAL AI, no need to save to Firebase
      setGeneratedVideoUrl(result.videoUrl);
      onVideoGenerated?.(result.videoUrl);

      // Refresh quota info
      await loadQuotaInfo();

      // Auto-play the video after generation (optional)
      setTimeout(async () => {
        try {
          if (thumbnailPlayer && typeof thumbnailPlayer.play === 'function') {
            await thumbnailPlayer.play();
          }
        } catch (error) {
          
        }
      }, 1500);

      // Video created successfully - no alert needed

    } catch (error: any) {
      console.error('Video generation error:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred while creating the video.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <View style={styles.container}>
      {!isPremium && (
        <View style={styles.premiumContainer}>
          <Ionicons name="videocam" size={24} color="#8B5CF6" />
          <Text style={styles.premiumText}>Video creation is only available for premium members</Text>
          <TouchableOpacity 
            style={styles.premiumButton}
            onPress={() => {
              router.push({
                pathname: '/video-paywall',
                params: {
                  dreamTitle: dreamTitle,
                  dreamDescription: dreamDescription,
                },
              });
            }}
          >
            <Text style={styles.premiumButtonText}>Go Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPremium && (
        <>
          <View style={styles.header}>
            <Ionicons name="videocam" size={20} color="#8B5CF6" />
            <Text style={styles.title}>Dream Video</Text>
            {quotaInfo && (
              <Text style={styles.quotaText}>
                {quotaInfo.remainingVideos}/4 credits remaining
              </Text>
            )}
          </View>

          {generatedVideoUrl ? (
            <View style={styles.videoContainer}>
              <VideoView
                player={thumbnailPlayer}
                style={styles.video}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => setShowVideoModal(true)}
              >
                <Ionicons name="play-circle" size={40} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.generateButton,
                (quotaInfo?.isLimitReached || isGenerating) && styles.disabledButton,
              ]}
              onPress={handleGenerateVideo}
              disabled={quotaInfo?.isLimitReached || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.generateButtonText}>
                    {quotaInfo?.isLimitReached ? 'Quota Exceeded' : 'Create Video'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVideoModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            {generatedVideoUrl && (
              <VideoView
                player={modalPlayer}
                style={styles.fullscreenVideo}
                allowsFullscreen={true}
                allowsPictureInPicture={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove background and padding since it's now inside DreamDetailScreen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  quotaText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  premiumContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  premiumText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  premiumButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#4B5563',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
});
