// frontend/src/lib/api.js
import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DEMO_STORAGE_KEY = 'neurorecall_demo_state_v2';

/**
 * Initial curated seed data for Sandbox/Demo mode when Supabase/Gemini .env keys
 * have not yet been populated by the developer.
 */
function getInitialDemoState() {
  const existing = localStorage.getItem(DEMO_STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // reset if corrupted
    }
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);

  const initialState = {
    decks: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        user_id: 'demo-user-id',
        title: 'Trees, Graphs & Dynamic Programming',
        topic: 'Binary Search Trees, AVL balancing, Dijkstra shortest path, and DP memoization vs tabulation',
        category: 'DSA',
        difficulty_level: 'Medium',
        source_type: 'notes',
        created_at: twoDaysAgo.toISOString(),
        flashcards: [
          {
            id: 'fc-101',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question: 'What is the time complexity of searching, inserting, and deleting in a balanced Binary Search Tree (e.g., AVL or Red-Black Tree)?',
            answer:
              'O(log n) in both average and worst cases because self-balancing rotations maintain tree height at O(log n). In an unbalanced skewed BST, worst-case degrades to O(n).',
            difficulty_status: 'easy',
            created_at: twoDaysAgo.toISOString(),
          },
          {
            id: 'fc-102',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question: 'Why does Dijkstra’s algorithm fail on graphs with negative edge weights?',
            answer: 'Dijkstra greedily locks in the shortest distance to a visited vertex assuming adding future edges can only increase path cost. Negative edges violate this monotonicity invariant; Bellman-Ford handles negative weights in O(V·E).',
            difficulty_status: 'easy',
            created_at: twoDaysAgo.toISOString(),
          },
          {
            id: 'fc-103',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question: 'What are the two fundamental properties required for a problem to be solved using Dynamic Programming?',
            answer:
              '1. Optimal Substructure (an optimal solution can be constructed from optimal solutions of its subproblems) and 2. Overlapping Subproblems (the same subproblems are solved repeatedly).',
            difficulty_status: 'difficult',
            created_at: twoDaysAgo.toISOString(),
          },
          {
            id: 'fc-104',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question: 'Compare Top-Down Memoization vs. Bottom-Up Tabulation in Dynamic Programming.',
            answer:
              'Memoization uses recursion + a hash map/array cache to compute only needed states on demand (may incur recursion stack overhead O(n)). Tabulation iteratively fills a DP table from base cases upward, avoiding call-stack overhead and often enabling space optimization.',
            difficulty_status: 'difficult',
            created_at: twoDaysAgo.toISOString(),
          },
          {
            id: 'fc-105',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question: 'Which traversal of a Binary Search Tree (BST) visits nodes in non-decreasing sorted order?',
            answer:
              'In-order traversal (Left Subtree → Root → Right Subtree) visits all keys in sorted ascending order in O(n) time.',
            difficulty_status: 'unmarked',
            created_at: twoDaysAgo.toISOString(),
          },
        ],
        quiz_questions: [
          {
            id: 'qq-101',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question:
              'What is the worst-case time complexity of Dijkstra’s shortest path algorithm using a binary min-heap priority queue and adjacency list?',
            options: [
              'O(V + E)',
              'O((V + E) log V)',
              'O(V² · E)',
              'O(V log E)',
            ],
            correct_option_index: 1,
            explanation:
              'Each of the V vertices is extracted from the min-heap in O(log V), and each of the E edges can trigger a decrease-key/push in O(log V), yielding O((V + E) log V).',
          },
          {
            id: 'qq-102',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question:
              'Which data structure is used internally by Breadth-First Search (BFS) to traverse a graph level by level?',
            options: [
              'Stack (LIFO)',
              'FIFO Queue',
              'Disjoint Set Union (DSU)',
              'AVL Tree',
            ],
            correct_option_index: 1,
            explanation:
              'BFS explores vertices in concentric layers of distance from the source using a First-In-First-Out (FIFO) Queue.',
          },
          {
            id: 'qq-103',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question:
              'Topological sorting is only possible on which class of graphs?',
            options: [
              'Undirected Connected Graphs',
              'Directed Acyclic Graphs (DAGs)',
              'Complete Bipartite Graphs',
              'Weighted Cyclic Graphs',
            ],
            correct_option_index: 1,
            explanation:
              'A topological ordering requires no directed cycles; therefore, the graph must be a Directed Acyclic Graph (DAG).',
          },
          {
            id: 'qq-104',
            deck_id: '11111111-1111-4111-8111-111111111111',
            question:
              'What is the time and space complexity of the standard 0/1 Knapsack problem with N items and capacity W using bottom-up DP?',
            options: [
              'O(2^N) time, O(1) space',
              'O(N · W) time, O(W) optimized space',
              'O(N log N) time, O(N) space',
              'O(W²) time, O(N²) space',
            ],
            correct_option_index: 1,
            explanation:
              'Iterating over N items and capacities from W down to item weight takes O(N · W) time and only requires a 1D array of size O(W).',
          },
        ],
        quiz_attempts: [
          {
            id: 'att-101',
            user_id: 'demo-user-id',
            deck_id: '11111111-1111-4111-8111-111111111111',
            score: 3,
            total_questions: 4,
            completed_at: yesterday.toISOString(),
          },
          {
            id: 'att-102',
            user_id: 'demo-user-id',
            deck_id: '11111111-1111-4111-8111-111111111111',
            score: 4,
            total_questions: 4,
            completed_at: now.toISOString(),
          },
        ],
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        user_id: 'demo-user-id',
        title: 'Operating Systems & Concurrency',
        topic: 'Processes vs threads, CPU scheduling, Coffman deadlock conditions, and virtual memory paging',
        category: 'Computer Science',
        difficulty_level: 'Hard',
        source_type: 'topic',
        created_at: yesterday.toISOString(),
        flashcards: [
          {
            id: 'fc-201',
            deck_id: '22222222-2222-4222-8222-222222222222',
            question: 'What are the four necessary Coffman conditions for a Deadlock to occur?',
            answer:
              '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait. Breaking any one of these four prevents deadlock.',
            difficulty_status: 'easy',
            created_at: yesterday.toISOString(),
          },
          {
            id: 'fc-202',
            deck_id: '22222222-2222-4222-8222-222222222222',
            question: 'What is the purpose of the Translation Lookaside Buffer (TLB) in virtual memory?',
            answer:
              'The TLB is a fast hardware associative cache inside the MMU that stores recent virtual-to-physical page translations, avoiding slow multi-level page table walks in RAM.',
            difficulty_status: 'easy',
            created_at: yesterday.toISOString(),
          },
          {
            id: 'fc-203',
            deck_id: '22222222-2222-4222-8222-222222222222',
            question: 'What is Thrashing in an Operating System?',
            answer:
              'A state where the system spends more time swapping pages between RAM and disk (handling page faults) than executing actual CPU instructions because the working set exceeds physical memory.',
            difficulty_status: 'difficult',
            created_at: yesterday.toISOString(),
          },
        ],
        quiz_questions: [
          {
            id: 'qq-201',
            deck_id: '22222222-2222-4222-8222-222222222222',
            question:
              'Which memory segments are shared among threads belonging to the same process?',
            options: [
              'Stack and Program Counter',
              'Code, Data, Heap, and Open File Descriptors',
              'CPU General-Purpose Registers only',
              'Thread Control Blocks (TCBs)',
            ],
            correct_option_index: 1,
            explanation:
              'Threads of the same process share the address space (Code/Text, Global Data, Heap, and open files), while each thread has its own private Stack, Registers, and Program Counter.',
          },
          {
            id: 'qq-202',
            deck_id: '22222222-2222-4222-8222-222222222222',
            question:
              'Which page replacement algorithm suffers from Belady’s Anomaly (increasing page frames can increase page faults)?',
            options: [
              'First-In, First-Out (FIFO)',
              'Least Recently Used (LRU)',
              'Optimal Page Replacement (OPT)',
              'Least Frequently Used (LFU)',
            ],
            correct_option_index: 0,
            explanation:
              'FIFO is not a stack algorithm and can exhibit Belady’s Anomaly, whereas LRU and OPT are stack algorithms that never suffer from Belady’s Anomaly.',
          },
        ],
        quiz_attempts: [
          {
            id: 'att-201',
            user_id: 'demo-user-id',
            deck_id: '22222222-2222-4222-8222-222222222222',
            score: 1,
            total_questions: 2,
            completed_at: yesterday.toISOString(),
          },
        ],
      },
    ],
  };

  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
}

