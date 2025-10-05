import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mic, MicOff, Type, Sparkles, Send, Moon } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import { generateDreamImage, analyzeDreamWithLLM } from '@/services/fal';
import { addDream } from '@/services/dreams';
import { auth } from '@/config/firebase';
import { signInAnonymously } from 'firebase/auth';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { router } from 'expo-router';

export default function RecordScreen() {
  const [recordingMethod, setRecordingMethod] = useState<'voice' | 'text'>('voice');
  const [dreamText, setDreamText] = useState('');
  const [vividnessRating, setVividnessRating] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const pulseScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(0.3);

  // Use audio recording hook
  const {
    isRecording,
    isTranscribing,
    recordingDuration,
    recordedAudioUri,
    showRecordingActions,
    transcribedText,
    startRecording,
    stopRecording,
    transcribeRecording,
    discardRecording,
    clearTranscribedText,
    formatTime,
    getRecordingColor,
  } = useAudioRecording({
    onTranscriptionComplete: (text) => {
      setDreamText(text);
      setRecordingMethod('text');
    },
    onTranscriptionError: (error) => {
      console.error('Transcription error:', error);
    },
    language: 'tr',
  });

  const toggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
      pulseScale.value = withRepeat(withSpring(1.2, { duration: 1000 }), -1, true);
      recordingOpacity.value = withTiming(1, { duration: 300 });
    } else {
      await stopRecording();
      pulseScale.value = withSpring(1);
      recordingOpacity.value = withTiming(0.3, { duration: 300 });
    }
  };

  const recordButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const recordingIndicatorStyle = useAnimatedStyle(() => ({
    opacity: recordingOpacity.value,
  }));

  // Check if submit button should be disabled
  const getSubmitButtonDisabled = () => {
    if (isGenerating) return true;
    
    if (recordingMethod === 'text') {
      return dreamText.trim().length < 3;
    } else {
      // Voice method - need either transcribed text, recorded audio, or manual text input
      return !transcribedText && !recordedAudioUri && dreamText.trim().length < 3;
    }
  };


  const submitDream = async () => {
    // Validate input based on recording method
    if (recordingMethod === 'text') {
      if (dreamText.trim().length < 3) {
        Alert.alert('Dream Too Short', 'Please describe your dream (at least 3 characters).');
        return;
      }
    } else {
      // Voice method - check if we have transcribed text or recorded audio
      if (!transcribedText && !recordedAudioUri && dreamText.trim().length < 3) {
        Alert.alert('No Dream Content', 'Please record your dream or switch to text mode to type it.');
        return;
      }
    }

    try {
      setIsGenerating(true);
      
      // Ensure user is authenticated (anonymous if needed)
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      // Use transcribed text if available, otherwise use manual text input
      const finalDreamText = transcribedText || dreamText;
      
      // Step 1: Analyze dream with LLM
      const analysis = await analyzeDreamWithLLM({
        dreamDescription: finalDreamText,
        model: 'google/gemini-2.5-flash', // Fast and free model
        temperature: 0.7,
      });

      // Step 2: Generate dream image based on improved description or original
      const imagePrompt = analysis.improvedDescription || finalDreamText;
      const result = await generateDreamImage({
        prompt: `Dream visualization: ${imagePrompt}. Surreal, cinematic, high-detail visual with mystical lighting, ethereal color palette, dreamlike atmosphere, fantasy art style.`,
        aspectRatio: '1:1', // Square image for dream cards
        guidance: 8, // Higher guidance for better prompt adherence
        negativePrompt: 'ugly, blurry, low quality, distorted, text, watermark',
      });

      // Step 3: Save dream with analysis
      const dreamId = await addDream(auth.currentUser?.uid ?? null, {
        title: analysis.title,
        description: analysis.improvedDescription || finalDreamText,
        imageUrl: result.imageUrl,
        vividness: vividnessRating,
        symbols: analysis.symbols,
        emotions: analysis.emotions,
        fortune: analysis.fortune,
      });

      // Navigate directly to Dream Detail screen
      router.replace({ pathname: '/dream-detail', params: { dreamId } });
    } catch (error: any) {
      Alert.alert('Generation Failed', error?.message ?? 'Unknown error');
    } finally {
      setIsGenerating(false);
      setDreamText('');
      clearTranscribedText();
      setVividnessRating(5);
    }
  };

  return (
    <LinearGradient
      colors={['#1E1B4B', '#3730A3', '#6366F1']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Moon size={32} color="#A78BFA" />
          <Text style={styles.title}>Record Your Dream</Text>
          <Text style={styles.subtitle}>Capture the mystical journey of your subconscious</Text>
        </View>

        {/* Method Selection */}
        <View style={styles.methodContainer}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              recordingMethod === 'voice' && styles.methodButtonActive
            ]}
            onPress={() => {
              setRecordingMethod('voice');
              clearTranscribedText();
            }}
          >
            <Mic size={20} color={recordingMethod === 'voice' ? '#6366F1' : '#9CA3AF'} />
            <Text style={[
              styles.methodText,
              recordingMethod === 'voice' && styles.methodTextActive
            ]}>Voice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.methodButton,
              recordingMethod === 'text' && styles.methodButtonActive
            ]}
            onPress={() => {
              setRecordingMethod('text');
              clearTranscribedText();
            }}
          >
            <Type size={20} color={recordingMethod === 'text' ? '#6366F1' : '#9CA3AF'} />
            <Text style={[
              styles.methodText,
              recordingMethod === 'text' && styles.methodTextActive
            ]}>Text</Text>
          </TouchableOpacity>
        </View>

        {/* Recording Interface */}
        {recordingMethod === 'voice' ? (
          <View style={styles.voiceContainer}>
            <Animated.View style={[styles.recordingIndicator, recordingIndicatorStyle]}>
              <BlurView intensity={40} style={styles.recordingBlur}>
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Tap to start recording'}
                </Text>
              </BlurView>
            </Animated.View>

            {/* Recording Timer and Progress */}
            {isRecording && (
              <View style={styles.timerContainer}>
                <View style={styles.timerHeader}>
                  <Text style={[styles.timerText, { color: getRecordingColor() }]}>
                    {formatTime(recordingDuration)}
                  </Text>
                  <Text style={styles.timerLimit}>
                    {recordingDuration < 60 ? '✓ Good length' : 
                     recordingDuration < 120 ? '⚠ Getting long' : 
                     '⚠ Too long - Stop soon!'}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${Math.min((recordingDuration / 120) * 100, 100)}%`,
                        backgroundColor: getRecordingColor()
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={toggleRecording}
              disabled={isTranscribing}
            >
              <Animated.View style={recordButtonStyle}>
                {isTranscribing ? (
                  <ActivityIndicator size={40} color="#FFFFFF" />
                ) : isRecording ? (
                  <MicOff size={40} color="#FFFFFF" />
                ) : (
                  <Mic size={40} color="#FFFFFF" />
                )}
              </Animated.View>
            </TouchableOpacity>
            
            <Text style={styles.recordHint}>
              {isRecording ? 'Speak clearly about your dream' : 
               isTranscribing ? 'Processing your audio...' : 
               showRecordingActions ? 'Choose an action below' :
               'Hold and describe your dream in detail'}
            </Text>

            {/* Recording Actions */}
            {showRecordingActions && !isTranscribing && (
              <View style={styles.recordingActionsContainer}>
                <BlurView intensity={20} style={styles.actionsBlur}>
                  <Text style={styles.actionsTitle}>Recording Complete!</Text>
                  <Text style={styles.actionsSubtitle}>
                    Duration: {formatTime(recordingDuration)}
                  </Text>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.transcribeButton]}
                      onPress={transcribeRecording}
                    >
                      <Sparkles size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Transcribe</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.discardButton]}
                      onPress={discardRecording}
                    >
                      <MicOff size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Discard</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            )}

            {/* Display transcribed text */}
            {transcribedText && (
              <View style={styles.transcribedContainer}>
                <BlurView intensity={20} style={styles.transcribedBlur}>
                  <Text style={styles.transcribedTitle}>Transcribed Text:</Text>
                  <Text style={styles.transcribedText}>{transcribedText}</Text>
                  <TouchableOpacity
                    style={styles.useTranscribedButton}
                    onPress={() => setDreamText(transcribedText)}
                  >
                    <Text style={styles.useTranscribedText}>Use This Text</Text>
                  </TouchableOpacity>
                </BlurView>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.textContainer}>
            <BlurView intensity={20} style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe your dream in vivid detail..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={8}
                value={dreamText}
                onChangeText={setDreamText}
                textAlignVertical="top"
              />
            </BlurView>
          </View>
        )}

        {/* Vividness Rating */}
        <VividnessRating value={vividnessRating} onChange={setVividnessRating} />

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, getSubmitButtonDisabled() && styles.submitButtonDisabled]}
          onPress={submitDream}
          disabled={getSubmitButtonDisabled()}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.submitGradient}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={styles.submitText}>Analyze Dream</Text>
                <Send size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

interface VividnessRatingProps {
  value: number;
  onChange: (next: number) => void;
}

function getVividnessLabel(value: number) {
  if (value <= 3) return 'Vague';
  if (value <= 7) return 'Moderate';
  return 'Crystal Clear';
}

function getVividnessColor(value: number) {
  if (value <= 3) return '#9CA3AF';
  if (value <= 7) return '#A78BFA';
  return '#8B5CF6';
}

function VividnessRating({ value, onChange }: VividnessRatingProps) {
  return (
    <View style={styles.vividnessContainer}>
      <Text style={styles.vividnessTitle}>Dream Vividness</Text>
      <Text style={styles.vividnessSubtitle}>How clear and vivid was your dream?</Text>

      <View style={styles.ratingContainer}>
        {[...Array(10)].map((_, index) => {
          const isActive = index < value;
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Set vividness to ${index + 1}`}
              style={[styles.ratingButton, isActive && styles.ratingButtonActive]}
              onPress={() => onChange(index + 1)}
            >
              <Text style={[styles.ratingText, isActive && styles.ratingTextActive]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.ratingLabels}>
        <Text style={styles.ratingLabel}>Vague</Text>
        <Text style={[styles.ratingLabel, { color: getVividnessColor(value) }]}>
          {getVividnessLabel(value)}
        </Text>
        <Text style={styles.ratingLabel}>Crystal Clear</Text>
      </View>
    </View>
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
  methodContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  methodText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  methodTextActive: {
    color: '#6366F1',
  },
  voiceContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  recordingIndicator: {
    width: 200,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recordingBlur: {
    padding: 15,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginBottom: 20,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordHint: {
    fontSize: 14,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  transcribedContainer: {
    marginTop: 20,
    width: '100%',
  },
  transcribedBlur: {
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  transcribedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  transcribedText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 15,
  },
  useTranscribedButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  useTranscribedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textInputContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  textInput: {
    padding: 20,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 150,
  },
  vividnessContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  vividnessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  vividnessSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#A78BFA',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  ratingTextActive: {
    color: '#FFFFFF',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  submitButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  bottomPadding: {
    height: 30,
  },
  timerContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerLimit: {
    fontSize: 12,
    color: '#C7D2FE',
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  recordingActionsContainer: {
    width: '100%',
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionsBlur: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  actionsSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  transcribeButton: {
    backgroundColor: '#10B981',
  },
  discardButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});