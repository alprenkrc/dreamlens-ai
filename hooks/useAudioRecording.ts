import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, AudioQuality, IOSOutputFormat } from 'expo-audio';
import { transcribeAudioWithWhisper } from '../services/fal';

interface UseAudioRecordingOptions {
  onTranscriptionComplete?: (text: string) => void;
  onTranscriptionError?: (error: string) => void;
  language?: string;
}

interface UseAudioRecordingReturn {
  // State
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  recordedAudioUri: string | null;
  showRecordingActions: boolean;
  transcribedText: string;
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribeRecording: () => Promise<void>;
  discardRecording: () => void;
  clearTranscribedText: () => void;
  
  // Utils
  formatTime: (seconds: number) => string;
  getRecordingColor: () => string;
}

export function useAudioRecording(options: UseAudioRecordingOptions = {}): UseAudioRecordingReturn {
  const {
    onTranscriptionComplete,
    onTranscriptionError,
    language = 'tr'
  } = options;

  // State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [showRecordingActions, setShowRecordingActions] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Use expo-audio recorder hook with WAV format for better compatibility
  const recorder = useAudioRecorder({
    extension: '.wav',
    sampleRate: 44100,
    numberOfChannels: 1, // Mono for speech
    bitRate: 128000,
    android: {
      extension: '.wav',
      outputFormat: 'default',
      audioEncoder: 'default',
    },
    ios: {
      extension: '.wav',
      outputFormat: IOSOutputFormat.LINEARPCM,
      audioQuality: AudioQuality.HIGH,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/wav',
      bitsPerSecond: 128000,
    },
  });
  const recorderState = useAudioRecorderState(recorder, 100);

  // Derived state from recorder
  const isRecording = recorderState.isRecording;
  
  // Refs for timer
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request permissions
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // Clear previous state
      setRecordedAudioUri(null);
      setShowRecordingActions(false);
      setTranscribedText('');
      setRecordingDuration(0);

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (!isRecording) {
        return;
      }

      // Stop recording
      await recorder.stop();
      
      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Get the recording URI
      const uri = recorder.uri;
      
      if (!uri) {
        console.warn('No recording URI found!');
        throw new Error('Recording failed - no URI returned');
      }
      
      setRecordedAudioUri(uri);
      setShowRecordingActions(true);

    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  };

  const transcribeRecording = async () => {
    if (!recordedAudioUri) {
      throw new Error('No recording available to transcribe');
    }

    try {
      setIsTranscribing(true);
      
      const result = await transcribeAudioWithWhisper({
        audioUri: recordedAudioUri,
        language: language,
        task: 'transcribe',
        chunk_level: 'none', // Better quality for dream transcription
        version: '3',
        batch_size: 64,
      });

      setTranscribedText(result.text);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result.text);
      }

    } catch (error: any) {
      console.error('Transcription failed:', error);
      const errorMessage = error.message || 'Transcription failed';
      
      if (onTranscriptionError) {
        onTranscriptionError(errorMessage);
      }
      
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  const discardRecording = () => {
    setRecordedAudioUri(null);
    setShowRecordingActions(false);
    setTranscribedText('');
    setRecordingDuration(0);
    
    // Clear timer if still running
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const clearTranscribedText = () => {
    setTranscribedText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingColor = () => {
    if (recordingDuration < 60) return '#10B981'; // Green - Good
    if (recordingDuration < 120) return '#F59E0B'; // Orange - Warning
    return '#EF4444'; // Red - Too long
  };

  return {
    // State
    isRecording,
    isTranscribing,
    recordingDuration,
    recordedAudioUri,
    showRecordingActions,
    transcribedText,
    
    // Actions
    startRecording,
    stopRecording,
    transcribeRecording,
    discardRecording,
    clearTranscribedText,
    
    // Utils
    formatTime,
    getRecordingColor,
  };
}
