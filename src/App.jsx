import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ClientOnly } from './components/ClientOnly';
import { EcoLineWaves } from './components/eco-ui/EcoLineWaves';

const EcoBlobCursor = lazy(() =>
  import('./components/eco-ui/EcoBlobCursor').then((m) => ({ default: m.EcoBlobCursor })),
);
const Silk = lazy(() => import('./components/eco-ui/Silk'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardHub = lazy(() => import('./pages/dashboard/DashboardHub'));
const Signup = lazy(() =>
  import('./components/auth/Signup').then((m) => ({ default: m.Signup })),
);
const ForgotPassword = lazy(() =>
  import('./components/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = lazy(() =>
  import('./components/auth/ResetPassword').then((m) => ({ default: m.ResetPassword })),
);
const Navbar = lazy(() =>
  import('./components/Navbar').then((m) => ({ default: m.Navbar })),
);
const Onboarding = lazy(() =>
  import('./components/profile/Onboarding').then((m) => ({ default: m.Onboarding })),
);
const UserProfile = lazy(() =>
  import('./components/profile/UserProfile').then((m) => ({ default: m.UserProfile })),
);

const LoadingFallback = ({ small = false }) => (
  <div className={`flex items-center justify-center ${small ? 'py-12' : 'min-h-screen'} bg-gradient-to-b from-slate-950 via-emerald-950/5 to-slate-950`}>
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
      {!small && (
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          Loading...
        </p>
      )}
    </div>
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-between p-4 overflow-hidden bg-transparent text-slate-100">
    <ClientOnly>
      <EcoLineWaves intensity="low" pageVariant="login" overlayOpacity={0.04} />
    </ClientOnly>
    <header className="relative z-10 max-w-5xl w-full flex items-center justify-between py-4 px-2 border-b border-slate-900">
      <div className="flex items-center gap-2">
        <span className="text-emerald-500 text-xl">{'\u{1F331}'}</span>
        <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
          EcoPulse
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
        <span>SECURE GATEWAY</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    </header>
    <main className="relative z-10 w-full flex items-center justify-center my-auto">
      {children}
    </main>
    <footer className="relative z-10 py-4 text-xs text-slate-600 border-t border-slate-900 w-full max-w-5xl text-center">
      &copy; 2026 EcoPulse Carbon Diagnostics Inc. Encrypted user sessions.
    </footer>
  </div>
);

const ProfileLayout = () => {
  const { userProfile } = useAuth();
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <LoadingFallback small />
      </div>
    );
  }
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-transparent text-slate-100">
      <ClientOnly>
        <EcoLineWaves intensity="low" pageVariant="dashboard" overlayOpacity={0.03} />
      </ClientOnly>
      <div className="relative z-10 max-w-2xl w-full flex flex-col gap-6">
        <Suspense fallback={<div className="h-12" />}>
          <Navbar />
        </Suspense>
        <Suspense fallback={<LoadingFallback small />}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 ease-in-out">
            <UserProfile />
          </div>
        </Suspense>
        <div className="text-center text-xs text-slate-600">
          Secured User Profile Management.
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, loading, userProfile, loadingProfile } = useAuth();
  const isSessionLoading = loading || (user && !userProfile && loadingProfile);

  if (isSessionLoading) {
    return <LoadingFallback />;
  }

  const hasOnboarded = userProfile?.onboarding_completed;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Suspense fallback={null}>
        <EcoBlobCursor enabled={true} />
        <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
          <ClientOnly>
            <Silk
              speed={7.7}
              scale={1}
              color="#34D399"
              noiseIntensity={0.6}
              rotation={0}
            />
          </ClientOnly>
        </div>
      </Suspense>
      <Routes>
        <Route
          path="/login"
          element={
            user && !user?.isDemo ? (
              <Navigate to={hasOnboarded ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            )
          }
        />
        <Route
          path="/signup"
          element={
            user && !user?.isDemo ? (
              <Navigate to={hasOnboarded ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <AuthLayout>
                <Suspense fallback={<LoadingFallback small />}>
                  <Signup />
                </Suspense>
              </AuthLayout>
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            user && !user?.isDemo ? (
              <Navigate to={hasOnboarded ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <AuthLayout>
                <Suspense fallback={<LoadingFallback small />}>
                  <ForgotPassword />
                </Suspense>
              </AuthLayout>
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <Suspense fallback={<LoadingFallback small />}>
                <ResetPassword />
              </Suspense>
            </AuthLayout>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {hasOnboarded ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout>
                  <Suspense fallback={<LoadingFallback small />}>
                    <Onboarding />
                  </Suspense>
                </AuthLayout>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {!hasOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardHub />
                </Suspense>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {!hasOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ProfileLayout />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? (hasOnboarded ? '/dashboard' : '/onboarding') : '/login'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? (hasOnboarded ? '/dashboard' : '/onboarding') : '/login'} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
