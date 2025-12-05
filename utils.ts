import { EBBINGHAUS_INTERVALS, WordItem, AppState } from './types';

// Date Helpers
export const getTodayDateString = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const isSameDay = (d1: string, d2: string): boolean => d1 === d2;

// UUID Helper for compatibility
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Storage Helpers
const STORAGE_KEY = 'little_linguist_db_v1';
const CURRENT_VERSION = 2;

const INITIAL_STATE: AppState = {
  version: CURRENT_VERSION,
  words: [],
  checkIns: [],
  plant: {
    waterLevel: 0,
    plantsCollected: 0,
    waterHistory: [],
  },
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return INITIAL_STATE;
    
    const state = JSON.parse(serialized);
    
    // Migration Logic
    if (!state.version || state.version < CURRENT_VERSION) {
       console.log("Migrating data to version", CURRENT_VERSION);
       
       // Migration: Ensure plant waterHistory exists
       if (state.plant && !state.plant.waterHistory) {
         state.plant.waterHistory = [];
       }
       
       // Migration: Add version
       state.version = CURRENT_VERSION;
    }
    
    return state;
  } catch (e) {
    console.error('Failed to load state', e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save state', e);
    // In a real app, might want to show a toast, but keeping it simple here
  }
};

// Text-to-Speech
export const speak = (text: string, lang: 'chinese' | 'english') => {
  if (!window.speechSynthesis) return;
  
  // Cancel previous speech to avoid queue buildup
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Ensure standard accents
  utterance.lang = lang === 'chinese' ? 'zh-CN' : 'en-US';
  // Slow down significantly for clarity (0.5 is half speed)
  utterance.rate = 0.5; 
  utterance.volume = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};

// Audio Effects
export const playWaterSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to sound like water (Lowpass)
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Muffled water sound

    // Envelope for gain (Fade in -> sustain -> fade out)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
    // Clean up
    setTimeout(() => {
      if(ctx.state !== 'closed') ctx.close();
    }, 2000);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// Ebbinghaus Logic
export const calculateNextReview = (currentStreak: number, isSuccess: boolean): { nextDate: string, newStreak: number, familiarity: number } => {
  const today = getTodayDateString();
  
  if (isSuccess) {
    const newStreak = Math.min(currentStreak + 1, EBBINGHAUS_INTERVALS.length - 1);
    const daysToAdd = EBBINGHAUS_INTERVALS[currentStreak] || 1;
    const nextDate = addDays(today, daysToAdd);
    // Familiarity maps roughly to streak but capped at 5
    const familiarity = Math.min(newStreak, 5);
    
    return { nextDate, newStreak, familiarity };
  } else {
    // Reset or reduce
    const newStreak = Math.max(0, currentStreak - 1);
    // If unknown, review tomorrow (or strictly "today" logic is handled by app state, but for scheduling next session: tomorrow)
    const nextDate = addDays(today, 1);
    const familiarity = 0; // Reset stars if totally forgotten
    
    return { nextDate, newStreak, familiarity };
  }
};