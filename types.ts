export type Language = 'chinese' | 'english';

export interface WordItem {
  id: string;
  text: string;
  language: Language;
  addedAt: number; // timestamp
  lastReviewed: number | null; // timestamp
  nextReviewDate: string; // YYYY-MM-DD
  streak: number; // Ebbinghaus stage index
  familiarity: number; // 0-5 stars
  isKnownToday: boolean; // Reset daily
}

export interface PlantState {
  waterLevel: number; // 0-30
  plantsCollected: number; // Total plants finished
  // Replace simple lastWaterDate with a history log to track "2023-10-27:chinese" etc.
  waterHistory: string[]; 
}

export interface AppState {
  version: number; // Data schema version
  words: WordItem[];
  // checkIns format: "YYYY-MM-DD:chinese" or "YYYY-MM-DD:english"
  checkIns: string[]; 
  plant: PlantState;
}

export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30];