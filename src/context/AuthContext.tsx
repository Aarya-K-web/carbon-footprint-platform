import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface AuthContextType {
  user: User | { id: string; email: string; isDemo?: boolean } | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  loginDemo: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { id: string; email: string; isDemo?: boolean } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage for an offline/demo session first
    const demoSession = localStorage.getItem('ecopulse_demo_session');
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('ecopulse_demo_session');
      }
    }

    // 2. Fall back to standard Supabase session retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      // If network fails entirely, resolve loading state
      setLoading(false);
    });

    // 3. Listen for active auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If logged in via demo, do not let Supabase override
      if (localStorage.getItem('ecopulse_demo_session')) {
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setSession(data.session);
      setUser(data.user);
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Direct verification email flow to client router endpoint /login
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      if (user && !(user as any).isDemo) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Network issue during signOut request. Cleared session locally.');
    } finally {
      localStorage.removeItem('ecopulse_demo_session');
      setUser(null);
      setSession(null);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const loginDemo = (emailAddress: string) => {
    const mockUser = {
      id: 'demo-user-id',
      email: emailAddress || 'demo@ecopulse.org',
      email_confirmed_at: new Date().toISOString(),
      role: 'authenticated',
      isDemo: true,
    };
    localStorage.setItem('ecopulse_demo_session', JSON.stringify(mockUser));
    setUser(mockUser);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updateUserPassword,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
