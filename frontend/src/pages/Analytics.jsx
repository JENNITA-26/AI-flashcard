// frontend/src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Flame,
  Trophy,
  CheckCircle2,
  Layers,
  BookOpen,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import ProgressChart from '../components/ProgressChart';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load learning analytics.');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-sm text-rose-200">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error || 'Unable to load analytics'}</span>
        </div>
      </div>
    );
  }

  const { overview, difficultyDistribution, scoreHistory, deckBreakdown } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Retention & Active Recall Telemetry</span>
          </div>
          <h1 className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Learning Progress & Mastery Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your study streak, quiz accuracy trends, and flashcard difficulty distribution across all decks.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 self-start rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
        >
          <span>+ Generate New Deck</span>
        </Link>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overall Mastery
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-300">
            {overview.overallMasteryPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Card Mastery: {overview.cardMasteryPercentage}%
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Quiz Score
            </span>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-300">
            {overview.averageQuizPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Across {overview.totalQuizAttempts} completed quiz attempts
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Recall Volume
            </span>
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {overview.totalCards}{' '}
            <span className="text-base font-medium text-slate-400">cards</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            In {overview.totalDecks} decks ({overview.totalQuizQuestions} MCQs)
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Study Streak
            </span>
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-orange-300">
            {overview.studyStreakDays}{' '}
            <span className="text-base font-medium text-slate-400">days</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Keep reviewing daily to maintain streak
          </p>
        </div>
      </div>

      {/* Interactive Charts Component */}
      <ProgressChart
        scoreHistory={scoreHistory}
        difficultyDistribution={difficultyDistribution}
      />

      {/* Deck-by-Deck Mastery Breakdown Table */}
      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h3 className="text-base font-bold text-white">
          Deck-by-Deck Mastery Breakdown
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Compare easy vs. difficult card ratios and best quiz performance per deck
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Deck Title</th>
                <th className="pb-3 px-4">Cards</th>
                <th className="pb-3 px-4">Easy / Difficult</th>
                <th className="pb-3 px-4">Card Mastery</th>
                <th className="pb-3 px-4">Best Quiz Score</th>
                <th className="pb-3 pl-4 text-right">Quick Launch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {(deckBreakdown || []).map((d) => (
                <tr key={d.id} className="hover:bg-slate-950/40">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-white">{d.title}</p>
                    {d.topic && (
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">
                        {d.topic}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-300">
                    {d.totalCards}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
                        {d.easyCount} Easy
                      </span>
                      <span className="rounded-md bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300">
                        {d.difficultCount} Difficult
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-950">
                        <div
                          style={{ width: `${d.cardMastery}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                      <span className="font-bold text-slate-200">
                        {d.cardMastery}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {d.bestQuizScore !== null ? (
                      <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 font-bold text-indigo-300">
                        {d.bestQuizScore}% ({d.attemptsCount}x)
                      </span>
                    ) : (
                      <span className="text-slate-500">Not attempted</span>
                    )}
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/deck/${d.id}/study`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-200 hover:bg-indigo-600 hover:text-white"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Study</span>
                      </Link>
                      <Link
                        to={`/deck/${d.id}/quiz`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-200 hover:bg-violet-600 hover:text-white"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Quiz</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

