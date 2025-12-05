import React, { useState } from 'react';
import { AppProvider, useApp } from './services/appContext';
import { Language } from './types';
import Button from './components/Button';
import { HomeIcon, BookIcon, PlusIcon, CalendarIcon, ArrowLeftIcon } from './components/Icons';
import AddWordScreen from './screens/AddWordScreen';
import LibraryScreen from './screens/LibraryScreen';
import LearningScreen from './screens/LearningScreen';
import CalendarScreen from './screens/CalendarScreen';

// Sub-components for clean structure

const Dashboard: React.FC<{ language: Language, onBack: () => void }> = ({ language, onBack }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'add' | 'lib' | 'learn-new' | 'learn-review' | 'calendar'>('menu');
  const isChinese = language === 'chinese';

  // Navigation Helper
  const goMenu = () => setActiveTab('menu');

  if (activeTab === 'menu') {
    return (
      <div className={`h-full flex flex-col p-6 animate-fade-in ${isChinese ? 'font-kaiti' : 'font-arial'}`}>
        <header className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50">
                <ArrowLeftIcon className="w-6 h-6 text-slate-500" />
            </button>
            <h1 className={`text-4xl font-bold ${isChinese ? 'text-brandRed' : 'text-brandBlue'}`}>
                {isChinese ? '中文学习' : 'English Learning'}
            </h1>
            <div className="w-12"></div>
        </header>

        <div className="grid grid-cols-2 gap-6 flex-1 max-w-4xl mx-auto w-full">
            <MenuCard 
                color="bg-brandGreen" 
                title={isChinese ? "录入新字" : "Add New"} 
                icon={<PlusIcon className="w-12 h-12 text-white" />}
                onClick={() => setActiveTab('add')}
            />
            <MenuCard 
                color="bg-brandYellow" 
                title={isChinese ? "字库" : "Library"} 
                icon={<BookIcon className="w-12 h-12 text-yellow-800" />}
                textColor="text-yellow-900"
                onClick={() => setActiveTab('lib')}
            />
            <MenuCard 
                color="bg-brandRed" 
                title={isChinese ? "学习新词" : "Learn New"} 
                subtitle="New Words"
                icon={<span className="text-4xl">🌱</span>}
                onClick={() => setActiveTab('learn-new')}
            />
            <MenuCard 
                color="bg-brandBlue" 
                title={isChinese ? "复习" : "Review"} 
                subtitle="Ebbinghaus"
                icon={<span className="text-4xl">🧠</span>}
                onClick={() => setActiveTab('learn-review')}
            />
             <div className="col-span-2 mt-4">
                <MenuCard 
                    color="bg-purple-400" 
                    title={isChinese ? "打卡花园" : "Garden & Check-in"} 
                    icon={<CalendarIcon className="w-12 h-12 text-white" />}
                    onClick={() => setActiveTab('calendar')}
                    horizontal
                />
            </div>
        </div>
      </div>
    );
  }

  // Sub-screen Wrapper
  return (
    <div className="h-full flex flex-col bg-slate-50">
        <header className="bg-white p-4 shadow-sm flex items-center gap-4 px-6 z-10">
            <button onClick={goMenu} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
            </button>
            <span className="font-bold text-lg text-slate-500">
                {activeTab === 'add' && (isChinese ? '录入' : 'Add')}
                {activeTab === 'lib' && (isChinese ? '字库' : 'Library')}
                {activeTab === 'learn-new' && (isChinese ? '学习新词' : 'Learning')}
                {activeTab === 'learn-review' && (isChinese ? '复习' : 'Review')}
                {activeTab === 'calendar' && (isChinese ? '打卡' : 'Check-in')}
            </span>
        </header>
        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'add' && <AddWordScreen language={language} />}
            {activeTab === 'lib' && <LibraryScreen language={language} />}
            {activeTab === 'learn-new' && <LearningScreen language={language} mode="new" onFinish={goMenu} />}
            {activeTab === 'learn-review' && <LearningScreen language={language} mode="review" onFinish={goMenu} />}
            {activeTab === 'calendar' && <CalendarScreen />}
        </div>
    </div>
  );
};

const MenuCard = ({ color, title, subtitle, icon, onClick, textColor = 'text-white', horizontal = false }: any) => (
  <button 
    onClick={onClick}
    className={`${color} ${horizontal ? 'flex-row px-8' : 'flex-col p-6'} ${textColor} rounded-3xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 h-full w-full border-b-8 border-black/10`}
  >
    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
        {icon}
    </div>
    <div className="text-center">
        <h3 className="text-2xl font-bold">{title}</h3>
        {subtitle && <p className="opacity-80 text-sm font-bold uppercase">{subtitle}</p>}
    </div>
  </button>
);

const HomeSelection = ({ onSelect }: { onSelect: (l: Language) => void }) => {
  return (
    <div className="h-full flex flex-col md:flex-row">
      <button 
        onClick={() => onSelect('chinese')}
        className="flex-1 bg-brandRed text-white flex flex-col items-center justify-center gap-8 hover:brightness-110 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <span className="text-[8rem] font-kaiti group-hover:scale-110 transition-transform">中文</span>
        <span className="text-2xl opacity-80 bg-black/20 px-6 py-2 rounded-full">进入学习 Enter</span>
      </button>
      
      <button 
        onClick={() => onSelect('english')}
        className="flex-1 bg-brandBlue text-white flex flex-col items-center justify-center gap-8 hover:brightness-110 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <span className="text-[6rem] font-arial font-bold group-hover:scale-110 transition-transform">English</span>
        <span className="text-2xl opacity-80 bg-black/20 px-6 py-2 rounded-full">Enter Learning</span>
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [language, setLanguage] = useState<Language | null>(null);

  return (
    <div className="h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {!language ? (
        <HomeSelection onSelect={setLanguage} />
      ) : (
        <Dashboard language={language} onBack={() => setLanguage(null)} />
      )}
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;