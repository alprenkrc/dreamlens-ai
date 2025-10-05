export interface Dream {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
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
