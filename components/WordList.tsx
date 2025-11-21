import React from 'react';
import { Word } from '../types';
import { Trash2, Check, Volume2 } from 'lucide-react';

interface WordListProps {
  words: Word[];
  onDelete: (id: string) => void;
}

const WordList: React.FC<WordListProps> = ({ words, onDelete }) => {
  if (words.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-500">Your list is empty. Try generating some words!</p>
      </div>
    );
  }

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Your Collection ({words.length})</h2>
      {words.map((word) => (
        <div key={word.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start justify-between group">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-lg font-bold text-slate-800">{word.term}</h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase">{word.partOfSpeech}</span>
              <button onClick={() => speak(word.term)} className="text-slate-400 hover:text-indigo-500 transition-colors"><Volume2 size={14}/></button>
            </div>
            <p className="text-slate-600 mb-2">{word.definition}</p>
            <p className="text-sm text-slate-400 italic border-l-2 border-indigo-100 pl-3">"{word.exampleSentence}"</p>
          </div>
          
          <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onDelete(word.id)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete word"
            >
              <Trash2 size={18} />
            </button>
            {word.learned && (
               <div className="p-2 text-green-500 bg-green-50 rounded-lg flex justify-center" title="Learned">
                  <Check size={18} />
               </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WordList;