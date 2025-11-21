export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface AnalysisResult {
  is_ai_generated: boolean;
  confidence_score: number; // 0 to 100
  verdict: 'REAL' | 'SUSPICIOUS' | 'LIKELY_AI';
  reasoning: string;
  artifacts_detected: string[];
  watermark_detected: boolean;
  technical_details: {
    lighting_consistency: string;
    anatomy_geometry: string;
    texture_quality: string;
  };
}

export interface MediaFile {
  file: File;
  previewUrl: string;
  type: MediaType;
}