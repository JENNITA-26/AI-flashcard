// frontend/src/components/DeckCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  Pencil,
  Trash2,
  Check,
  X,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { RenameDeckSchema } from '../lib/validators';

/**
 * Dashboard Summary Card for a Saved Revision Deck.
 * Supports inline renaming, deletion, mastery visualization, and direct Study / Quiz triggers.
 */
export default function DeckCard({ deck, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(deck.title || '');
  const [renameError, setRenameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = deck.stats || {
    totalCards: 0,
    easyCards: 0,
    difficultCards: 0,
    unmarkedCards: 0,
    totalQuizzes: 0,
    attemptsCount: 0,
    bestScorePercent: null,
    masteryPercentage: 0,
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    setRenameError('');
    const parsed = RenameDeckSchema.safeParse({ title: titleInput });
    if (!parsed.success) {
      setRenameError(parsed.error.issues[0]?.message || 'Invalid deck title');
      return;
    }

    try {
      setSaving(true);
      await onRename(deck.id, parsed.data.title);
      setIsEditing(false);
    } catch (err) {
      setRenameError(err.message || 'Failed to rename deck');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/75 p-6 shadow-xl transition-all hover:border-indigo-500/40 hover:bg-slate-900">
      <div>
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
              {deck.source_type === 'notes' ? (
                <>
                  <FileText className="h-3 w-3" />
                  From Notes
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Topic AI
                </>
              )}
            </span>

            {deck.category && (
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                {deck.category}
              </span>
            )}
          </div>

          {/* Edit / Delete Action Icons */}
          <div className="flex items-center gap-1">
            {!isEditing && !confirmDelete && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(deck.title);
                    setIsEditing(true);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                  title="Rename Deck"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
                  title="Delete Deck"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Deck Title or Rename Form */}
        <div className="mt-3.5">
          {isEditing ? (
            <form onSubmit={handleSaveRename} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full rounded-xl border border-indigo-500/50 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setRenameError('');
                  }}
                  className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renameError && (
                <p className="text-xs text-rose-400">{renameError}</p>
              )}
            </form>
          ) : (
            <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
              {deck.title}
            </h3>
          )}

          {deck.topic && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {deck.topic}
            </p>
          )}
        </div>

        {/* Delete Confirmation Banner */}
        {confirmDelete && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs">
            <span className="font-medium text-rose-200">Delete this deck?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDelete(deck.id)}
                className="rounded-lg bg-rose-600 px-2.5 py-1 font-semibold text-white hover:bg-rose-500"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mastery Progress Bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">Overall Mastery</span>
            <span className="font-bold text-indigo-300">
              {stats.masteryPercentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
            <div
              style={{ width: `${stats.masteryPercentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
            />
          </div>
        </div>

        {/* Card & Quiz Counts + Difficulty Pills */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">
                {stats.totalCards} Cards
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-0.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.easyCards}
                </span>
                <span className="inline-flex items-center gap-0.5 text-rose-400">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.difficultCards}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">
                {stats.totalQuizzes} MCQs
              </p>
              <p className="text-[11px] text-slate-400">
                {stats.bestScorePercent !== null
                  ? `Best: ${stats.bestScorePercent}%`
                  : 'No attempts'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Study Mode & Quiz Mode */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 pt-2">
        <Link
          to={`/deck/${deck.id}/study`}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
            stats.totalCards > 0
              ? 'border-indigo-500/40 bg-indigo-600/15 text-indigo-200 hover:bg-indigo-600 hover:text-white'
              : 'border-slate-800 bg-slate-900 text-slate-500 pointer-events-none'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Study Cards</span>
        </Link>

        <Link
          to={`/deck/${deck.id}/quiz`}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
            stats.totalQuizzes > 0
              ? 'border-violet-500/40 bg-violet-600/15 text-violet-200 hover:bg-violet-600 hover:text-white'
              : 'border-slate-800 bg-slate-900 text-slate-500 pointer-events-none'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Take Quiz</span>
        </Link>
      </div>
    </div>
  );
}

