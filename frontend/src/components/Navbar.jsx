// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isDemoMode, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard',
    },
    {
      label: 'Create Set',
      to: '/create',
      icon: PlusCircle,
      active: location.pathname === '/create',
    },
    {
      label: 'Analytics',
      to: '/analytics',
      icon: BarChart3,
      active: location.pathname === '/analytics',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to={user ? '/dashboard' : '/login'}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                NeuroRecall
              </span>
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                AI 2.5
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Active Recall & Quiz Studio
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      item.active
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <span
                  title="Running in local Sandbox Mode. Configure .env with live Supabase & Gemini keys for cloud persistence."
                  className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-300"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Demo Sandbox
                </span>
              )}

              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5">
                <User className="h-4 w-4 text-indigo-400" />
                <span className="max-w-[160px] truncate text-xs font-medium text-slate-300">
                  {user.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

