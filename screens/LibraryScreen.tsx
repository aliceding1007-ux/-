import React, { useState } from 'react';
import { useApp } from '../services/appContext';
import { Language, WordItem } from '../types';
import { StarIcon, TrashIcon } from '../components/Icons';
import Button from '../components/Button';

interface Props {
  language: Language;
}

const LibraryScreen: React.FC<Props> = ({ language }) => {
  const { state, deleteWord } = useApp();
  const [search, setSearch] = useState('');
  const [wordToDelete, setWordToDelete] = useState<WordItem | null>(null);

  const words = state.words
    .filter(w => w.language === language)
    .filter(w => w.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.addedAt - a.addedAt); // Newest first

  const confirmDelete = () => {
    if (wordToDelete) {
        try {
            deleteWord(wordToDelete.id);
            setWordToDelete(null);
        } catch (e) {
            alert('删除失败，请重试 / Delete failed');
        }
    }
  };

  return (
    <div className="h-full flex flex-col p-4 w-full max-w-3xl mx-auto relative">
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder={language === 'chinese' ? "搜索汉字..." : "Search words..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 pl-6 rounded-full border-2 border-slate-200 text-lg focus:outline-none focus:border-brandBlue shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {words.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">
            <p className="text-xl">空空如也 / Empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {words.map((word) => (
              <WordCard 
                key={word.id} 
                word={word} 
                onRequestDelete={() => setWordToDelete(word)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {wordToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm rounded-3xl">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in border-2 border-slate-100">
                <h3 className="text-2xl font-bold mb-2 text-center">
                    {language === 'chinese' ? '确定要删除吗？' : 'Delete this word?'}
                </h3>
                
                <div className="my-6 p-4 bg-slate-50 rounded-xl text-center">
                    <span className={`text-4xl font-bold ${language === 'chinese' ? 'font-kaiti' : 'font-arial'}`}>
                        {wordToDelete.text}
                    </span>
                </div>

                <div className="flex gap-4">
                    <Button 
                        variant="secondary" 
                        fullWidth 
                        onClick={() => setWordToDelete(null)}
                    >
                        {language === 'chinese' ? '取消' : 'Cancel'}
                    </Button>
                    <Button 
                        variant="danger" 
                        fullWidth 
                        onClick={confirmDelete}
                    >
                        {language === 'chinese' ? '删除' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const WordCard: React.FC<{ word: WordItem; onRequestDelete: () => void }> = ({ word, onRequestDelete }) => {
  const isChinese = word.language === 'chinese';
  const addedDate = new Date(word.addedAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-4 flex items-center justify-between transition-transform hover:scale-[1.01] group">
      <div className="flex items-center gap-6">
        <div className={`w-20 h-20 flex items-center justify-center rounded-xl bg-slate-50 text-4xl shadow-inner text-slate-700 ${isChinese ? 'font-kaiti font-bold' : 'font-arial font-bold'}`}>
          {word.text}
        </div>
        <div className="flex flex-col gap-2">
           <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon 
                key={star} 
                fill={star <= word.familiarity} 
                className={`w-6 h-6 ${star <= word.familiarity ? 'text-brandYellow' : 'text-slate-200'}`} 
              />
            ))}
          </div>
          <div className="text-sm text-slate-400 font-bold">
            添加时间: {addedDate}
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onRequestDelete();
        }}
        className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-brandRed hover:text-white transition-all shadow-sm cursor-pointer z-10 active:scale-95"
        aria-label="Delete"
        type="button"
      >
        <TrashIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default LibraryScreen;