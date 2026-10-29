// frontend/src/pages/TakeQuiz.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import QuizCard from '../components/QuizCard';

export default function TakeQuiz() {
  const { id } = useParams();

  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getDeckById(id);
        setDeck(res.deck);
        setQuestions(res.deck?.quiz_questions || []);
      } catch (err) {
        setError(err.message || 'Failed to load revision quiz.');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id]);

  // Active timer while quiz is in progress
  useEffect(() => {
    if (loading || quizCompleted || questions.length === 0) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, quizCompleted, questions.length]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const calculateFinalScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === Number(q.correct_option_index)) {
        correct += 1;
      }
    });
    return correct;
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Final question completed -> submit attempt to backend
    const finalScore = calculateFinalScore();
    try {
      setSubmitting(true);
      const res = await api.submitQuizAttempt({
        deck_id: deck.id,
        score: finalScore,
        total_questions: questions.length,
        time_spent_seconds: elapsedSeconds,
      });
      setSubmissionResult({
        score: finalScore,
        totalQuestions: questions.length,
        percentage: Math.round((finalScore / questions.length) * 100),
        bestPercentage: res.analytics?.bestPercentage,
        totalAttemptsForDeck: res.analytics?.totalAttemptsForDeck,
      });
      setQuizCompleted(true);
    } catch (err) {
      setError(err.message || 'Failed to record quiz score.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setQuizCompleted(false);
    setSubmissionResult(null);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
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
            Unable to Load Quiz
          </h2>
          <p className="mt-1 text-sm text-rose-200">{error || 'Deck not found'}</p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10">
          <h2 className="text-xl font-bold text-white">
            No Quiz Questions in This Deck
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            This deck was generated in Flashcards-Only mode. You can study its flashcards or create a new Combined Deck.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to={`/deck/${deck.id}/study`}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
            >
              Study Flashcards
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(
    ((currentIndex + 1) / questions.length) * 100
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white">
            {deck.title} — Revision Quiz
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Time: {formatTime(elapsedSeconds)}</span>
          </div>

          {(deck.flashcards?.length || 0) > 0 && (
            <Link
              to={`/deck/${deck.id}/study`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-indigo-500/40 hover:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Study Cards</span>
            </Link>
          )}
        </div>
      </div>

      {!quizCompleted ? (
        <>
          {/* Progress Bar */}
          <div className="mb-7">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
              <span>Quiz Progress</span>
              <span className="font-semibold text-indigo-300">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              />
            </div>
          </div>

          <QuizCard
            questionObj={questions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOptionIndex={selectedAnswers[currentIndex]}
            onSelectOption={handleSelectOption}
            onNextQuestion={handleNextOrFinish}
            isLastQuestion={currentIndex === questions.length - 1}
            submitting={submitting}
          />
        </>
      ) : (
        /* Final Quiz Score & Question Review Screen */
        <div className="space-y-6">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/35 to-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>

            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
              Quiz Completed!
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Your attempt has been saved to your learning progress history.
            </p>

            <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                <p className="text-xs text-slate-400">Your Score</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-300">
                  {submissionResult?.score} / {submissionResult?.totalQuestions}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {submissionResult?.percentage}% Accuracy
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                <p className="text-xs text-slate-400">Personal Best</p>
                <p className="mt-1 text-2xl font-extrabold text-indigo-300">
                  {submissionResult?.bestPercentage ?? submissionResult?.percentage}%
                </p>
                <p className="text-xs text-slate-400">
                  {submissionResult?.totalAttemptsForDeck || 1} total attempt(s)
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                <p className="text-xs text-slate-400">Time Spent</p>
                <p className="mt-1 text-2xl font-extrabold text-violet-300">
                  {formatTime(elapsedSeconds)}
                </p>
                <p className="text-xs text-slate-400">Active recall pace</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetakeQuiz}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </button>

              <Link
                to={`/deck/${deck.id}/study`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Review Flashcards</span>
              </Link>

              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>

          {/* Question-by-Question Review Breakdown */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white">
              Detailed Question Review
            </h3>
            <div className="mt-4 space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const correctChoice = Number(q.correct_option_index);
                const correct = userChoice === correctChoice;
                return (
                  <div
                    key={q.id || idx}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {idx + 1}. {q.question}
                      </p>
                      {correct ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-300">
                      <span className="text-slate-400">Your Answer: </span>
                      <span
                        className={
                          correct
                            ? 'font-semibold text-emerald-300'
                            : 'font-semibold text-rose-300'
                        }
                      >
                        {q.options?.[userChoice] ?? 'Skipped'}
                      </span>
                    </p>
                    {!correct && (
                      <p className="mt-1 text-xs text-emerald-300">
                        <span className="text-slate-400">Correct Answer: </span>
                        <span className="font-semibold">
                          {q.options?.[correctChoice]}
                        </span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 rounded-xl bg-slate-900/90 p-2.5 text-xs text-slate-400">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

