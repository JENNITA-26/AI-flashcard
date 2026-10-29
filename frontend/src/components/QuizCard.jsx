// frontend/src/components/QuizCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Trophy,
} from 'lucide-react';

/**
 * Interactive Multiple-Choice Question Card with instant selection feedback
 * and pedagogical explanation reveal.
 */
export default function QuizCard({
  questionObj,
  questionIndex,
  totalQuestions,
  selectedOptionIndex,
  onSelectOption,
  onNextQuestion,
  isLastQuestion,
  submitting,
}) {
  if (!questionObj) return null;

  const hasAnswered = selectedOptionIndex !== null && selectedOptionIndex !== undefined;
  const correctIndex = Number(questionObj.correct_option_index);
  const isCorrect = hasAnswered && selectedOptionIndex === correctIndex;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <motion.div
      key={questionObj.id || questionIndex}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-9 shadow-2xl"
    >
      {/* Question Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          Question {questionIndex + 1} of {totalQuestions}
        </span>

        {hasAnswered && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isCorrect
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Correct Answer
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Incorrect
              </>
            )}
          </span>
        )}
      </div>

      {/* Question Prompt */}
      <h2 className="mb-7 text-lg sm:text-xl md:text-2xl font-semibold leading-snug text-white">
        {questionObj.question}
      </h2>

      {/* 4 Options List */}
      <div className="space-y-3.5">
        {(questionObj.options || []).map((optionText, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isThisCorrect = idx === correctIndex;

          let buttonStyle =
            'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/70';
          let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

          if (hasAnswered) {
            if (isThisCorrect) {
              buttonStyle =
                'border-emerald-500/70 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-950/30';
              badgeStyle = 'bg-emerald-500 text-slate-950 border-emerald-400';
            } else if (isSelected && !isThisCorrect) {
              buttonStyle =
                'border-rose-500/70 bg-rose-500/15 text-rose-100';
              badgeStyle = 'bg-rose-500 text-white border-rose-400';
            } else {
              buttonStyle =
                'border-slate-800/60 bg-slate-950/40 text-slate-500 opacity-65';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelectOption(idx)}
              className={`w-full flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-4.5 text-left transition-all ${buttonStyle}`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${badgeStyle}`}
                >
                  {optionLabels[idx] || idx + 1}
                </span>
                <span className="text-sm sm:text-base font-medium leading-relaxed">
                  {optionText}
                </span>
              </div>

              {hasAnswered && isThisCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              )}
              {hasAnswered && isSelected && !isThisCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback & Explanation Box */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Explanation & Active Recall Insight
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                {questionObj.explanation ||
                  `The correct option is ${optionLabels[correctIndex]}: "${questionObj.options?.[correctIndex]}".`}
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onNextQuestion}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLastQuestion ? (
                <>
                  <Trophy className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Score...' : 'Finish & Submit Quiz'}</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

