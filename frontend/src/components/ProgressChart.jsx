// frontend/src/components/ProgressChart.jsx
import React from 'react';
import { TrendingUp, PieChart, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * Displays:
 * 1. Quiz Score Progression SVG Line/Area Chart over time
 * 2. Flashcard Difficulty Distribution Breakdown (Easy vs. Difficult vs. Unmarked)
 */
export default function ProgressChart({
  scoreHistory = [],
  difficultyDistribution = { easy: 0, difficult: 0, unmarked: 0 },
}) {
  const totalCards =
    (difficultyDistribution.easy || 0) +
    (difficultyDistribution.difficult || 0) +
    (difficultyDistribution.unmarked || 0);

  const easyPct =
    totalCards > 0 ? Math.round((difficultyDistribution.easy / totalCards) * 100) : 0;
  const difficultPct =
    totalCards > 0 ? Math.round((difficultyDistribution.difficult / totalCards) * 100) : 0;
  const unmarkedPct =
    totalCards > 0 ? Math.max(0, 100 - easyPct - difficultPct) : 0;

  // Prepare SVG coordinate points for recent quiz attempts (up to last 10)
  const recentScores = scoreHistory.slice(-10);
  const chartWidth = 600;
  const chartHeight = 200;
  const padX = 36;
  const padY = 24;

  const points = recentScores.map((item, idx) => {
    const x =
      recentScores.length === 1
        ? chartWidth / 2
        : padX +
          (idx / (recentScores.length - 1)) * (chartWidth - padX * 2);
    const y =
      chartHeight -
      padY -
      (Math.min(100, Math.max(0, item.percentage)) / 100) *
        (chartHeight - padY * 2);
    return { x, y, ...item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints =
    points.length > 0
      ? `${points[0].x},${chartHeight - padY} ${polylinePoints} ${
          points[points.length - 1].x
        },${chartHeight - padY}`
      : '';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Quiz Score History Line Chart */}
      <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Quiz Score Trajectory
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Active recall accuracy across your recent quiz attempts
            </p>
          </div>
          {recentScores.length > 0 && (
            <span className="rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
              Latest: {recentScores[recentScores.length - 1].percentage}%
            </span>
          )}
        </div>

        {recentScores.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center">
            <p className="text-sm font-medium text-slate-400">
              No quiz attempts recorded yet.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Complete a multiple-choice quiz on any deck to visualize your score trend!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-slate-950/70 p-3 border border-slate-800/80">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-48 w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines (0%, 50%, 100%) */}
                {[0, 50, 100].map((pct) => {
                  const yPos =
                    chartHeight -
                    padY -
                    (pct / 100) * (chartHeight - padY * 2);
                  return (
                    <g key={pct}>
                      <line
                        x1={padX}
                        y1={yPos}
                        x2={chartWidth - padX}
                        y2={yPos}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={6}
                        y={yPos + 4}
                        fill="#64748b"
                        fontSize="10"
                      >
                        {pct}%
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                {points.length > 1 && (
                  <polygon points={areaPoints} fill="url(#scoreAreaGrad)" />
                )}

                {/* Connecting Line */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Data Nodes */}
                {points.map((pt, i) => (
                  <g key={pt.id || i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      className="fill-indigo-400 stroke-slate-950"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {pt.percentage}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Recent Attempts Pill List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-36 overflow-y-auto pr-1">
              {[...recentScores].reverse().slice(0, 4).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3.5 py-2 text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-200 truncate">
                      {att.deckTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 font-bold ${
                      att.percentage >= 80
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : att.percentage >= 50
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {att.score}/{att.totalQuestions} ({att.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Difficulty Breakdown */}
      <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-violet-400" />
            <h3 className="text-base font-bold text-white">
              Card Difficulty Distribution
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Active recall confidence tagging across {totalCards} total flashcards
          </p>

          {/* Stacked Horizontal Distribution Bar */}
          <div className="mt-6">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              {easyPct > 0 && (
                <div
                  style={{ width: `${easyPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Easy: ${easyPct}%`}
                />
              )}
              {difficultPct > 0 && (
                <div
                  style={{ width: `${difficultPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Difficult: ${difficultPct}%`}
                />
              )}
              {unmarkedPct > 0 && (
                <div
                  style={{ width: `${unmarkedPct}%` }}
                  className="bg-slate-700 transition-all duration-500"
                  title={`Unmarked: ${unmarkedPct}%`}
                />
              )}
            </div>
          </div>

          {/* Detailed Legend Rows */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-emerald-200">
                    Easy (Mastered)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    High-confidence active recall
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-300">
                  {difficultyDistribution.easy} cards
                </span>
                <p className="text-[11px] text-slate-400">{easyPct}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <div>
                  <p className="text-xs font-semibold text-rose-200">
                    Difficult (Needs Review)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Flagged for spaced repetition priority
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-rose-300">
                  {difficultyDistribution.difficult} cards
                </span>
                <p className="text-[11px] text-slate-400">{difficultPct}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Unmarked Cards
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Awaiting first study pass
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-300">
                  {difficultyDistribution.unmarked} cards
                </span>
                <p className="text-[11px] text-slate-500">{unmarkedPct}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-950/70 border border-slate-800/80 px-4 py-2.5 text-xs text-slate-400">
          Tip: Focus your study sessions on <strong className="text-rose-300">Difficult</strong> cards to boost overall deck mastery.
        </div>
      </div>
    </div>
  );
}

