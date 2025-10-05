import { fal } from '@fal-ai/client';

export type FalGenerationParams = {
  prompt: string;
  aspectRatio?: string; // e.g., '1:1', '16:9', '9:16'
  numImages?: number;
  seed?: number;
  negativePrompt?: string;
  guidance?: number; // 1-20, controls prompt adherence
};

export type FalGenerationResult = {
  imageUrl: string;
};

const FAL_API_KEY = process.env.EXPO_PUBLIC_FAL_AI_API_KEY

// Configure FAL client
if (FAL_API_KEY) {
  fal.config({
    credentials: FAL_API_KEY,
  });
}

export async function generateDreamImage(params: FalGenerationParams): Promise<FalGenerationResult> {
  if (!FAL_API_KEY) {
    throw new Error('Missing FAL API key. Set EXPO_PUBLIC_FAL_AI_API_KEY in .env');
  }

  try {
    const result = await fal.subscribe('fal-ai/imagen4/preview/fast', {
      input: {
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio ?? '1:1',
        num_images: params.numImages ?? 1,
        seed: params.seed,
        negative_prompt: params.negativePrompt,
        guidance: params.guidance ?? 7,
      } as any,
      logs: false,
    });

    const data = result.data as any;
    const imageUrl = data?.images?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('Imagen 4 did not return an image URL');
    }

    return { imageUrl };
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
  }
}


export type DreamAnalysisParams = {
  dreamDescription: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
};

export type DreamAnalysisResult = {
  title: string;
  symbols: string[];
  emotions: string[];
  fortune: string;
  improvedDescription?: string;
  rawOutput: string;
};



/**
 * Analyzes dream description using LLM and extracts symbols, emotions, and fortune
 * @param params - Dream analysis parameters
 * @returns Structured dream analysis
 */
export async function analyzeDreamWithLLM(params: DreamAnalysisParams): Promise<DreamAnalysisResult> {
  if (!FAL_API_KEY) {
    throw new Error('Missing FAL API key. Set EXPO_PUBLIC_FAL_AI_API_KEY in .env');
  }

  const systemPrompt = params.systemPrompt || `Sen rüya analizi konusunda uzman bir psikologsun. Kullanıcının rüyasını analiz edip şu formatta yanıt vermelisin:

BAŞLIK: [Rüya için kısa ve çarpıcı bir başlık, maksimum 60 karakter]

SEMBOLLER: [Rüyadaki önemli sembolleri virgülle ayır, maksimum 5 sembol]

DUYGULAR: [Rüyadaki baskın duyguları virgülle ayır, maksimum 5 duygu]

FAL: [Rüyanın yorumu ve geleceğe dair mesaj, 2-3 cümle]

AÇIKLAMA: [Rüyanın daha detaylı ve anlaşılır hali, gerekirse eksik detayları tamamla]

Türkçe yanıt ver ve her bölümü net bir şekilde ayır.`;

  try {
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        prompt: `Rüya: ${params.dreamDescription}`,
        system_prompt: systemPrompt,
        model: params.model || 'google/gemini-2.5-flash',
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 1000,
        priority: 'latency',
      },
      logs: false,
    });

    const output = (result.data as any).output as string;
    
    if (!output) {
      throw new Error('LLM did not return any output');
    }

    // Parse the structured output
    const titleMatch = output.match(/BAŞLIK:?\s*(.+?)(?:\n|$)/i);
    const symbolsMatch = output.match(/SEMBOLLER:?\s*(.+?)(?:\n|$)/i);
    const emotionsMatch = output.match(/DUYGULAR:?\s*(.+?)(?:\n|$)/i);
    const fortuneMatch = output.match(/FAL:?\s*(.+?)(?:\n|$)/i);
    const descriptionMatch = output.match(/AÇIKLAMA:?\s*(.+?)(?:\n\n|$)/is);

    const title = titleMatch?.[1]?.trim() || params.dreamDescription.split(/[.!?\n]/)[0]?.slice(0, 60) || 'İsimsiz Rüya';
    const symbols = symbolsMatch?.[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const emotions = emotionsMatch?.[1]?.split(',').map(e => e.trim()).filter(Boolean) || [];
    const fortune = fortuneMatch?.[1]?.trim() || 'Rüyanız ilginç semboller içeriyor.';
    const improvedDescription = descriptionMatch?.[1]?.trim();

    return {
      title,
      symbols: symbols.slice(0, 5),
      emotions: emotions.slice(0, 5),
      fortune,
      improvedDescription,
      rawOutput: output,
    };
  } catch (error: any) {
    throw new Error(`Dream analysis failed: ${error.message || 'Unknown error'}`);
  }
}

