import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, WordItem, Language } from '../types';
import { loadState, saveState, getTodayDateString, calculateNextReview, generateId } from '../utils';

interface AppContextType {
  state: AppState;
  addWord: (text: string, language: Language) => { success: boolean; message: string };
  deleteWord: (id: string) => void;
  updateWordProgress: (id: string, isKnown: boolean) => void;
  checkIn: (language: Language) => void;
  waterPlant: (language: Language) => void;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const refreshState = () => {
    const today = getTodayDateString();
    
    // Clean up isKnownToday if day changed
    const cleanWords = state.words.map(w => {
       if (w.isKnownToday && w.lastReviewed) {
         const lastDate = new Date(w.lastReviewed).toISOString().split('T')[0];
         if (lastDate !== today) {
           return { ...w, isKnownToday: false };
         }
       }
       return w;
    });
    
    if (JSON.stringify(cleanWords) !== JSON.stringify(state.words)) {
      setState(prev => ({ ...prev, words: cleanWords }));
    }
  };

  useEffect(() => {
    refreshState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addWord = (text: string, language: Language) => {
    const cleanText = text.trim();
    const exists = state.words.some(w => w.text.toLowerCase() === cleanText.toLowerCase() && w.language === language);
    
    if (exists) {
      return { success: false, message: '该字/词已存在！' };
    }

    const newWord: WordItem = {
      id: generateId(),
      text: cleanText,
      language,
      addedAt: Date.now(),
      lastReviewed: null,
      nextReviewDate: getTodayDateString(), 
      streak: 0,
      familiarity: 0,
      isKnownToday: false
    };

    setState(prev => ({
      ...prev,
      words: [newWord, ...prev.words]
    }));

    return { success: true, message: '录入成功！' };
  };

  const deleteWord = (id: string) => {
    setState(prev => ({
      ...prev,
      words: prev.words.filter(w => w.id !== id)
    }));
  };

  const updateWordProgress = (id: string, isKnown: boolean) => {
    setState(prev => {
      const wordIndex = prev.words.findIndex(w => w.id === id);
      if (wordIndex === -1) return prev;

      const word = prev.words[wordIndex];
      const { nextDate, newStreak, familiarity } = calculateNextReview(word.streak, isKnown);
      
      const updatedWord: WordItem = {
        ...word,
        lastReviewed: Date.now(),
        nextReviewDate: nextDate,
        streak: newStreak,
        familiarity: familiarity,
        isKnownToday: isKnown 
      };

      const newWords = [...prev.words];
      newWords[wordIndex] = updatedWord;
      
      return {
        ...prev,
        words: newWords
      };
    });
  };

  // Mark task as done for specific language
  const checkIn = (language: Language) => {
    const today = getTodayDateString();
    const key = `${today}:${language}`;
    setState(prev => {
      if (prev.checkIns.includes(key)) return prev;
      return {
        ...prev,
        checkIns: [...prev.checkIns, key]
      };
    });
  };

  // Increment water level and mark specific language reward as claimed
  const waterPlant = (language: Language) => {
    const today = getTodayDateString();
    const key = `${today}:${language}`;
    
    setState(prev => {
      // Prevent double watering for the same language task
      if (prev.plant.waterHistory.includes(key)) return prev;
      
      const newWaterLevel = prev.plant.waterLevel + 1;
      let newPlantsCollected = prev.plant.plantsCollected;
      let finalWaterLevel = newWaterLevel;

      if (newWaterLevel >= 30) {
        newPlantsCollected += 1;
        finalWaterLevel = 0;
      }

      return {
        ...prev,
        plant: {
          ...prev.plant,
          waterLevel: finalWaterLevel,
          plantsCollected: newPlantsCollected,
          waterHistory: [...prev.plant.waterHistory, key]
        }
      };
    });
  };

  return (
    <AppContext.Provider value={{ state, addWord, deleteWord, updateWordProgress, checkIn, waterPlant, refreshState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};