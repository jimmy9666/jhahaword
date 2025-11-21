export interface Word {
  id: string;
  term: string;
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
  pronunciation?: string;
  learned?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ',
  LIST = 'LIST',
  GENERATE = 'GENERATE'
}

export interface DailyStats {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  quizCorrect: number;
  quizTotal: number;
}

export interface LearningStats {
  wordsLearned: number;
  quizScoreHistory: { date: string; score: number }[];
}