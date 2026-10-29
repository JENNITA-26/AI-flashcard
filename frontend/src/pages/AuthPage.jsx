// frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthFormSchema } from '../lib/validators';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { signIn, signUp, enableDemoMode, isSupabaseConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const validation = AuthFormSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid credentials');
      return;
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        const res = await signUp(email, password, fullName);
        if (res?.demo) {
          navigate('/dashboard');
          return;
        }
        if (res?.session) {
          navigate('/dashboard');
        } else {
          setInfoMessage(
            'Account created! Check your email inbox to confirm your registration, or sign in now.'
          );
        }
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantDemo = () => {
    enableDemoMode('scholar@neurorecall.ai');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/85 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {isRegister ? 'Create Your Study Account' : 'Welcome Back, Scholar'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {isRegister
                ? 'Generate AI flashcards, active recall quizzes, and mastery analytics'
                : 'Sign in to access your AI revision decks and progress analytics'}
            </p>
          </div>

          {/* Environment Advisory Notice when .env has default placeholders */}
          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/35 p-3.5 text-xs text-indigo-200">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    Sandbox Ready:
                  </span>{' '}
                  Live Supabase keys are not yet set in <code>frontend/.env</code>.
                  Signing in or clicking below launches Interactive Demo Mode with preloaded decks!
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs font-medium text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
            >
              <span>
                {submitting
                  ? 'Authenticating...'
                  : isRegister
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Instant Demo Access */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500">
                or
              </span>
              <div className="w-full border-t border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleInstantDemo}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-200"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Explore Instant Demo Workspace (Preloaded Decks)</span>
            </button>
          </div>

          {/* Footer Switch Link */}
          <p className="mt-6 text-center text-xs text-slate-400">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

