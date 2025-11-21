import React, { useState } from 'react';
import { generateWordListByTopic, generateWordDetails } from '../services/geminiService';
import { Word } from '../types';
import { Sparkles, Loader2, Plus, Search, BookA, LayoutGrid } from 'lucide-react';

interface TopicGeneratorProps {
  onWordsAdded: (newWords: Word[]) => void;
}

type Mode = 'topic' | 'single';

const TopicGenerator: React.FC<TopicGeneratorProps> = ({ onWordsAdded }) => {
  const [mode, setMode] = useState<Mode>('topic');
  
  // Inputs
  const [topic, setTopic] = useState('');
  const [singleWord, setSingleWord] = useState('');
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const words = await generateWordListByTopic(topic);
      onWordsAdded(words);
      setTopic('');
    } catch (err) {
      setError("Something went wrong while contacting the AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleWord.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const word = await generateWordDetails(singleWord);
      onWordsAdded([word]); // Wrap in array to reuse the prop
      setSingleWord('');
    } catch (err) {
      setError("Could not find details for this word. Please check spelling.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {/* Tabs */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-6">
        <button
          onClick={() => setMode('topic')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            mode === 'topic' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutGrid size={18} />
          Topic Generator
        </button>
        <button
          onClick={() => setMode('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            mode === 'single' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookA size={18} />
          Word Lookup
        </button>
      </div>

      {mode === 'topic' ? (
        // --- Topic Generator Mode ---
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="text-yellow-300" size={24} />
              </div>
              <h2 className="text-2xl font-bold">AI Vocabulary Builder</h2>
            </div>
            <p className="text-indigo-100 mb-6 max-w-lg">
              Enter a topic (e.g., "Business", "Travel", "Food") and our AI will generate a custom study list for you.
            </p>
            
            <form onSubmit={handleGenerateTopic} className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn about?"
                className="w-full px-6 py-4 pr-36 rounded-2xl text-slate-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400/30 text-lg placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </form>
            {error && <p className="mt-3 text-red-200 text-sm bg-red-500/20 px-3 py-1 rounded inline-block">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Coffee Shop', 'Job Interview', 'Movies'].map((preset) => (
              <button
                key={preset}
                onClick={() => setTopic(preset)}
                className="p-4 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all text-left text-sm font-medium"
              >
                Try "{preset}"
              </button>
            ))}
          </div>
        </div>
      ) : (
        // --- Single Word Mode ---
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Search className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Smart Dictionary</h2>
            </div>
            <p className="text-slate-500 mb-6 max-w-lg">
              Type a single English word. AI will automatically generate the definition, part of speech, and example sentence for you.
            </p>
            
            <form onSubmit={handleGenerateSingle} className="relative">
              <input
                type="text"
                value={singleWord}
                onChange={(e) => setSingleWord(e.target.value)}
                placeholder="Enter an English word (e.g., 'Serendipity')"
                className="w-full px-6 py-4 pr-36 rounded-2xl text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white shadow-inner focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 text-lg placeholder:text-slate-400 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !singleWord.trim()}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                {isLoading ? 'Searching...' : 'Look up'}
              </button>
            </form>
            {error && <p className="mt-3 text-red-600 text-sm bg-red-50 px-3 py-1 rounded inline-block border border-red-100">{error}</p>}
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
             <p className="text-sm">Tip: This is great for adding specific words you encounter while reading.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicGenerator;
