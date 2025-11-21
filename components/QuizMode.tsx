import React, { useState, useEffect } from 'react';
import { Word, QuizQuestion } from '../types';
import { generateQuizFromWords } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, Trophy, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface QuizModeProps {
  words: Word[];
  onComplete: (score: number, total: number) => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ words, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initQuiz = async () => {
      if (words.length < 3) {
        setError("Need at least 3 words to generate a quiz.");
        return;
      }
      setIsLoading(true);
      try {
        const generatedQuestions = await generateQuizFromWords(words);
        setQuestions(generatedQuestions);
      } catch (e) {
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Calculate final score inclusion logic for the last question
      const finalScore = score + (selectedOption === questions[currentQuestionIndex].correctAnswerIndex ? 0 : 0);
      onComplete(finalScore, questions.length);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-slate-600 text-lg">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">AI is crafting your quiz...</p>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const data = [
      { name: 'Correct', value: score, color: '#4f46e5' },
      { name: 'Incorrect', value: questions.length - score, color: '#cbd5e1' },
    ];

    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto text-center border border-slate-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-6">
          <Trophy size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">You scored {score} out of {questions.length}</p>

        <div className="h-64 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <p className="text-4xl font-black text-indigo-600 mb-8">{percentage}%</p>

        <button 
          onClick={() => window.location.reload()} // Simple reset for demo
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          Back to Study
        </button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">Question {currentQuestionIndex + 1}/{questions.length}</span>
        <span className="text-xs font-bold text-slate-400">Score: {score}</span>
      </div>
      
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">{currentQ.question}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let btnClass = "w-full p-4 rounded-xl text-left font-medium border-2 transition-all duration-200 ";
            
            if (isAnswered) {
              if (idx === currentQ.correctAnswerIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-700";
              } else if (idx === selectedOption) {
                btnClass += "border-red-200 bg-red-50 text-red-700";
              } else {
                btnClass += "border-transparent bg-slate-50 text-slate-400 opacity-50";
              }
            } else {
              btnClass += "border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && idx === currentQ.correctAnswerIndex && <CheckCircle2 size={20} className="text-green-600" />}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctAnswerIndex && <XCircle size={20} className="text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 text-blue-800 text-sm">
            <span className="font-bold mr-1">Explanation:</span> {currentQ.explanation}
          </div>
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizMode;