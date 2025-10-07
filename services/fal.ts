import { fal } from '@fal-ai/client';

export type FalGenerationParams = {
  prompt: string;
  imageSize?: 'landscape_4_3' | 'landscape_16_9' | 'landscape_21_9' | 'portrait_3_4' | 'portrait_9_16' | 'square_hd' | 'square'; // FLUX.1 [dev] image size options
  numImages?: number; // 1-4
  seed?: number;
  guidanceScale?: number; // 1-20, default 3.5
  numInferenceSteps?: number; // 1-50, default 28
  enableSafetyChecker?: boolean; // default true
  outputFormat?: 'jpeg' | 'png'; // default 'jpeg'
  acceleration?: 'none' | 'regular' | 'high'; // default 'none'
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

/**
 * Cleans AI response text by removing markdown formatting
 */
function cleanAiResponse(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
    .replace(/#{1,6}\s*/g, '')       // Remove markdown headers
    .replace(/`(.*?)`/g, '$1')       // Remove `code` formatting
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove [link](url) formatting
    .trim();
}

export async function generateDreamImage(params: FalGenerationParams): Promise<FalGenerationResult> {
  if (!FAL_API_KEY) {
    throw new Error('Missing FAL API key. Set EXPO_PUBLIC_FAL_AI_API_KEY in .env');
  }

  try {
    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: params.prompt,
        image_size: params.imageSize ?? 'landscape_4_3',
        num_images: params.numImages ?? 1,
        seed: params.seed,
        guidance_scale: params.guidanceScale ?? 3.5,
        num_inference_steps: params.numInferenceSteps ?? 28,
        enable_safety_checker: params.enableSafetyChecker ?? true,
        output_format: params.outputFormat ?? 'jpeg',
        acceleration: params.acceleration ?? 'none',
      } as any,
      logs: false,
    });

    const data = result.data as any;
    const imageUrl = data?.images?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('FLUX.1 [dev] did not return an image URL');
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
  visualPrompt?: string;
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

  const systemPrompt = params.systemPrompt || `Sen rüya tabiri konusunda uzman bir falcısın. Kullanıcının rüyasını analiz edip rüya tabiri yap.

ÖNEMLİ KURALLAR:
- Rüyadaki sembolleri yorumla ve rüya tabiri yap
- Kendi kendine ek hikaye, karakter veya olay ekleme
- Mevcut sembolleri rüya tabiri geleneğine göre yorumla
- Rüya kısa ise, sembolleri detaylıca analiz et

Şu formatta yanıt ver:

BAŞLIK: [Rüya için kısa ve çarpıcı başlık, maksimum 60 karakter]

SEMBOLLER: [Rüyadaki önemli sembolleri virgülle ayır, maksimum 5 sembol]

DUYGULAR: [Rüyadaki baskın duyguları virgülle ayır, maksimum 5 duygu]

FAL: [Rüyanın detaylı yorumu ve geleceğe dair mesaj, 3-4 cümle. Rüya tabiri geleneğine uygun yorum yap]

AÇIKLAMA: [Rüyayı detaylıca açıkla ve sembolik anlamlarını belirt. Görsel öğeleri, renkleri, atmosferi açıkla]

GÖRSEL_PROMPT: [Rüyayı görselleştirmek için çok detaylı ve spesifik İngilizce prompt. Rüyadaki HER detayı dahil et: mekan, nesneler, karakterler, eylemler, renkler, atmosfer. Örnek: "A person sitting on a small wooden raft in the middle of a vast blue ocean, surrounded by endless water, peaceful and serene atmosphere, soft sunlight, dreamy quality". Maksimum 100 kelime.]

Türkçe yanıt ver ve her bölümü net bir şekilde ayır.`;

  try {
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        prompt: `Rüya: ${params.dreamDescription}`,
        system_prompt: systemPrompt,
        model: params.model || 'openai/gpt-5-chat',
        temperature: params.temperature ?? 0.3,
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
    const visualPromptMatch = output.match(/GÖRSEL_PROMPT:?\s*(.+?)(?:\n|$)/i);

    const title = cleanAiResponse(titleMatch?.[1]?.trim() || params.dreamDescription.split(/[.!?\n]/)[0]?.slice(0, 60) || 'İsimsiz Rüya');
    const symbols = symbolsMatch?.[1]?.split(',').map(s => cleanAiResponse(s.trim())).filter(Boolean) || [];
    const emotions = emotionsMatch?.[1]?.split(',').map(e => cleanAiResponse(e.trim())).filter(Boolean) || [];
    const fortune = cleanAiResponse(fortuneMatch?.[1]?.trim() || 'Rüyanız ilginç semboller içeriyor.');
    const improvedDescription = cleanAiResponse(descriptionMatch?.[1]?.trim() || '');
    let visualPrompt = cleanAiResponse(visualPromptMatch?.[1]?.trim() || '');
    
    // If visual prompt is too generic or missing key elements, enhance it using LLM
    const isPromptInsufficient = !visualPrompt || 
      visualPrompt.length < 30 || 
      visualPrompt.toLowerCase().includes('generic') ||
      visualPrompt.toLowerCase().includes('dream scene') ||
      !visualPrompt.toLowerCase().includes(params.dreamDescription.toLowerCase().split(' ')[0]);
    
    if (isPromptInsufficient) {
      try {
        const enhancedResult = await fal.subscribe('fal-ai/any-llm', {
          input: {
            prompt: `Rüya: "${params.dreamDescription}"\n\nBu rüyayı görselleştirmek için çok detaylı ve spesifik bir İngilizce prompt oluştur. Rüyadaki TÜM ana öğeleri (yer, nesneler, karakterler, eylemler, renkler, atmosfer) mutlaka dahil et. Sadece prompt'u ver, başka açıklama yapma.`,
            system_prompt: `Sen görsel prompt uzmanısın. Rüya açıklamalarını çok detaylı ve spesifik görsel prompt'lara çevirirsin. Her detayı dahil edersin. Örnek: "A person sitting on a small wooden raft in the middle of a vast blue ocean, surrounded by endless water, peaceful and serene atmosphere, soft sunlight, dreamy quality"`,
            model: 'openai/gpt-4o-mini',
            temperature: 0.1,
            max_tokens: 200,
          },
          logs: false,
        });
        
        const enhancedPrompt = (enhancedResult.data as any).output?.trim();
        if (enhancedPrompt && enhancedPrompt.length > 30 && !enhancedPrompt.toLowerCase().includes('generic')) {
          visualPrompt = enhancedPrompt;
        }
      } catch (error) {
        // Fallback: Create a basic but descriptive prompt
        visualPrompt = `Dream scene: ${params.dreamDescription}, surreal and mystical atmosphere, soft lighting, ethereal quality, high detail`;
      }
    }

    return {
      title,
      symbols: symbols.slice(0, 5),
      emotions: emotions.slice(0, 5),
      fortune,
      improvedDescription,
      visualPrompt,
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

export type VideoGenerationParams = {
  prompt: string;
  duration?: number; // Duration in seconds
  aspectRatio?: '16:9' | '9:16' | '1:1'; // LTX Video aspect ratio options
  seed?: number;
  negativePrompt?: string;
  resolution?: '480p' | '720p'; // LTX Video resolution options (480p or 720p)
  numFrames?: number; // Number of frames (9-161, default 121)
  frameRate?: number; // Frame rate (1-60, default 30)
  expandPrompt?: boolean; // Whether to expand prompt using LLM
  enableSafetyChecker?: boolean; // Enable safety checker
};

export type VideoGenerationResult = {
  videoUrl: string;
  duration: number;
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
    
    // Convert local file URI to blob for FAL upload
    const response = await fetch(params.audioUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    // Determine correct file extension
    const fileExtension = params.audioUri.split('.').pop()?.toLowerCase() || 'm4a';
    
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
    
    // Upload file to FAL storage
    const uploadedUrl = await fal.storage.upload(audioFile);
    
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
    
    if (!data?.text) {
      console.error('No text in response:', data);
      throw new Error('Whisper did not return transcribed text');
    }

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

/**
 * Generates dream video using FAL AI video generation
 * @param params - Video generation parameters
 * @returns Generated video URL and duration
 */
export async function generateDreamVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
  if (!FAL_API_KEY) {
    throw new Error('Missing FAL API key. Set EXPO_PUBLIC_FAL_AI_API_KEY in .env');
  }

  try {
    // Calculate frames for desired duration
    const targetDuration = params.duration ?? 4; // Default 4 seconds
    const frameRate = params.frameRate ?? 30; // Default 30 FPS
    const numFrames = params.numFrames ?? Math.round(targetDuration * frameRate);
    
    // Ensure numFrames is within LTX Video's valid range (9-161)
    const clampedNumFrames = Math.max(9, Math.min(161, numFrames));
    const actualDuration = clampedNumFrames / frameRate;
    
    const result = await fal.subscribe('fal-ai/ltx-video-13b-distilled', {
      input: {
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio ?? '9:16', // Vertical format for mobile
        num_frames: clampedNumFrames,
        frame_rate: frameRate,
        resolution: params.resolution ?? '720p', // Good quality for mobile
        seed: params.seed,
        negative_prompt: params.negativePrompt || 'worst quality, inconsistent motion, blurry, jittery, distorted, ugly, low quality, text, watermark, realistic, photograph, dark, scary, nightmare',
        expand_prompt: params.expandPrompt ?? false, // Don't expand prompt by default
        enable_safety_checker: params.enableSafetyChecker ?? true, // Enable safety checker
        first_pass_num_inference_steps: 8, // Default LTX Video settings
        first_pass_skip_final_steps: 1,
        second_pass_num_inference_steps: 8,
        second_pass_skip_initial_steps: 5,
        reverse_video: false,
        loras: [], // No LoRA weights by default
      } as any,
      logs: false,
    });

    const data = result.data as any;
    const videoUrl = data?.video?.url;
    
    if (!videoUrl) {
      throw new Error('LTX Video did not return a video URL');
    }

    return { 
      videoUrl, 
      duration: Math.round(actualDuration)
    };
  } catch (error: any) {
    throw new Error(`Video generation failed: ${error.message || 'Unknown error'}`);
  }
}