export type WhisperTranscriptionParams = {
  audioUri: string;
  language?: string;
  task?: 'transcribe' | 'translate';
  chunk_level?: 'none' | 'segment' | 'word';
  version?: '3';
  batch_size?: number;
  diarize?: boolean;
  num_speakers?: number;
};

export type WhisperTranscriptionResult = {
  text: string;
  chunks?: Array<{
    text: string;
    start?: number;
    end?: number;
  }>;
  inferred_languages?: string[];
  diarization_segments?: Array<{
    speaker: string;
    start?: number;
    end?: number;
  }>;
};

/**
 * Transcribes audio using FAL AI Whisper
 * @param params - Whisper transcription parameters
 * @returns Transcribed text and segments
 */
export async function transcribeAudioWithWhisper(params: WhisperTranscriptionParams): Promise<WhisperTranscriptionResult> {
  if (!FAL_API_KEY) {
    throw new Error('Missing FAL API key. Set EXPO_PUBLIC_FAL_AI_API_KEY in .env');
  }

  try {
    console.log('Starting transcription for URI:', params.audioUri);
    
    // Convert local file URI to blob for FAL upload
    const response = await fetch(params.audioUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Audio blob size:', blob.size, 'bytes, type:', blob.type);
    
    if (blob.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    // Determine correct file extension
    const fileExtension = params.audioUri.split('.').pop()?.toLowerCase() || 'm4a';
    console.log('File extension:', fileExtension);
    
    // Create a File object with correct name and type
    const fileName = `recording.${fileExtension}`;
    let mimeType = blob.type;
    
    // Fix MIME type if needed
    if (fileExtension === 'wav') {
      mimeType = 'audio/wav';
    } else if (fileExtension === 'm4a') {
      mimeType = 'audio/mp4';
    } else if (fileExtension === 'mp3') {
      mimeType = 'audio/mpeg';
    } else if (fileExtension === 'ogg') {
      mimeType = 'audio/ogg';
    } else if (fileExtension === 'aac') {
      mimeType = 'audio/aac';
    }
    
    const audioFile = new File([blob], fileName, { type: mimeType });
    console.log('Created file:', fileName, 'with type:', mimeType);
    
    // Upload file to FAL storage
    console.log('Uploading file to FAL storage...');
    const uploadedUrl = await fal.storage.upload(audioFile);
    console.log('File uploaded to FAL storage:', uploadedUrl);
    
    console.log('Sending to FAL AI Whisper...');
    const result = await fal.subscribe('fal-ai/whisper', {
      input: {
        audio_url: uploadedUrl,
        task: params.task || 'transcribe',
        language: params.language || 'tr',
        chunk_level: params.chunk_level || 'segment',
        version: '3',
        batch_size: 64,
      },
      logs: true,
    });

    const data = result.data as any;
    console.log('FAL AI Whisper response:', data);
    
    if (!data?.text) {
      console.error('No text in response:', data);
      throw new Error('Whisper did not return transcribed text');
    }

    console.log('Transcription successful:', data.text);
    return {
      text: data.text.trim(),
      chunks: data.chunks || [],
      inferred_languages: data.inferred_languages || [],
      diarization_segments: data.diarization_segments || [],
    };
  } catch (error: any) {
    console.error('Transcription error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error body:', error.body);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    if (error.name === 'ValidationError') {
      throw new Error(`FAL API Validation Error: ${error.message || 'Invalid input parameters'}`);
    } else if (error.message?.includes('fetch')) {
      throw new Error(`File access error: ${error.message}`);
    } else if (error.message?.includes('base64')) {
      throw new Error(`Audio conversion error: ${error.message}`);
    } else if (error.message?.includes('Whisper')) {
      throw new Error(`Whisper API error: ${error.message}`);
    } else {
      throw new Error(`Audio transcription failed: ${error.message || 'Unknown error'}`);
    }
  }
}
