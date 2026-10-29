// backend/routes/decks.js
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import {
  UpdateDifficultySchema,
  UpdateDeckSchema,
  SubmitQuizSchema,
} from '../shared/validators.js';
import { sanitizeUserInput } from '../utils/sanitize.js';

const router = express.Router();

/**
 * Helper to compute deck mastery & progress statistics
 */
function computeDeckProgress(deck, flashcards = [], quizQuestions = [], quizAttempts = []) {
  const totalCards = flashcards.length;
  const easyCards = flashcards.filter((c) => c.difficulty_status === 'easy').length;
  const difficultCards = flashcards.filter((c) => c.difficulty_status === 'difficult').length;
  const unmarkedCards = flashcards.filter((c) => c.difficulty_status === 'unmarked').length;
  const totalQuizzes = quizQuestions.length;

  const sortedAttempts = [...quizAttempts].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  const attemptsCount = sortedAttempts.length;
  const latestAttempt = sortedAttempts[0] || null;
  const latestScorePercent =
    latestAttempt && latestAttempt.total_questions > 0
      ? Math.round((latestAttempt.score / latestAttempt.total_questions) * 100)
      : null;

  const bestScorePercent =
    attemptsCount > 0
      ? Math.max(
          ...sortedAttempts.map((a) =>
            a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0
          )
        )
      : null;

  const cardMasteryRatio = totalCards > 0 ? (easyCards / totalCards) * 100 : null;
  let masteryPercentage = 0;
  if (cardMasteryRatio !== null && bestScorePercent !== null) {
    masteryPercentage = Math.round(cardMasteryRatio * 0.5 + bestScorePercent * 0.5);
  } else if (cardMasteryRatio !== null) {
    masteryPercentage = Math.round(cardMasteryRatio);
  } else if (bestScorePercent !== null) {
    masteryPercentage = bestScorePercent;
  }

  return {
    ...deck,
    stats: {
      totalCards,
      easyCards,
      difficultCards,
      unmarkedCards,
      totalQuizzes,
      attemptsCount,
      latestScorePercent,
      bestScorePercent,
      masteryPercentage,
    },
  };
}

/**
 * GET /api/decks
 * Fetches user's saved decks with progress metadata.
 */
router.get('/decks', requireAuth, async (req, res) => {
  try {
    const { data: decks, error } = await supabaseAdmin
      .from('decks')
      .select(
        `
        *,
        flashcards ( id, difficulty_status ),
        quiz_questions ( id ),
        quiz_attempts ( id, score, total_questions, completed_at )
      `
      )
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/decks Error]:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: error.message || 'Failed to fetch user decks.',
      });
    }

    const enrichedDecks = (decks || []).map((deck) => {
      const { flashcards, quiz_questions, quiz_attempts, ...deckFields } = deck;
      return computeDeckProgress(
        deckFields,
        flashcards || [],
        quiz_questions || [],
        quiz_attempts || []
      );
    });

    return res.json({ decks: enrichedDecks });
  } catch (err) {
    console.error('[GET /api/decks Unexpected Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to load decks.',
    });
  }
});

/**
 * GET /api/decks/:id
 * Fetches a single deck with all flashcards, quiz_questions, and quiz_attempts.
 */
router.get('/decks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deck, error } = await supabaseAdmin
      .from('decks')
      .select(
        `
        *,
        flashcards ( * ),
        quiz_questions ( * ),
        quiz_attempts ( * )
      `
      )
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !deck) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Deck not found or you do not have access to it.',
      });
    }

    // Sort flashcards and quiz questions in creation order
    const flashcards = (deck.flashcards || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const quizQuestions = (deck.quiz_questions || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const quizAttempts = (deck.quiz_attempts || []).sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    const enriched = computeDeckProgress(deck, flashcards, quizQuestions, quizAttempts);

    return res.json({
      deck: {
        ...enriched,
        flashcards,
        quiz_questions: quizQuestions,
        quiz_attempts: quizAttempts,
      },
    });
  } catch (err) {
    console.error('[GET /api/decks/:id Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch deck details.',
    });
  }
});

/**
 * PATCH /api/decks/:id
 * Renames or updates a saved deck.
 */
