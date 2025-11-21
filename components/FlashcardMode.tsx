import React, { useState, useCallback, useEffect } from 'react';
import { Word } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle, Volume2 } from 'lucide-react';

interface FlashcardModeProps {
  words: Word[];
  onMarkLearned: (id: string) => void;
  onReview: (id: string) => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ words, onMarkLearned, onReview }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Track reviewed IDs in this session to prevent spamming stats
  const [sessionReviewed, setSessionReviewed] = useState<Set<string>>(new Set());

  const currentWord = words[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  }, [words.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 200);
  }, [words.length]);

  const handleFlip = () => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
    
    // If flipping to back (definition), count as review
    if (newFlipState && currentWord && !sessionReviewed.has(currentWord.id)) {
      onReview(currentWord.id);
      setSessionReviewed(prev => new Set(prev).add(currentWord.id));
    }
  };

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(currentWord.term);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p>No words available to study.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-sm font-medium text-slate-500">
          Card {currentIndex + 1} of {words.length}
        </span>
        <div className="flex gap-2">
             {currentWord.learned && <span className="text-green-500 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">Learned</span>}
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="group w-full h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center backface-hidden">
            <div className="absolute top-4 right-4 text-slate-300">
               <RotateCw size={20} />
            </div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-500 uppercase bg-indigo-50 rounded-full">
              {currentWord.partOfSpeech}
            </span>
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-2">{currentWord.term}</h2>
            {currentWord.pronunciation && (
              <p className="text-slate-400 font-mono text-sm mb-4">{currentWord.pronunciation}</p>
            )}
            <button 
              onClick={speakWord}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-indigo-600"
            >
              <Volume2 size={24} />
            </button>
            <p className="mt-8 text-xs text-slate-400 font-medium">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-indigo-300">{currentWord.definition}</h3>
              <div className="w-12 h-1 bg-slate-600 mx-auto mb-4 rounded-full"></div>
              <p className="text-slate-300 italic text-lg leading-relaxed">"{currentWord.exampleSentence}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full mt-8 px-4">
        <button 
          onClick={handlePrev}
          className="p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button 
          onClick={() => onMarkLearned(currentWord.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-md font-medium transition-all active:scale-95 ${
            currentWord.learned 
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <CheckCircle size={20} />
          {currentWord.learned ? 'Learned' : 'Mark Learned'}
        </button>

        <button 
          onClick={handleNext}
          className="p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardMode;