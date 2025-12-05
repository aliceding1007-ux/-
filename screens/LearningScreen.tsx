import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../services/appContext';
import { Language, WordItem } from '../types';
import { getTodayDateString, speak } from '../utils';
import Button from '../components/Button';
import { VolumeIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/Icons';

interface Props {
  language: Language;
  mode: 'new' | 'review';
  onFinish: () => void;
}

const LearningScreen: React.FC<Props> = ({ language, mode, onFinish }) => {
  const { state, updateWordProgress, checkIn } = useApp();
  const [queue, setQueue] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref to track if we've loaded the initial words for this session
  const isQueueInitialized = useRef(false);
  
  // Initialization
  useEffect(() => {
    if (isQueueInitialized.current) return;

    const today = getTodayDateString();
    let wordsToLearn: WordItem[] = [];

    if (mode === 'new') {
      wordsToLearn = state.words.filter(w => 
        w.language === language && 
        w.streak === 0 && 
        !w.isKnownToday
      );
    } else {
      wordsToLearn = state.words.filter(w => 
        w.language === language && 
        w.streak > 0 &&
        w.nextReviewDate <= today && 
        !w.isKnownToday
      );
    }

    wordsToLearn.sort((a, b) => a.addedAt - b.addedAt);
    setQueue(wordsToLearn);
    isQueueInitialized.current = true;
  }, [language, mode, state.words]);

  // Handle completion and auto check-in
  useEffect(() => {
    if (showComplete) {
      checkIn(language);
    }
  }, [showComplete, checkIn, language]);

  if (queue.length === 0 && !showComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-600 mb-4">
          {mode === 'new' ? '没有新词了！' : '复习任务完成！'}
        </h2>
        <p className="text-slate-400 mb-8">
          {mode === 'new' ? '去录入一些新字吧！' : '你今天表现很棒！'}
        </p>
        <Button onClick={onFinish}>返回 / Back</Button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];

  const handleNext = () => {
    if (isProcessing) return;
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isProcessing) return;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleResult = async (isKnown: boolean) => {
    if (isProcessing || !currentWord) return;

    try {
        if (!isKnown) {
            // --- Flow: I Don't Know ---
            setIsProcessing(true); // Lock UI

            // 1. Auto Speak
            speak(currentWord.text, language);

            // 2. Update Persisted Data (Mark as unknown)
            updateWordProgress(currentWord.id, false);

            // 3. Wait 1 second (UI will enlarge text during this time)
            await new Promise(resolve => setTimeout(resolve, 1500)); // Slightly longer for kids to see

            // 4. Adjust Queue: Move current word to the end
            setQueue(prevQueue => {
                const newQueue = [...prevQueue];
                // Remove the word from current position
                if (currentIndex < newQueue.length) {
                    const [movedWord] = newQueue.splice(currentIndex, 1);
                    // Add it back to the end
                    newQueue.push(movedWord);
                }
                return newQueue;
            });
            
            setIsProcessing(false); // Unlock UI

        } else {
            // --- Flow: I Know ---
            updateWordProgress(currentWord.id, true);

            // Remove from queue entirely for this session
            const newQueue = queue.filter(w => w.id !== currentWord.id);
            setQueue(newQueue);

            // Adjust index to stay within bounds
            if (currentIndex >= newQueue.length) {
                setCurrentIndex(Math.max(0, newQueue.length - 1));
            }

            if (newQueue.length === 0) {
                setShowComplete(true);
            }
        }
    } catch (e) {
        console.error(e);
        alert("操作失败，请再试一次。/ Action failed, please try again.");
        setIsProcessing(false);
    }
  };

  // Dynamic font size calculator
  const getFontSize = (text: string) => {
    const len = text.length;
    if (language === 'chinese') {
        if (len <= 1) return 'text-[30vh]'; 
        if (len <= 2) return 'text-[25vh]';
        if (len <= 4) return 'text-[15vh]';
        return 'text-[10vh]';
    } else {
        if (len <= 3) return 'text-[25vh]';
        if (len <= 6) return 'text-[15vh]';
        if (len <= 10) return 'text-[10vh]';
        return 'text-[6vh]'; 
    }
  };

  if (showComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
         <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500">
            <CheckIcon className="w-16 h-16" />
         </div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">完成！Awesome!</h2>
        <p className="text-slate-500 mb-8">
            {language === 'chinese' ? '中文打卡成功！' : 'English task complete!'} <br/>
            去花园看看吧！
        </p>
        <Button size="lg" variant="success" onClick={onFinish}>去花园 / Go to Garden</Button>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="h-full flex flex-col items-center p-2 w-full max-w-7xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-2 overflow-hidden flex-shrink-0">
        <div 
            className="h-full bg-brandBlue transition-all duration-500"
            style={{ width: `${((state.words.filter(w => w.language === language && w.isKnownToday).length) / (state.words.filter(w => w.language === language).length || 1)) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-between w-full gap-4 min-h-0">
        <button onClick={handlePrev} disabled={currentIndex === 0 || isProcessing} className="p-4 text-slate-300 hover:text-brandBlue disabled:opacity-20 flex-shrink-0 transition-opacity">
            <ArrowLeftIcon className="w-12 h-12" />
        </button>

        {/* Card Container */}
        <div className="flex-1 h-full flex flex-col items-center justify-center min-h-0 p-2">
           <div 
             className={`bg-white rounded-[2rem] shadow-xl border-4 w-full max-w-4xl aspect-[4/3] max-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden group p-4 transition-all duration-500 
               ${isProcessing 
                 ? 'border-brandRed/30 shadow-brandRed/20' 
                 : 'border-slate-100'
               }`}
           >
              {/* Top Hint Text */}
              <div className={`absolute top-6 left-0 right-0 text-center transition-all duration-300 ${isProcessing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <span className="bg-brandRed/10 text-brandRed px-4 py-2 rounded-full font-bold text-lg animate-pulse">
                      {language === 'chinese' ? '请仔细看...' : 'Look carefully...'}
                  </span>
              </div>

              {/* Word Display */}
              <div className="flex-1 flex items-center justify-center w-full h-full overflow-hidden">
                  <span 
                    className={`block text-center leading-tight break-words whitespace-pre-wrap select-none transition-all duration-500 ease-out text-slate-700
                      ${language === 'chinese' ? 'font-kaiti' : 'font-arial'}
                      ${getFontSize(currentWord.text)}
                      ${isProcessing ? 'scale-125 drop-shadow-md' : 'scale-100'}
                    `}
                    style={{ wordBreak: 'break-word' }}
                  >
                     {currentWord.text}
                  </span>
              </div>
              
              <button 
                onClick={() => speak(currentWord.text, language)}
                disabled={isProcessing}
                className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 disabled:opacity-0
                    ${isProcessing ? 'bg-transparent text-transparent' : 'bg-brandBlue/10 text-brandBlue hover:bg-brandBlue hover:text-white'}
                `}
              >
                 <VolumeIcon className="w-8 h-8" />
              </button>

               <div className="absolute top-4 right-6 text-slate-300 text-lg font-bold">
                  {currentIndex + 1} / {queue.length}
               </div>
           </div>
        </div>

        <button onClick={handleNext} disabled={currentIndex === queue.length - 1 || isProcessing} className="p-4 text-slate-300 hover:text-brandBlue disabled:opacity-20 flex-shrink-0 transition-opacity">
            <ArrowRightIcon className="w-12 h-12" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex justify-between gap-8 mt-4 mb-2 px-8 max-w-4xl flex-shrink-0">
          <Button 
            variant="danger" 
            size="xl" 
            fullWidth 
            onClick={() => handleResult(false)}
            disabled={isProcessing}
            className={`rounded-3xl py-6 text-3xl transition-opacity ${isProcessing ? 'opacity-20 cursor-not-allowed' : ''}`}
          >
            不认识 ❌
          </Button>
          <Button 
            variant="success" 
            size="xl" 
            fullWidth 
            onClick={() => handleResult(true)}
            disabled={isProcessing}
            className={`rounded-3xl py-6 text-3xl transition-opacity ${isProcessing ? 'opacity-20 cursor-not-allowed' : ''}`}
          >
            认识 ⭕
          </Button>
      </div>
    </div>
  );
};

export default LearningScreen;