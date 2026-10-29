// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedDemo = localStorage.getItem('neurorecall_demo_mode') === 'true';

    if (storedDemo) {
      const demoEmail =
        localStorage.getItem('neurorecall_demo_email') || 'scholar@neurorecall.ai';
      setIsDemoMode(true);
      setUser({
        id: 'demo-user-id',
        email: demoEmail,
        user_metadata: { full_name: 'Alex Rivera (Demo Scholar)' },
      });
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      // Automatically enter interactive demo mode if Supabase .env placeholders are still set
      enableDemoMode(email);
      return { user: { id: 'demo-user-id', email }, demo: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    localStorage.removeItem('neurorecall_demo_mode');
    setIsDemoMode(false);
    return data;
  };

  const signUp = async (email, password, fullName = '') => {
    if (!isSupabaseConfigured || !supabase) {
      enableDemoMode(email);
      return { user: { id: 'demo-user-id', email }, demo: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    localStorage.removeItem('neurorecall_demo_mode');
    setIsDemoMode(false);
    return data;
  };

  const enableDemoMode = (customEmail = 'scholar@neurorecall.ai') => {
    localStorage.setItem('neurorecall_demo_mode', 'true');
    localStorage.setItem('neurorecall_demo_email', customEmail);
    setIsDemoMode(true);
    setUser({
      id: 'demo-user-id',
      email: customEmail,
      user_metadata: { full_name: 'Interactive Demo Scholar' },
    });
  };

  const signOut = async () => {
    localStorage.removeItem('neurorecall_demo_mode');
    localStorage.removeItem('neurorecall_demo_email');
    setIsDemoMode(false);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoMode,
        isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

