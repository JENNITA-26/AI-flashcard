// backend/routes/generate.js
import express from 'express';
import { ai, AI_SYSTEM_PROMPT, GEMINI_MODEL } from '../config/gemini.js';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { GenerateRequestSchema, GeminiResponseSchema } from '../shared/validators.js';
import { sanitizeUserInput, extractJsonString } from '../utils/sanitize.js';

const router = express.Router();

/**
 * POST /api/generate
 * Calls Gemini API with user prompt/notes; parses and validates with Zod;
 * inserts deck, flashcards, and quiz_questions into Supabase PostgreSQL.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsedReq = GenerateRequestSchema.safeParse(req.body);
    if (!parsedReq.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parsedReq.error.flatten().fieldErrors,
      });
    }

    const {
      sourceType,
      content: rawContent,
      cardCount,
      quizCount,
      difficultyLevel,
      category,
      contentType,
      outputMode,
    } = parsedReq.data;

    const content = sanitizeUserInput(rawContent);
    if (content.length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Sanitized content must be at least 3 characters long.',
      });
    }

    const effectiveCardCount = outputMode === 'quiz' ? 0 : cardCount;
    const effectiveQuizCount = outputMode === 'flashcards' ? 0 : quizCount;

    if (effectiveCardCount === 0 && effectiveQuizCount === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one flashcard or quiz question must be requested.',
      });
    }

    const prompt = `
Generate a revision set for the following source material:
Source Type: ${sourceType}
Academic Domain: ${category}
Content Focus: ${contentType}
Target Difficulty Level: ${difficultyLevel}
Content: "${content}"
Target Flashcards: ${effectiveCardCount}
Target Quiz Questions: ${effectiveQuizCount}

Respond STRICTLY with JSON matching this structure:
{
  "title": "Short descriptive deck title",
  "flashcards": [
    { "question": "Clear question", "answer": "Concise answer" }
  ],
  "quizQuestions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const rawOutputText = response?.text || '';
    const jsonString = extractJsonString(rawOutputText);

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonString);
    } catch (jsonErr) {
      console.error('[Gemini JSON Parse Error]:', rawOutputText);
      return res.status(502).json({
        error: 'AI Response Error',
        message: 'Gemini returned malformed JSON. Please try generating again.',
      });
    }

    const validatedAiOutput = GeminiResponseSchema.safeParse(parsedJson);
    if (!validatedAiOutput.success) {
      console.error('[Gemini Schema Validation Error]:', validatedAiOutput.error.format());
      return res.status(502).json({
        error: 'AI Schema Validation Failed',
        details: validatedAiOutput.error.flatten(),
      });
    }

    const { title, flashcards, quizQuestions } = validatedAiOutput.data;
    const topicSummary =
      sourceType === 'topic' ? content.slice(0, 255) : title.slice(0, 255);

    // 1. Insert Deck into Supabase
    const { data: deckData, error: deckError } = await supabaseAdmin
      .from('decks')
      .insert({
        user_id: req.user.id,
        title: title.slice(0, 255),
        topic: topicSummary,
        source_type: sourceType,
      })
      .select()
      .single();

    if (deckError || !deckData) {
      console.error('[Supabase Deck Insert Error]:', deckError);
      return res.status(500).json({
        error: 'Database Error',
        message: deckError?.message || 'Failed to save generated deck.',
      });
    }

    // 2. Insert Flashcards if any
    let insertedFlashcards = [];
    if (flashcards.length > 0) {
      const flashcardsPayload = flashcards.map((fc) => ({
        deck_id: deckData.id,
        question: fc.question,
        answer: fc.answer,
        difficulty_status: 'unmarked',
      }));

      const { data: fcData, error: fcError } = await supabaseAdmin
        .from('flashcards')
        .insert(flashcardsPayload)
        .select();

      if (fcError) {
        console.error('[Supabase Flashcards Insert Error]:', fcError);
        return res.status(500).json({
          error: 'Database Error',
          message: fcError.message || 'Failed to save generated flashcards.',
        });
      }
      insertedFlashcards = fcData || [];
    }

    // 3. Insert Quiz Questions if any
    let insertedQuizzes = [];
    if (quizQuestions.length > 0) {
      const quizPayload = quizQuestions.map((qq) => ({
        deck_id: deckData.id,
        question: qq.question,
        options: qq.options,
        correct_option_index: qq.correctOptionIndex,
        explanation: qq.explanation,
      }));

      const { data: qqData, error: qqError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(quizPayload)
        .select();

      if (qqError) {
        console.error('[Supabase Quiz Questions Insert Error]:', qqError);
        return res.status(500).json({
          error: 'Database Error',
          message: qqError.message || 'Failed to save generated quiz questions.',
        });
      }
      insertedQuizzes = qqData || [];
    }

    return res.status(201).json({
      message: 'Revision set generated and saved successfully.',
      deck: {
        ...deckData,
        category,
        difficulty_level: difficultyLevel,
        flashcards: insertedFlashcards,
        quiz_questions: insertedQuizzes,
      },
    });
  } catch (err) {
    console.error('[POST /api/generate Error]:', err);
    return res.status(500).json({
      error: 'Generation Failed',
      message: err?.message || 'An unexpected error occurred during AI generation.',
    });
  }
});

export default router;

