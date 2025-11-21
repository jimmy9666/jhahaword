import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Word, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateWordListByTopic = async (topic: string, count: number = 5): Promise<Word[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        term: { type: Type.STRING },
        definition: { type: Type.STRING },
        partOfSpeech: { type: Type.STRING },
        exampleSentence: { type: Type.STRING },
        pronunciation: { type: Type.STRING, description: "IPA pronunciation or phonetic spelling" }
      },
      required: ["term", "definition", "partOfSpeech", "exampleSentence"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a vocabulary list of ${count} English words related to the topic: "${topic}". Provide definitions in Traditional Chinese (Taiwan usage) and example sentences in English.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert language tutor. Generate accurate, useful vocabulary suitable for an intermediate learner.",
      },
    });

    const rawWords = JSON.parse(response.text || "[]");
    
    return rawWords.map((w: any) => ({
      ...w,
      id: crypto.randomUUID(), // Add client-side ID
      learned: false
    }));
  } catch (error) {
    console.error("Error generating word list:", error);
    throw new Error("Failed to generate words. Please try again.");
  }
};

export const generateWordDetails = async (term: string): Promise<Word> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      term: { type: Type.STRING },
      definition: { type: Type.STRING },
      partOfSpeech: { type: Type.STRING },
      exampleSentence: { type: Type.STRING },
      pronunciation: { type: Type.STRING, description: "IPA pronunciation or phonetic spelling" }
    },
    required: ["term", "definition", "partOfSpeech", "exampleSentence"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide detailed vocabulary information for the English word: "${term}". 
      1. Definition should be in Traditional Chinese (Taiwan usage).
      2. Part of speech (e.g., Noun, Verb, Adjective).
      3. A clear, simple example sentence in English.
      4. IPA pronunciation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert dictionary assistant. Provide accurate definitions and natural examples.",
      },
    });

    const rawWord = JSON.parse(response.text || "{}");
    
    return {
      ...rawWord,
      id: crypto.randomUUID(),
      learned: false
    };
  } catch (error) {
    console.error("Error generating word details:", error);
    throw new Error("Failed to find word details. Please check the spelling.");
  }
};

export const generateQuizFromWords = async (words: Word[]): Promise<QuizQuestion[]> => {
  // We pick a subset of words to quiz on to save context window if list is huge
  const wordsToQuiz = words.slice(0, 10); 
  const wordListString = wordsToQuiz.map(w => `${w.term}: ${w.definition}`).join(", ");

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "4 multiple choice options"
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "0-3 index of correct option" },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a multiple-choice quiz based on these words: ${wordListString}. Create 5 questions. Questions can ask for definitions, synonyms, or fill-in-the-blank.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz.");
  }
};