router.patch('/decks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = UpdateDeckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updatePayload = {
      title: sanitizeUserInput(parsed.data.title).slice(0, 255),
    };
    if (parsed.data.topic !== undefined) {
      updatePayload.topic = sanitizeUserInput(parsed.data.topic).slice(0, 255);
    }

    const { data, error } = await supabaseAdmin
      .from('decks')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: 'Update Failed',
        message: error?.message || 'Deck not found or unauthorized.',
      });
    }

    return res.json({
      message: 'Deck updated successfully.',
      deck: data,
    });
  } catch (err) {
    console.error('[PATCH /api/decks/:id Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update deck.',
    });
  }
});

/**
 * DELETE /api/decks/:id
 * Deletes a user's saved deck (cascades to flashcards, quiz_questions, quiz_attempts).
 */
router.delete('/decks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('decks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({
        error: 'Delete Failed',
        message: error.message || 'Failed to delete deck.',
      });
    }

    return res.json({
      message: 'Deck deleted successfully.',
      id,
    });
  } catch (err) {
    console.error('[DELETE /api/decks/:id Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete deck.',
    });
  }
});

/**
 * PATCH /api/flashcards/:id/difficulty
 * Updates card difficulty ('easy' | 'difficult' | 'unmarked') and persists state in PostgreSQL.
 */
router.patch('/flashcards/:id/difficulty', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = UpdateDifficultySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify flashcard belongs to a deck owned by req.user.id
    const { data: cardRecord, error: lookupError } = await supabaseAdmin
      .from('flashcards')
      .select('id, deck_id, decks!inner(user_id)')
      .eq('id', id)
      .eq('decks.user_id', req.user.id)
      .single();

    if (lookupError || !cardRecord) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flashcard not found or unauthorized.',
      });
    }

    const { data: updatedCard, error: updateError } = await supabaseAdmin
      .from('flashcards')
      .update({ difficulty_status: parsed.data.difficulty_status })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedCard) {
      return res.status(500).json({
        error: 'Database Error',
        message: updateError?.message || 'Failed to update flashcard difficulty.',
      });
    }

    return res.json({
      message: 'Flashcard difficulty updated.',
      flashcard: updatedCard,
    });
  } catch (err) {
    console.error('[PATCH /api/flashcards/:id/difficulty Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update flashcard difficulty.',
    });
  }
});

/**
 * POST /api/quiz/submit
 * Records a completed quiz attempt and returns score analytics.
 */
router.post('/quiz/submit', requireAuth, async (req, res) => {
  try {
    const parsed = SubmitQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { deck_id, score, total_questions } = parsed.data;

    if (score > total_questions) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Score cannot exceed total_questions.',
      });
    }

    // Verify deck ownership
    const { data: deck, error: deckErr } = await supabaseAdmin
      .from('decks')
      .select('id, title')
      .eq('id', deck_id)
      .eq('user_id', req.user.id)
      .single();

    if (deckErr || !deck) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Deck not found or unauthorized.',
      });
    }

    // Insert attempt into quiz_attempts
    const { data: attempt, error: insertError } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: req.user.id,
        deck_id,
        score,
        total_questions,
      })
      .select()
      .single();

    if (insertError || !attempt) {
      return res.status(500).json({
        error: 'Database Error',
        message: insertError?.message || 'Failed to record quiz attempt.',
      });
    }

    // Fetch all attempts for this deck to return comparative analytics
    const { data: allDeckAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id, score, total_questions, completed_at')
      .eq('deck_id', deck_id)
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false });

    const percentage = Math.round((score / total_questions) * 100);
    const bestPercentage =
      allDeckAttempts && allDeckAttempts.length > 0
        ? Math.max(
            ...allDeckAttempts.map((a) =>
              a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0
            )
          )
        : percentage;

    return res.status(201).json({
      message: 'Quiz attempt recorded successfully.',
      attempt,
      analytics: {
        percentage,
        bestPercentage,
        totalAttemptsForDeck: (allDeckAttempts || []).length,
        history: allDeckAttempts || [],
      },
    });
  } catch (err) {
    console.error('[POST /api/quiz/submit Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to submit quiz score.',
    });
  }
});

export default router;