function saveDemoState(state) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

function computeDemoDeckStats(deck) {
  const flashcards = deck.flashcards || [];
  const quizQuestions = deck.quiz_questions || [];
  const quizAttempts = deck.quiz_attempts || [];

  const totalCards = flashcards.length;
  const easyCards = flashcards.filter((c) => c.difficulty_status === 'easy').length;
  const difficultCards = flashcards.filter((c) => c.difficulty_status === 'difficult').length;
  const unmarkedCards = flashcards.filter((c) => c.difficulty_status === 'unmarked').length;
  const totalQuizzes = quizQuestions.length;

  const sortedAttempts = [...quizAttempts].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  const attemptsCount = sortedAttempts.length;
  const latestScorePercent =
    sortedAttempts[0] && sortedAttempts[0].total_questions > 0
      ? Math.round((sortedAttempts[0].score / sortedAttempts[0].total_questions) * 100)
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
 * Generates realistic structured flashcards and quizzes locally when running in Demo Mode
 * (without backend Gemini/Supabase keys).
 */
function generateDemoDeckFromInput(payload) {
  const {
    sourceType,
    content,
    cardCount = 10,
    quizCount = 5,
    difficultyLevel = 'Medium',
    category = 'Computer Science',
    contentType = 'Conceptual Summaries',
    outputMode = 'both',
  } = payload;

  const deckId = crypto.randomUUID
    ? crypto.randomUUID()
    : `deck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const cleanTopic =
    sourceType === 'topic'
      ? content.trim()
      : content
          .trim()
          .split(/[\n.!?]/)[0]
          .slice(0, 65) || 'Study Notes Revision Set';

  const title =
    sourceType === 'topic'
      ? `${cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1)} (${difficultyLevel})`
      : `${cleanTopic} — Active Recall Deck`;

  const sentences = content
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const effectiveCards = outputMode === 'quiz' ? 0 : Number(cardCount) || 5;
  const effectiveQuizzes = outputMode === 'flashcards' ? 0 : Number(quizCount) || 5;

  const flashcards = Array.from({ length: effectiveCards }, (_, idx) => {
    const contextFact =
      sentences[idx % Math.max(sentences.length, 1)] ||
      `Key principles and mechanisms of ${cleanTopic} within ${category} (${contentType}).`;

    const prompts = [
      `What is the primary concept and definition of Principle #${idx + 1} in ${cleanTopic}?`,
      `How does the core mechanism of ${cleanTopic} operate under ${difficultyLevel} analysis (Concept ${idx + 1})?`,
      `Why is ${cleanTopic} critical in the context of ${category} (${contentType} #${idx + 1})?`,
      `Distinguish the primary characteristics and applications of ${cleanTopic} (Part ${idx + 1}).`,
      `What cause-and-effect relationship governs ${cleanTopic} in scenario #${idx + 1}?`,
    ];

    return {
      id: `fc-${Date.now()}-${idx}`,
      deck_id: deckId,
      question: prompts[idx % prompts.length],
      answer:
        sourceType === 'notes'
          ? contextFact
          : `${contextFact} Specifically, this governs how key variables interact, stabilize, and produce measurable outcomes in ${category}.`,
      difficulty_status: 'unmarked',
      created_at: new Date().toISOString(),
    };
  });

  const quizQuestions = Array.from({ length: effectiveQuizzes }, (_, idx) => {
    const refSentence =
      sentences[idx % Math.max(sentences.length, 1)] ||
      `Core analytical principle #${idx + 1} of ${cleanTopic} in ${category}`;

    const correctIdx = idx % 4;
    const options = [
      'It only applies in isolated theoretical vacuums without feedback loops.',
      'It eliminates the need for empirical verification or boundary conditions.',
      'It reverses the foundational equilibrium constant irrespective of input.',
      'It is strictly unrelated to structural or functional synthesis.',
    ];
    options[correctIdx] =
      refSentence.length > 120 ? refSentence.slice(0, 117) + '...' : refSentence;

    return {
      id: `qq-${Date.now()}-${idx}`,
      deck_id: deckId,
      question: `Question ${idx + 1}: Regarding ${cleanTopic} (${category}), which statement most accurately describes its ${contentType.toLowerCase()}?`,
      options,
      correct_option_index: correctIdx,
      explanation: `Option ${String.fromCharCode(65 + correctIdx)} directly reflects the core principle of ${cleanTopic}: "${options[correctIdx]}".`,
      created_at: new Date().toISOString(),
    };
  });

  return {
    id: deckId,
    user_id: 'demo-user-id',
    title,
    topic: cleanTopic.slice(0, 255),
    category,
    difficulty_level: difficultyLevel,
    source_type: sourceType,
    created_at: new Date().toISOString(),
    flashcards,
    quiz_questions: quizQuestions,
    quiz_attempts: [],
  };
}

