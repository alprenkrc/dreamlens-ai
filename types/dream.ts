export interface Dream {
  id: string;
  userId?: string; // User who created the dream
  title: string;
  date: string;
  description: string;
  originalDreamText?: string; // Original text as entered by user
  imageUrl: string;
  videoUrl?: string;
  symbols: string[];
  emotions: string[];
  fortune: string;
  vividness?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DreamAnalysis {
  symbols: string[];
  emotions: string[];
  fortune: string;
  confidence: number;
  themes: string[];
}
