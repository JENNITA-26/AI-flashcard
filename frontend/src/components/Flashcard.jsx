// frontend/src/components/Flashcard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

/**
 * 3D Flip Animation Flashcard Component with Easy / Difficult difficulty tagging.
 */
export default function Flashcard({
  card,
  currentIndex,
  totalCards,
  onMarkDifficulty,
  updatingDifficulty,
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset card to front side whenever user navigates to a different card
  useEffect(() => {
    setIsFlipped(false);
  }, [card?.id]);

  // Keyboard shortcuts: Space to flip, '1' for Easy, '2' for Difficult
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1' && card) {
        onMarkDifficulty(card.id, 'easy');
      } else if (e.key === '2' && card) {
        onMarkDifficulty(card.id, 'difficult');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onMarkDifficulty]);

  if (!card) return null;

  const statusBadge = {
    easy: {
      label: 'Marked Easy',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
    },
    difficult: {
      label: 'Needs Review (Difficult)',
      classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: AlertTriangle,
    },
    unmarked: {
      label: 'Unmarked',
      classes: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: HelpCircle,
    },
  }[card.difficulty_status || 'unmarked'];

  const StatusIcon = statusBadge.icon;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top Status & Card Counter Bar */}
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-slate-400">
        <span>
          Card <strong className="text-white">{currentIndex + 1}</strong> of{' '}
          <strong className="text-white">{totalCards}</strong>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.classes}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusBadge.label}
        </span>
      </div>

      {/* 3D Flip Container */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsFlipped((prev) => !prev);
        }}
        className="perspective-1000 relative h-[340px] sm:h-[380px] w-full cursor-pointer select-none focus:outline-none"
      >
        <motion.div
          className="preserve-3d relative h-full w-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.55,
            type: 'spring',
            stiffness: 240,
            damping: 22,
          }}
        >
          {/* FRONT FACE (Question) */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-7 sm:p-10 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Question Prompt
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Click or press Space to flip
              </span>
            </div>

            <div className="my-auto flex items-center justify-center py-4 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-relaxed text-white">
                {card.question}
              </h2>
            </div>

            <div className="text-center text-xs text-slate-500">
              Active Recall Tip: Formulate your answer mentally before flipping the card
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div
            style={{ transform: 'rotateY(180deg)' }}
            className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 p-7 sm:p-10 shadow-2xl shadow-indigo-950/30"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Verified Answer
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Click to view question
              </span>
            </div>

            <div className="my-auto overflow-y-auto max-h-[210px] flex items-center justify-center py-2 text-center">
              <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-slate-100">
                {card.answer}
              </p>
            </div>

            <div className="text-center text-xs text-indigo-300/70">
              Rate how well you recalled this answer below
            </div>
          </div>
        </motion.div>
      </div>

      {/* Difficulty Tagging Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          disabled={updatingDifficulty}
          onClick={() => onMarkDifficulty(card.id, 'easy')}
          className={`w-full sm:w-auto flex-1 max-w-xs flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition-all ${
            card.difficulty_status === 'easy'
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/10'
              : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Easy — Mastered</span>
          <kbd className="ml-1 hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">
            1
          </kbd>
        </button>

        <button
          type="button"
          disabled={updatingDifficulty}
          onClick={() => onMarkDifficulty(card.id, 'difficult')}
          className={`w-full sm:w-auto flex-1 max-w-xs flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition-all ${
            card.difficulty_status === 'difficult'
              ? 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-lg shadow-rose-500/10'
              : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <span>Difficult — Flag for Review</span>
          <kbd className="ml-1 hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">
            2
          </kbd>
        </button>
      </div>
    </div>
  );
}

