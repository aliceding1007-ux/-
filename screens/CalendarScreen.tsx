import React, { useState } from 'react';
import { useApp } from '../services/appContext';
import { getTodayDateString, playWaterSound } from '../utils';
import { CheckIcon } from '../components/Icons';
import { Language } from '../types';

// SVG Component for the Cute Watering Can
const CuteWateringCan = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Body */}
    <path d="M20 40 Q20 30 30 30 H70 Q80 30 80 40 V80 Q80 90 70 90 H30 Q20 90 20 80 Z" fill="#4ECDC4" stroke="#2CB2A8" strokeWidth="2" />
    {/* Handle */}
    <path d="M20 45 C10 45 10 75 20 75" fill="none" stroke="#2CB2A8" strokeWidth="5" strokeLinecap="round" />
    {/* Spout Base */}
    <path d="M80 50 L95 40" stroke="#4ECDC4" strokeWidth="6" strokeLinecap="round" />
    {/* Spout Head - This is where water comes from (approx 95, 40) */}
    <circle cx="95" cy="40" r="5" fill="#FFE66D" stroke="#E6C840" strokeWidth="2" />
    {/* Cute Face */}
    <circle cx="40" cy="55" r="3" fill="#333" />
    <circle cx="60" cy="55" r="3" fill="#333" />
    <path d="M45 65 Q50 70 55 65" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    {/* Cheeks */}
    <circle cx="35" cy="62" r="3" fill="#FF6B6B" opacity="0.5" />
    <circle cx="65" cy="62" r="3" fill="#FF6B6B" opacity="0.5" />
  </svg>
);

