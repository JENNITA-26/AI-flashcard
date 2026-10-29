// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Layers,
  CheckCircle2,
  Flame,
  Trophy,
  Sparkles,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import DeckCard from '../components/DeckCard';

export default function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [decksRes, analyticsRes] = await Promise.all([
        api.getDecks(),
        api.getAnalytics(),
      ]);
      setDecks(decksRes.decks || []);
      setAnalyticsOverview(analyticsRes.overview || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRenameDeck = async (deckId, newTitle) => {
    await api.updateDeck(deckId, { title: newTitle });
    setDecks((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, title: newTitle } : d))
    );
  };

  const handleDeleteDeck = async (deckId) => {
    try {
      await api.deleteDeck(deckId);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch (err) {
      setError(err.message || 'Failed to delete deck.');
    }
  };

  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch =
        !searchQuery.trim() ||
        deck.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        sourceFilter === 'all' || deck.source_type === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [decks, searchQuery, sourceFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 md:flex-row md:items-center shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Active Recall Command Center</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Your Study Decks & Mastery Hub
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Generate AI flashcards and multiple-choice revision quizzes from any topic or lecture notes, flag difficult concepts, and track long-term retention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:text-white"
          >
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>View Analytics</span>
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Revision Set</span>
          </Link>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saved Decks
            </span>
            <div className="rounded-xl bg-indigo-500/15 p-2.5 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {decks.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {analyticsOverview?.totalCards ?? 0} total flashcards generated
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overall Mastery
            </span>
            <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-300">
            {analyticsOverview?.overallMasteryPercentage ?? 0}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Combined card confidence & quiz accuracy
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Quiz Score
            </span>
            <div className="rounded-xl bg-violet-500/15 p-2.5 text-violet-400">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-violet-300">
            {analyticsOverview?.averageQuizPercentage ?? 0}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Across {analyticsOverview?.totalQuizAttempts ?? 0} completed quiz attempts
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Study Streak
            </span>
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-300">
            {analyticsOverview?.studyStreakDays ?? 0}{' '}
            <span className="text-base font-semibold text-slate-400">days</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Consistent active recall momentum
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks by title, topic, or subject..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Decks' },
            { id: 'topic', label: 'Topic AI' },
            { id: 'notes', label: 'Study Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                sourceFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decks Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50 p-6"
            />
          ))}
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            {decks.length === 0
              ? 'No revision decks created yet'
              : 'No decks match your current filter'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            {decks.length === 0
              ? 'Enter a study topic or paste your lecture notes to let Gemini AI generate flashcards and a multiple-choice quiz in seconds.'
              : 'Try clearing your search query or switching source filters.'}
          </p>
          {decks.length === 0 && (
            <Link
              to="/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your First Deck</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onRename={handleRenameDeck}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}
    </div>
  );
}

