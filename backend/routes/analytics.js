// backend/routes/analytics.js
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Computes study streak in consecutive days based on deck creation and quiz attempt dates.
 */
function calculateStudyStreak(dates = []) {
  if (!dates.length) return 0;

  const uniqueDayStrings = Array.from(
    new Set(
      dates
        .filter(Boolean)
        .map((d) => new Date(d).toISOString().split('T')[0])
    )
  ).sort((a, b) => (a > b ? -1 : 1));

  if (uniqueDayStrings.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If user neither studied today nor yesterday, active streak is 0 (or 1 if they have activity today)
  if (uniqueDayStrings[0] !== todayStr && uniqueDayStrings[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDay = new Date(uniqueDayStrings[0] + 'T00:00:00Z');

  for (let i = 1; i < uniqueDayStrings.length; i++) {
    const prevDay = new Date(currentDay);
    prevDay.setUTCDate(prevDay.getUTCDate() - 1);
    const expectedPrevStr = prevDay.toISOString().split('T')[0];

    if (uniqueDayStrings[i] === expectedPrevStr) {
      streak += 1;
      currentDay = prevDay;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * GET /api/analytics
 * Fetches aggregate mastery percentage, card difficulty distribution,
 * study streak, and quiz score history for the authenticated user.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's decks with flashcards
    const { data: decks, error: decksError } = await supabaseAdmin
      .from('decks')
      .select(
        `
        id,
        title,
        topic,
        source_type,
        created_at,
        flashcards ( id, difficulty_status, created_at ),
        quiz_questions ( id )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (decksError) {
      console.error('[GET /api/analytics Decks Error]:', decksError);
      return res.status(500).json({
        error: 'Database Error',
        message: decksError.message || 'Failed to load analytics decks.',
      });
    }

    // 2. Fetch user's quiz attempts with deck title
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('quiz_attempts')
      .select(
        `
        id,
        deck_id,
        score,
        total_questions,
        completed_at,
        decks ( title )
      `
      )
      .eq('user_id', userId)
      .order('completed_at', { ascending: true });

    if (attemptsError) {
      console.error('[GET /api/analytics Attempts Error]:', attemptsError);
      return res.status(500).json({
        error: 'Database Error',
        message: attemptsError.message || 'Failed to load quiz attempts.',
      });
    }

    const safeDecks = decks || [];
    const safeAttempts = attempts || [];

    // Aggregate flashcard counts and difficulty breakdown
    let totalCards = 0;
    let easyCount = 0;
    let difficultCount = 0;
    let unmarkedCount = 0;
    let totalQuizQuestions = 0;

    safeDecks.forEach((deck) => {
      const cards = deck.flashcards || [];
      totalCards += cards.length;
      totalQuizQuestions += (deck.quiz_questions || []).length;

      cards.forEach((c) => {
        if (c.difficulty_status === 'easy') easyCount += 1;
        else if (c.difficulty_status === 'difficult') difficultCount += 1;
        else unmarkedCount += 1;
      });
    });

    // Aggregate quiz score history & average quiz score
    const scoreHistory = safeAttempts.map((a, index) => {
      const percentage =
        a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0;
      return {
        id: a.id,
        attemptNumber: index + 1,
        deckId: a.deck_id,
        deckTitle: a.decks?.title || 'Revision Deck',
        score: a.score,
        totalQuestions: a.total_questions,
        percentage,
        completedAt: a.completed_at,
      };
    });

    const averageQuizPercentage =
      scoreHistory.length > 0
        ? Math.round(
            scoreHistory.reduce((sum, item) => sum + item.percentage, 0) /
              scoreHistory.length
          )
        : 0;

    const cardMasteryPercentage =
      totalCards > 0 ? Math.round((easyCount / totalCards) * 100) : 0;

    let overallMasteryPercentage = 0;
    if (totalCards > 0 && scoreHistory.length > 0) {
      overallMasteryPercentage = Math.round(
        cardMasteryPercentage * 0.5 + averageQuizPercentage * 0.5
      );
    } else if (totalCards > 0) {
      overallMasteryPercentage = cardMasteryPercentage;
    } else if (scoreHistory.length > 0) {
      overallMasteryPercentage = averageQuizPercentage;
    }

    // Study streak calculation
    const activityTimestamps = [
      ...safeDecks.map((d) => d.created_at),
      ...safeAttempts.map((a) => a.completed_at),
    ];
    const studyStreakDays = calculateStudyStreak(activityTimestamps);

    // Deck-level mastery breakdown
    const deckBreakdown = safeDecks.map((deck) => {
      const cards = deck.flashcards || [];
      const deckEasy = cards.filter((c) => c.difficulty_status === 'easy').length;
      const deckDifficult = cards.filter((c) => c.difficulty_status === 'difficult').length;
      const deckUnmarked = cards.filter((c) => c.difficulty_status === 'unmarked').length;
      const deckAttempts = scoreHistory.filter((a) => a.deckId === deck.id);
      const bestQuizScore =
        deckAttempts.length > 0
          ? Math.max(...deckAttempts.map((a) => a.percentage))
          : null;
      const cardMastery = cards.length > 0 ? Math.round((deckEasy / cards.length) * 100) : 0;

      return {
        id: deck.id,
        title: deck.title,
        topic: deck.topic,
        sourceType: deck.source_type,
        totalCards: cards.length,
        easyCount: deckEasy,
        difficultCount: deckDifficult,
        unmarkedCount: deckUnmarked,
        cardMastery,
        bestQuizScore,
        attemptsCount: deckAttempts.length,
        createdAt: deck.created_at,
      };
    });

    return res.json({
      overview: {
        totalDecks: safeDecks.length,
        totalCards,
        totalQuizQuestions,
        totalQuizAttempts: scoreHistory.length,
        overallMasteryPercentage,
        cardMasteryPercentage,
        averageQuizPercentage,
        studyStreakDays,
      },
      difficultyDistribution: {
        easy: easyCount,
        difficult: difficultCount,
        unmarked: unmarkedCount,
      },
      scoreHistory,
      deckBreakdown,
    });
  } catch (err) {
    console.error('[GET /api/analytics Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to compute learning analytics.',
    });
  }
});

export default router;

