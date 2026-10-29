// backend/shared/validators.js
import { z } from 'zod';

export const GenerateRequestSchema = z.object({
  sourceType: z.enum(['topic', 'notes']),
  content: z
    .string()
    .min(3, 'Content must be at least 3 characters long')
    .max(10000, 'Content cannot exceed 10,000 characters'),
  cardCount: z.number().int().min(0).max(20).default(10),
  quizCount: z.number().int().min(0).max(20).default(5),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
  category: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .default('Computer Science'),
  contentType: z
    .enum(['Conceptual Summaries', 'Terminology', 'Formulas', 'Problem-Solving MCQs'])
    .optional()
    .default('Conceptual Summaries'),
  outputMode: z.enum(['flashcards', 'quiz', 'both']).optional().default('both'),
});

export const GeminiResponseSchema = z.object({
  title: z.string().min(1),
  flashcards: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ),
  quizQuestions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string()).length(4),
      correctOptionIndex: z.number().int().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

export const UpdateDifficultySchema = z.object({
  difficulty_status: z.enum(['unmarked', 'easy', 'difficult']),
});

export const UpdateDeckSchema = z.object({
  title: z.string().min(1, 'Deck title is required').max(255),
  topic: z.string().max(255).optional(),
  category: z.string().max(100).optional(),
});

export const SubmitQuizSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  score: z.number().int().min(0),
  total_questions: z.number().int().min(1),
  time_spent_seconds: z.number().int().min(0).optional().default(0),
});

