// backend/config/gemini.js
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in environment variables.');
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AI_SYSTEM_PROMPT = `You are an expert educational content creator and pedagogical specialist. Your goal is to convert complex notes or broad study topics into clear, highly effective flashcards and multiple-choice questions for active recall. Ensure answers are concise, precise, and educational.`;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

