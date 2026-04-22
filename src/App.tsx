import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/Spinner';
import SEO from './components/ui/SEO';

// Eager-loaded shell (layout + auth shell stay in the main bundle)
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded routes — each becomes its own chunk, shaving the initial bundle
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
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

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<OpenRoute><OverviewPage /></OpenRoute>} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

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
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SEO />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
