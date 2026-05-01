import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/Spinner';
import { PageTransition, RouteFallback } from './components/ui/PageTransition';
import SEO from './components/ui/SEO';

// Eager-loaded shell (layout + auth shell stay in the main bundle)
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded routes — each becomes its own chunk, shaving the initial bundle.
// `import()` calls are referenced both for the route AND for prefetch warm-ups
// below, so the chunks are reused (no duplicate downloads).
const importStartService = () => import('./pages/StartServicePage');
const importLogin = () => import('./pages/LoginPage');
const importDashboard = () => import('./pages/DashboardPage');

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const LoginPage = lazy(importLogin);
const StartServicePage = lazy(importStartService);
const MagicLinkCallbackPage = lazy(() => import('./pages/MagicLinkCallbackPage'));
const DashboardPage = lazy(importDashboard);
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const VerificationsPage = lazy(() => import('./pages/VerificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminApplicationDetail = lazy(() => import('./pages/admin/AdminApplicationDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReminders = lazy(() => import('./pages/admin/AdminReminders'));
const AdminDeliveries = lazy(() => import('./pages/admin/AdminDeliveries'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminRegistry = lazy(() => import('./pages/admin/AdminRegistry'));

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}

/** Always-public route — shows content whether signed in or not. */
function OpenRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return <>{children}</>;
}

/**
 * Warm up the most-used route chunks once the browser is idle. Triggered after
 * first paint so it never competes with critical work. The chunks the user is
 * most likely to hit next from the landing page are StartService (primary CTA),
 * Login (secondary CTA), and Dashboard (after sign-in).
 */
function PrefetchOnIdle() {
  useEffect(() => {
    const idle = (cb: () => void) => {
      const w = window as any;
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(cb, { timeout: 2500 });
      } else {
        setTimeout(cb, 1500);
      }
    };
    idle(() => {
      // Fire-and-forget; failures (e.g. offline) are harmless
      importStartService().catch(() => {});
      importLogin().catch(() => {});
      importDashboard().catch(() => {});
    });
  }, []);
  return null;
}

function AppRoutes() {
  // Track location separately so AnimatePresence sees route changes
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<OpenRoute><OverviewPage /></OpenRoute>} />

          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          {/* No registration page — accounts are created at checkout. /register redirects to the start-service flow */}
          <Route path="/register" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<OpenRoute><StartServicePage /></OpenRoute>} />
          {/* Magic-link sign-in: token consumed, JWT issued, redirect to dashboard */}
          <Route path="/auth/magic/:token" element={<MagicLinkCallbackPage />} />

          <Route path="/applications/:id/payment-callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />
          <Route path="/applications/payment-callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/vehicles/new" element={<VehiclesPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/new" element={<ApplicationsPage />} />
            <Route path="/verifications" element={<VerificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly><AppLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reminders" element={<AdminReminders />} />
            <Route path="/admin/deliveries" element={<AdminDeliveries />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/registry" element={<AdminRegistry />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SEO />
          <PrefetchOnIdle />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
