// frontend/src/lib/validators.js
import { z } from 'zod';

export const AuthFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password is too long'),
});

export const CreateDeckFormSchema = z
  .object({
    sourceType: z.enum(['topic', 'notes']),
    content: z
      .string()
      .trim()
      .min(3, 'Input must be at least 3 characters long')
      .max(10000, 'Input cannot exceed 10,000 characters'),
    cardCount: z.enum(['5', '10', '15', '20']).transform(Number),
    difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
    outputMode: z.enum(['flashcards', 'quiz', 'both']),
    category: z.enum([
      'Computer Science',
      'DSA',
      'Web Development',
      'Operating Systems',
      'DBMS & SQL',
      'Computer Networks',
      'System Design',
      'AI & Machine Learning',
    ]),
    contentType: z.enum([
      'Conceptual Summaries',
      'Terminology',
      'Formulas',
      'Problem-Solving MCQs',
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === 'notes' && data.content.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: 'Pasted study notes must be at least 20 characters long (max 10,000 chars).',
      });
    }
  });

export const RenameDeckSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Deck title must be at least 2 characters')
    .max(255, 'Deck title cannot exceed 255 characters'),
});

