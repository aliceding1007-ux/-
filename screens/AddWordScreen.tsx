import React, { useState } from 'react';
import { useApp } from '../services/appContext';
import { Language } from '../types';
import Button from '../components/Button';
import { CheckIcon, PlusIcon } from '../components/Icons';

interface Props {
  language: Language;
}

const AddWordScreen: React.FC<Props> = ({ language }) => {
  const { addWord } = useApp();
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

  const validate = (text: string): boolean => {
    if (language === 'chinese') {
      return /^[\u4e00-\u9fa5]+$/.test(text);
    } else {
      return /^[a-zA-Z\s]+$/.test(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    if (!validate(input)) {
      setFeedback({ type: 'error', msg: language === 'chinese' ? '只能输入中文汉字' : '只能输入英文单词' });
      return;
    }

    const result = addWord(input, language);
    if (result.success) {
      setFeedback({ type: 'success', msg: result.message });
      setInput('');
      // Auto clear success message after 2s
      setTimeout(() => setFeedback({ type: null, msg: '' }), 2000);
    } else {
      setFeedback({ type: 'error', msg: result.message });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-2xl mx-auto w-full">
      <h2 className={`text-3xl font-bold mb-8 ${language === 'chinese' ? 'font-kaiti' : 'font-arial text-brandBlue'}`}>
        {language === 'chinese' ? '录入新汉字' : 'Add New Word'}
      </h2>

      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setFeedback({ type: null, msg: '' });
          }}
          placeholder={language === 'chinese' ? '请输入汉字...' : 'Enter english word...'}
          className={`w-full p-6 text-4xl text-center border-4 rounded-3xl outline-none transition-colors 
            ${feedback.type === 'error' ? 'border-brandRed bg-red-50' : 'border-brandBlue focus:border-teal-400'}
            ${language === 'chinese' ? 'font-kaiti' : 'font-arial'}`}
          autoFocus
        />

        {feedback.type === 'success' && (
          <div className="absolute top-1/2 right-6 transform -translate-y-1/2 text-green-500 animate-bounce">
            <CheckIcon className="w-10 h-10" />
          </div>
        )}
      </form>

      {feedback.msg && (
        <div className={`mt-4 text-xl font-bold ${feedback.type === 'error' ? 'text-brandRed' : 'text-green-600'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="mt-12 w-full">
        <Button 
          fullWidth 
          size="xl" 
          onClick={handleSubmit} 
          disabled={!input}
          className="shadow-lg"
        >
          <PlusIcon className="w-8 h-8" />
          {language === 'chinese' ? '确认添加' : 'Add Word'}
        </Button>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">
        {language === 'chinese' ? '提示：仅支持输入简体中文' : 'Hint: Only English letters allowed'}
      </p>
    </div>
  );
};

export default AddWordScreen;