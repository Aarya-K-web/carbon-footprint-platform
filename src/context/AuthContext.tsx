import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { fetchProfile, UserProfile } from '../lib/profileService';

export interface AuthContextType {
  user: User | { id: string; email: string; isDemo?: boolean } | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  loginDemo: (email: string) => void;
  refreshProfile: () => Promise<void>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { id: string; email: string; isDemo?: boolean } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const refreshProfile = async () => {
    if (user && !(user as any).isDemo) {
      setLoadingProfile(true);
      const { data, error } = await fetchProfile(user.id);
      if (!error && data) {
        setUserProfile(data);
      } else {
        // Fallback: If profiles table query fails (e.g. table does not exist yet or connection fails),
        // we set a default profile so the app doesn't hang.
        setUserProfile({
          id: user.id,
          full_name: '',
          avatar_url: '',
          sustainability_goal: 'low-carbon',
          target_carbon_reduction: 15,
          sustainability_score: 0,
          onboarding_completed: false,
        });
      }
      setLoadingProfile(false);
    }
  };

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
      setLoading(false);
    });

    // 3. Listen for active auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // Synchronize profiles when user state changes
  useEffect(() => {
    if (user) {
      if ((user as any).isDemo) {
        const mockProfile: UserProfile = {
          id: 'demo-user-id',
          full_name: 'Eco Explorer',
          avatar_url: '',
          sustainability_goal: 'low-carbon',
          target_carbon_reduction: 15,
          sustainability_score: 120,
          onboarding_completed: true,
        };
        setUserProfile(mockProfile);
      } else {
        refreshProfile();
      }
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      localStorage.removeItem('ecopulse_demo_session');
      setSession(data.session);
      setUser(data.user);
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (!error) {
      localStorage.removeItem('ecopulse_demo_session');
    }
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
      setUserProfile(null);
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
        userProfile,
        loadingProfile,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updateUserPassword,
        loginDemo,
        refreshProfile,
        setUserProfile,
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
