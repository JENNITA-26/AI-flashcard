// frontend/src/pages/CreateDeck.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Upload,
  Layers,
  Sliders,
  AlertCircle,
  Loader2,
  BookOpen,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { CreateDeckFormSchema } from '../lib/validators';

const ACADEMIC_DOMAINS = [
  'Computer Science',
  'DSA',
  'Web Development',
  'Operating Systems',
  'DBMS & SQL',
  'Computer Networks',
  'System Design',
  'AI & Machine Learning',
];

const CONTENT_TYPES = [
  'Conceptual Summaries',
  'Terminology',
  'Formulas',
  'Problem-Solving MCQs',
];

const CARD_QUANTITIES = ['5', '10', '15', '20'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

const SAMPLE_PRESETS = [
  {
    label: 'Trees, Graphs & Dynamic Programming (DSA)',
    sourceType: 'topic',
    category: 'DSA',
    contentType: 'Problem-Solving MCQs',
    difficultyLevel: 'Medium',
    content:
      'Binary Search Trees (BST), AVL rotations, Dijkstra shortest path, Bellman-Ford, Topological Sort, and Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, memoization vs tabulation) with Big-O time and space complexities.',
  },
  {
    label: 'Operating Systems & Concurrency Notes (CS)',
    sourceType: 'notes',
    category: 'Operating Systems',
    contentType: 'Conceptual Summaries',
    difficultyLevel: 'Hard',
    content:
      'A process is an executing instance of a program with its own isolated virtual address space, whereas threads within the same process share code, data, and heap segments but maintain separate stacks and registers. Deadlock occurs when four Coffman conditions hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Virtual memory uses paging and a Translation Lookaside Buffer (TLB) cache to translate virtual page numbers into physical frame addresses; a TLB miss triggers a page table walk, and a page fault traps to the OS kernel to fetch the page from disk.',
  },
  {
    label: 'DBMS Indexing, ACID & Normalization (DBMS & SQL)',
    sourceType: 'topic',
    category: 'DBMS & SQL',
    contentType: 'Terminology',
    difficultyLevel: 'Medium',
    content:
      'B+ Tree indexing vs Hash indexing, ACID transaction properties, isolation levels (Read Committed, Repeatable Read, Serializable), MVCC, and database normalization (1NF, 2NF, 3NF, BCNF).',
  },
];

export default function CreateDeck() {
  const navigate = useNavigate();

  const [sourceType, setSourceType] = useState('topic');
  const [content, setContent] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [outputMode, setOutputMode] = useState('both');
  const [category, setCategory] = useState('Computer Science');
  const [contentType, setContentType] = useState('Conceptual Summaries');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [validationError, setValidationError] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '').slice(0, 10000);
      setSourceType('notes');
      setContent(text);
      setUploadedFileName(file.name);
      setValidationError('');
    };
    reader.readAsText(file);
  };

  const applyPreset = (preset) => {
    setSourceType(preset.sourceType);
    setCategory(preset.category);
    setContentType(preset.contentType);
    setDifficultyLevel(preset.difficultyLevel);
    setContent(preset.content);
    setUploadedFileName('');
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const parsed = CreateDeckFormSchema.safeParse({
      sourceType,
      content,
      cardCount,
      difficultyLevel,
      outputMode,
      category,
      contentType,
    });

    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message || 'Please check your form inputs.'
      );
      return;
    }

    const numericCount = parsed.data.cardCount;
    const payload = {
      sourceType: parsed.data.sourceType,
      content: parsed.data.content,
      cardCount: outputMode === 'quiz' ? 0 : numericCount,
      quizCount: outputMode === 'flashcards' ? 0 : numericCount,
      difficultyLevel: parsed.data.difficultyLevel,
      category: parsed.data.category,
      contentType: parsed.data.contentType,
      outputMode: parsed.data.outputMode,
    };

    try {
      setGenerating(true);
      const result = await api.generateRevisionSet(payload);
      const createdDeck = result.deck;

      if (outputMode === 'quiz' && createdDeck?.id) {
        navigate(`/deck/${createdDeck.id}/quiz`);
      } else if (createdDeck?.id) {
        navigate(`/deck/${createdDeck.id}/study`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setValidationError(
        err.message || 'Failed to generate revision set. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by Google Gemini 2.5 Flash</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create AI Revision Set
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter an academic topic, paste study notes, or upload a text document to generate structured flashcards and multiple-choice questions.
        </p>
      </div>

      {/* Quick Sample Presets */}
      <div className="mb-6 rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Try Sample Prompts:
        </span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-200"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 sm:p-8 shadow-2xl"
      >
        {/* 1. Source Type Toggle */}
        <div>
          <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Select Source Material Type
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSourceType('topic')}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                sourceType === 'topic'
                  ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="rounded-xl bg-indigo-500/20 p-2.5 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Topic or Concept</p>
                <p className="text-xs text-slate-400">
                  Specify a subject, chapter, or exam topic
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('notes')}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                sourceType === 'notes'
                  ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="rounded-xl bg-violet-500/20 p-2.5 text-violet-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Paste Notes / Upload Document
                </p>
                <p className="text-xs text-slate-400">
                  Convert lecture notes or study guides (20–10,000 chars)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Content Input or Document Upload */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {sourceType === 'topic'
                ? '2. Topic Description or Syllabus Focus'
                : '2. Study Notes (Min 20 chars, Max 10,000 chars)'}
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-indigo-300 transition hover:bg-slate-800">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload .txt / .md</span>
              <input
                type="file"
                accept=".txt,.md,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {uploadedFileName && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Loaded document: {uploadedFileName}</span>
            </div>
          )}

          <textarea
            rows={sourceType === 'topic' ? 3 : 7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              sourceType === 'topic'
                ? 'e.g., Binary Search Trees, Dijkstra shortest path, Dynamic Programming, Big-O Time & Space Complexity...'
                : 'Paste your CS lecture notes, algorithm pseudocode, or documentation excerpts here (minimum 20 characters)...'
            }
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>
              {sourceType === 'notes'
                ? 'Minimum 20 characters required for study notes'
                : 'Minimum 3 characters required for topic'}
            </span>
            <span
              className={
                content.length > 10000 ? 'font-bold text-rose-400' : ''
              }
            >
              {content.length.toLocaleString()} / 10,000 chars
            </span>
          </div>
        </div>

        {/* 3. Domain & Content Type Categorization */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Academic Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm font-medium text-white focus:border-indigo-500 focus:outline-none"
            >
              {ACADEMIC_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Content Focus Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm font-medium text-white focus:border-indigo-500 focus:outline-none"
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Output Mode Selection */}
        <div>
          <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
            5. Output Mode
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                id: 'both',
                label: 'Combined Deck',
                desc: 'Flashcards + Multiple-Choice Quiz',
                icon: Layers,
              },
              {
                id: 'flashcards',
                label: 'Flashcards Only',
                desc: '3D Flip Q&A Active Recall Cards',
                icon: BookOpen,
              },
              {
                id: 'quiz',
                label: 'Quiz Only',
                desc: '4-Option MCQs with Explanations',
                icon: HelpCircle,
              },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setOutputMode(mode.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                    outputMode === mode.id
                      ? 'border-indigo-500 bg-indigo-600/15 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5 text-indigo-400 mb-2" />
                  <div>
                    <p className="text-sm font-bold text-white">{mode.label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {mode.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Card Quantity & Difficulty Level */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>6. Target Quantity (Cards / Questions)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CARD_QUANTITIES.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setCardCount(qty)}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                    cardCount === qty
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sliders className="h-3.5 w-3.5 text-violet-400" />
              <span>7. Difficulty Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficultyLevel(level)}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                    difficultyLevel === level
                      ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={generating}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating Structured Flashcards & Quiz via Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Revision Set Now</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