/**
 * Helper to retrieve active JWT token from Supabase session
 */
async function getAuthHeaders() {
  if (!isSupabaseConfigured || !supabase) {
    return { 'Content-Type': 'application/json' };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

function isDemoSessionActive() {
  return localStorage.getItem('neurorecall_demo_mode') === 'true' || !isSupabaseConfigured;
}

/**
 * Unified API Service supporting both live Express + Supabase + Gemini backend
 * and interactive Sandbox Demo mode.
 */
export const api = {
  /**
   * POST /api/generate
   */
  async generateRevisionSet(payload) {
    if (isDemoSessionActive()) {
      await new Promise((r) => setTimeout(r, 900));
      const state = getInitialDemoState();
      const newDeck = generateDemoDeckFromInput(payload);
      state.decks.unshift(newDeck);
      saveDemoState(state);
      return {
        message: 'Revision set generated in Demo Mode.',
        deck: computeDemoDeckStats(newDeck),
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to generate revision set.');
    }
    return data;
  },

  /**
   * GET /api/decks
   */
  async getDecks() {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      return {
        decks: state.decks.map((d) => computeDemoDeckStats(d)),
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/decks`, { headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch decks.');
    }
    return data;
  },

  /**
   * GET /api/decks/:id
   */
  async getDeckById(deckId) {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      const found = state.decks.find((d) => d.id === deckId);
      if (!found) {
        throw new Error('Deck not found.');
      }
      return { deck: computeDemoDeckStats(found) };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, { headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch deck.');
    }
    return data;
  },

  /**
   * PATCH /api/decks/:id
   */
  async updateDeck(deckId, payload) {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      const idx = state.decks.findIndex((d) => d.id === deckId);
      if (idx === -1) throw new Error('Deck not found.');
      state.decks[idx] = {
        ...state.decks[idx],
        title: payload.title ?? state.decks[idx].title,
        topic: payload.topic ?? state.decks[idx].topic,
      };
      saveDemoState(state);
      return { deck: computeDemoDeckStats(state.decks[idx]) };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to update deck.');
    }
    return data;
  },

  /**
   * DELETE /api/decks/:id
   */
  async deleteDeck(deckId) {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      state.decks = state.decks.filter((d) => d.id !== deckId);
      saveDemoState(state);
      return { id: deckId };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to delete deck.');
    }
    return data;
  },

  /**
   * PATCH /api/flashcards/:id/difficulty
   */
  async updateFlashcardDifficulty(cardId, difficultyStatus) {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      let updatedCard = null;
      for (const deck of state.decks) {
        const card = (deck.flashcards || []).find((c) => c.id === cardId);
        if (card) {
          card.difficulty_status = difficultyStatus;
          updatedCard = { ...card };
          break;
        }
      }
      saveDemoState(state);
      return { flashcard: updatedCard };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/flashcards/${cardId}/difficulty`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ difficulty_status: difficultyStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to update card difficulty.');
    }
    return data;
  },

  /**
   * POST /api/quiz/submit
   */
  async submitQuizAttempt(payload) {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      const deck = state.decks.find((d) => d.id === payload.deck_id);
      if (!deck) throw new Error('Deck not found.');

      const attempt = {
        id: `att-${Date.now()}`,
        user_id: 'demo-user-id',
        deck_id: payload.deck_id,
        score: payload.score,
        total_questions: payload.total_questions,
        time_spent_seconds: payload.time_spent_seconds || 0,
        completed_at: new Date().toISOString(),
      };
      deck.quiz_attempts = [attempt, ...(deck.quiz_attempts || [])];
      saveDemoState(state);

      const percentage = Math.round((payload.score / payload.total_questions) * 100);
      const bestPercentage = Math.max(
        ...deck.quiz_attempts.map((a) =>
          a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0
        )
      );

      return {
        attempt,
        analytics: {
          percentage,
          bestPercentage,
          totalAttemptsForDeck: deck.quiz_attempts.length,
          history: deck.quiz_attempts,
        },
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to submit quiz score.');
    }
    return data;
  },

  /**
   * GET /api/analytics
   */
  async getAnalytics() {
    if (isDemoSessionActive()) {
      const state = getInitialDemoState();
      const safeDecks = state.decks || [];

      let totalCards = 0;
      let easyCount = 0;
      let difficultCount = 0;
      let unmarkedCount = 0;
      let totalQuizQuestions = 0;
      const allAttempts = [];

      safeDecks.forEach((deck) => {
        const cards = deck.flashcards || [];
        totalCards += cards.length;
        totalQuizQuestions += (deck.quiz_questions || []).length;

        cards.forEach((c) => {
          if (c.difficulty_status === 'easy') easyCount += 1;
          else if (c.difficulty_status === 'difficult') difficultCount += 1;
          else unmarkedCount += 1;
        });

        (deck.quiz_attempts || []).forEach((att) => {
          allAttempts.push({
            ...att,
            deckTitle: deck.title,
          });
        });
      });

      allAttempts.sort(
        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
      );

      const scoreHistory = allAttempts.map((a, idx) => ({
        id: a.id,
        attemptNumber: idx + 1,
        deckId: a.deck_id,
        deckTitle: a.deckTitle,
        score: a.score,
        totalQuestions: a.total_questions,
        percentage:
          a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0,
        completedAt: a.completed_at,
      }));

      const averageQuizPercentage =
        scoreHistory.length > 0
          ? Math.round(
              scoreHistory.reduce((s, item) => s + item.percentage, 0) / scoreHistory.length
            )
          : 0;

      const cardMasteryPercentage =
        totalCards > 0 ? Math.round((easyCount / totalCards) * 100) : 0;

      const overallMasteryPercentage =
        totalCards > 0 && scoreHistory.length > 0
          ? Math.round(cardMasteryPercentage * 0.5 + averageQuizPercentage * 0.5)
          : totalCards > 0
          ? cardMasteryPercentage
          : averageQuizPercentage;

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
        return {
          id: deck.id,
          title: deck.title,
          topic: deck.topic,
          sourceType: deck.source_type,
          totalCards: cards.length,
          easyCount: deckEasy,
          difficultCount: deckDifficult,
          unmarkedCount: deckUnmarked,
          cardMastery: cards.length > 0 ? Math.round((deckEasy / cards.length) * 100) : 0,
          bestQuizScore,
          attemptsCount: deckAttempts.length,
          createdAt: deck.created_at,
        };
      });

      return {
        overview: {
          totalDecks: safeDecks.length,
          totalCards,
          totalQuizQuestions,
          totalQuizAttempts: scoreHistory.length,
          overallMasteryPercentage,
          cardMasteryPercentage,
          averageQuizPercentage,
          studyStreakDays: 3,
        },
        difficultyDistribution: {
          easy: easyCount,
          difficult: difficultCount,
          unmarked: unmarkedCount,
        },
        scoreHistory,
        deckBreakdown,
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/analytics`, { headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch analytics.');
    }
    return data;
  },
};

