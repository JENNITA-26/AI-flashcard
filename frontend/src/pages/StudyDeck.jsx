// frontend/src/pages/StudyDeck.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import Flashcard from '../components/Flashcard';

export default function StudyDeck() {
  const { id } = useParams();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'difficult' | 'easy' | 'unmarked'
  const [loading, setLoading] = useState(true);
  const [updatingDifficulty, setUpdatingDifficulty] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getDeckById(id);
        setDeck(res.deck);
        setCards(res.deck?.flashcards || []);
      } catch (err) {
        setError(err.message || 'Failed to load study deck.');
      } finally {
        setLoading(false);
      }
    };
    loadDeck();
  }, [id]);

  const filteredCards = useMemo(() => {
    if (filterMode === 'all') return cards;
    return cards.filter((c) => (c.difficulty_status || 'unmarked') === filterMode);
  }, [cards, filterMode]);

  // Keep currentIndex in bounds when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterMode]);

  const currentCard = filteredCards[currentIndex] || null;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < filteredCards.length - 1 ? prev + 1 : prev
    );
  }, [filteredCards.length]);

  // ArrowLeft / ArrowRight navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleMarkDifficulty = useCallback(async (cardId, status) => {
    try {
      setUpdatingDifficulty(true);
      await api.updateFlashcardDifficulty(cardId, status);
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, difficulty_status: status } : c
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update difficulty tag.');
    } finally {
      setUpdatingDifficulty(false);
    }
  }, []);

  const counts = useMemo(() => {
    return {
      all: cards.length,
      easy: cards.filter((c) => c.difficulty_status === 'easy').length,
      difficult: cards.filter((c) => c.difficulty_status === 'difficult').length,
      unmarked: cards.filter(
        (c) => !c.difficulty_status || c.difficulty_status === 'unmarked'
      ).length,
    };
  }, [cards]);

  const masteryPct =
    counts.all > 0 ? Math.round((counts.easy / counts.all) * 100) : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="mt-3 text-xl font-bold text-white">
            Unable to Load Study Deck
          </h2>
          <p className="mt-1 text-sm text-rose-200">{error || 'Deck not found'}</p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Deck Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white">
            {deck.title}
          </h1>
          {deck.topic && (
            <p className="mt-0.5 text-xs text-slate-400">{deck.topic}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:text-white"
          >
            <Shuffle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Shuffle Deck</span>
          </button>

          {(deck.quiz_questions?.length || 0) > 0 && (
            <Link
              to={`/deck/${deck.id}/quiz`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Take Revision Quiz ({deck.quiz_questions.length})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mastery Bar & Difficulty Filter Pills */}
      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All Cards (${counts.all})`, icon: Layers },
              {
                id: 'difficult',
                label: `Difficult (${counts.difficult})`,
                icon: AlertTriangle,
              },
              {
                id: 'easy',
                label: `Easy (${counts.easy})`,
                icon: CheckCircle2,
              },
              {
                id: 'unmarked',
                label: `Unmarked (${counts.unmarked})`,
                icon: HelpCircle,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    filterMode === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              Card Mastery:{' '}
              <strong className="text-emerald-300">{masteryPct}%</strong>
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-950">
              <div
                style={{ width: `${masteryPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="mt-8">
        {filteredCards.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <p className="text-base font-bold text-white">
              No flashcards in the &ldquo;{filterMode}&rdquo; filter
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Switch back to All Cards to continue studying your deck.
            </p>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Show All Cards ({counts.all})
            </button>
          </div>
        ) : (
          <>
            <Flashcard
              card={currentCard}
              currentIndex={currentIndex}
              totalCards={filteredCards.length}
              onMarkDifficulty={handleMarkDifficulty}
              updatingDifficulty={updatingDifficulty}
            />

            {/* Previous / Next Navigation Controls */}
            <div className="mx-auto mt-7 flex max-w-3xl items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {/* Progress Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {filteredCards.slice(0, 15).map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    title={`Jump to Card ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-7 bg-indigo-500'
                        : c.difficulty_status === 'easy'
                        ? 'w-2.5 bg-emerald-500/60'
                        : c.difficulty_status === 'difficult'
                        ? 'w-2.5 bg-rose-500/60'
                        : 'w-2.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === filteredCards.length - 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