const CalendarScreen: React.FC = () => {
  const { state, waterPlant } = useApp();
  const today = getTodayDateString();
  
  // Tasks Status
  const chineseDone = state.checkIns.includes(`${today}:chinese`);
  const englishDone = state.checkIns.includes(`${today}:english`);
  const chineseWatered = state.plant.waterHistory.includes(`${today}:chinese`);
  const englishWatered = state.plant.waterHistory.includes(`${today}:english`);
  
  const { waterLevel, plantsCollected } = state.plant;
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false); 
  const [isPouring, setIsPouring] = useState(false);
  const [waterDrops, setWaterDrops] = useState<number[]>([]);

  // Calculate Calendar
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const handleWateringInteraction = (lang: Language) => {
    if (isAnimating || isPouring) return;
    
    // Step 1: Move to center (Position over plant)
    setIsAnimating(true);
    
    // Step 2: After moving (0.8s), start pouring
    setTimeout(() => {
        setIsPouring(true);
        playWaterSound(); 
        
        // Create drops loop
        const dropInterval = setInterval(() => {
             setWaterDrops(prev => [...prev, Date.now()]);
        }, 100);

        // Step 3: Finish pouring
        setTimeout(() => {
            clearInterval(dropInterval);
            setIsPouring(false);
            setWaterDrops([]);
            
            // Step 4: Move back
            setTimeout(() => {
                setIsAnimating(false);
                waterPlant(lang); // Commit state change
            }, 500);
            
        }, 2000); 

    }, 800);
  };
  
  const stemHeight = 20 + (waterLevel * 5.5);
  const getLeafScale = (threshold: number) => {
      if (waterLevel < threshold) return 0;
      return Math.min(1, (waterLevel - threshold + 1) / 3);
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Left: Calendar & Tasks */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex flex-col">
           <h2 className="text-2xl font-bold mb-4 font-kaiti">📅 打卡记录 ({currentMonthStr})</h2>
           
           {/* Mini Task Dashboard */}
           <div className="mb-6 p-4 bg-slate-50 rounded-2xl flex gap-4">
               <div className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${chineseDone ? 'bg-red-50 border-red-200' : 'border-slate-200'}`}>
                   <span className="font-kaiti font-bold text-lg">中文</span>
                   {chineseDone ? <CheckIcon className="text-red-500 w-8 h-8"/> : <span className="text-slate-300 text-sm">未完成</span>}
               </div>
               <div className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${englishDone ? 'bg-blue-50 border-blue-200' : 'border-slate-200'}`}>
                   <span className="font-arial font-bold text-lg">English</span>
                   {englishDone ? <CheckIcon className="text-blue-500 w-8 h-8"/> : <span className="text-slate-300 text-sm">Pending</span>}
               </div>
           </div>

           {/* Calendar Grid */}
           <div className="grid grid-cols-7 gap-2 flex-1 content-start">
              {['日','一','二','三','四','五','六'].map(d => (
                  <div key={d} className="text-center text-slate-400 font-bold mb-2">{d}</div>
              ))}
              {daysArray.map(day => {
                  const dayStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
                  // Check if AT LEAST ONE language was done that day
                  const hasCN = state.checkIns.includes(`${dayStr}:chinese`);
                  const hasEN = state.checkIns.includes(`${dayStr}:english`);
                  const isChecked = hasCN || hasEN;
                  const isFullyChecked = hasCN && hasEN;
                  const isToday = dayStr === today;
                  
                  return (
                      <div 
                        key={day} 
                        className={`aspect-square rounded-xl flex items-center justify-center font-bold text-lg border-2 transition-all relative
                            ${isToday ? 'border-brandBlue scale-105 shadow-md' : 'border-transparent'}
                            ${isChecked ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300'}
                        `}
                      >
                          {isChecked ? <CheckIcon className="w-5 h-5" /> : day}
                          {isFullyChecked && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>}
                      </div>
                  );
              })}
           </div>
        </div>

        {/* Right: Plant Garden */}
        <div className="flex-1 bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl p-6 shadow-inner flex flex-col items-center justify-between relative overflow-hidden border-4 border-white">
            <div className="text-center z-10 w-full flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-700 font-kaiti">我的花园</h2>
                    <p className="text-slate-500 text-sm">已收集: {plantsCollected} 盆</p>
                </div>
            </div>

            {/* Interactive Area */}
            <div className="flex-1 w-full relative flex items-end justify-center pb-12">
                
                {/* Water Bottles Inventory / Triggers */}
                <div className="absolute top-4 right-4 z-40 flex flex-col gap-4">
                    {/* Chinese Water Bottle */}
                    {chineseDone && !chineseWatered && (
                        <button 
                            onClick={() => handleWateringInteraction('chinese')}
                            disabled={isAnimating}
                            className="bg-white/80 p-2 rounded-xl shadow-lg animate-bounce hover:scale-110 transition-transform flex items-center gap-2"
                        >
                            <span className="text-2xl">💧</span>
                            <span className="font-kaiti font-bold text-xs text-brandRed">中文奖励</span>
                        </button>
                    )}
                    
                    {/* English Water Bottle */}
                    {englishDone && !englishWatered && (
                        <button 
                            onClick={() => handleWateringInteraction('english')}
                            disabled={isAnimating}
                            className="bg-white/80 p-2 rounded-xl shadow-lg animate-bounce hover:scale-110 transition-transform flex items-center gap-2"
                            style={{ animationDelay: '0.5s' }}
                        >
                            <span className="text-2xl">💧</span>
                            <span className="font-arial font-bold text-xs text-brandBlue">English Reward</span>
                        </button>
                    )}
                </div>

                {/* Watering Can Component */}
                <div 
                    className={`absolute z-50 transition-all duration-700 ease-in-out pointer-events-none`}
                    style={{
                        top: isAnimating ? '20%' : '-20%', // Hidden off screen until needed
                        right: isAnimating ? '50%' : '10px',
                        opacity: isAnimating ? 1 : 0,
                        transformOrigin: '70% 40%', // Pivot near the handle/body connection for better tilt
                        transform: `
                            translate(${isAnimating ? '50%' : '0'}, 0) 
                            rotate(${isPouring ? '-35deg' : '0deg'}) 
                        `
                    }}
                >
                    <CuteWateringCan className="w-40 h-40 drop-shadow-2xl" />
                </div>

                {/* Water Drops Animation */}
                {/* Drops align with the rotated spout position */}
                {waterDrops.map(id => (
                    <div 
                        key={id} 
                        className="absolute w-3 h-4 bg-blue-400 rounded-full opacity-80" 
                        style={{ 
                            top: '35%', 
                            left: '50%',
                            // Slightly offset to left to match spout tip when rotated
                            marginLeft: '-35px', 
                            animation: 'fall 0.6s linear forwards'
                        }} 
                    />
                ))}
                
                <style>{`
                    @keyframes fall {
                        0% { transform: translateY(0) scale(1); opacity: 0.8; }
                        100% { transform: translateY(250px) scale(0.5); opacity: 0; }
                    }
                `}</style>

                {/* Plant Visualization */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative flex flex-col items-center justify-end" style={{ width: '4px' }}>
                        <div 
                            className="w-3 bg-green-500 rounded-t-full transition-all duration-1000 ease-out relative"
                            style={{ height: `${stemHeight}px` }}
                        >
                            <div className="absolute bottom-4 -left-6 w-8 h-8 bg-green-400 rounded-tr-3xl rounded-bl-3xl origin-bottom-right transition-transform duration-1000" style={{ transform: `scale(${getLeafScale(3)}) rotate(-45deg)` }} />
                            <div className="absolute bottom-12 -right-6 w-8 h-8 bg-green-400 rounded-tl-3xl rounded-br-3xl origin-bottom-left transition-transform duration-1000" style={{ transform: `scale(${getLeafScale(8)}) rotate(45deg)` }} />
                            <div className="absolute bottom-20 -left-8 w-10 h-10 bg-green-500 rounded-tr-3xl rounded-bl-3xl origin-bottom-right transition-transform duration-1000" style={{ transform: `scale(${getLeafScale(15)}) rotate(-30deg)` }} />
                            <div className="absolute bottom-28 -right-8 w-10 h-10 bg-green-500 rounded-tl-3xl rounded-br-3xl origin-bottom-left transition-transform duration-1000" style={{ transform: `scale(${getLeafScale(22)}) rotate(30deg)` }} />

                            {waterLevel >= 30 && (
                                <div className="absolute -top-10 -left-8 w-20 h-20 animate-spin-slow">
                                     <div className="w-full h-full relative">
                                        {[0, 60, 120, 180, 240, 300].map(deg => (
                                            <div key={deg} className="absolute top-0 left-1/2 w-6 h-10 bg-pink-400 rounded-full origin-bottom -translate-x-1/2" style={{ transform: `rotate(${deg}deg) translateY(-10px)` }} />
                                        ))}
                                        <div className="absolute inset-0 m-auto w-8 h-8 bg-yellow-400 rounded-full shadow-inner" />
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pot */}
                    <div className="w-32 h-24 bg-gradient-to-r from-orange-500 to-orange-400 rounded-b-3xl rounded-t-lg relative shadow-xl z-20 mt-[-4px]">
                        <div className="absolute top-0 w-full h-4 bg-black/10 rounded-t-lg"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-900/10 text-4xl font-black">
                            {waterLevel}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full z-10">
                <div className="w-full bg-white/60 h-4 rounded-full overflow-hidden border border-white">
                    <div 
                        className="h-full bg-blue-400 transition-all duration-1000 relative"
                        style={{ width: `${(waterLevel / 30) * 100}%` }}
                    >
                         <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>
                    </div>
                </div>
                <div className="text-center mt-2 font-bold text-slate-600">
                    {waterLevel} / 30 💧
                </div>
            </div>

            <div className="absolute top-10 left-10 text-white/60 text-6xl animate-pulse">☁️</div>
            <div className="absolute top-24 right-8 text-white/50 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>☁️</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;