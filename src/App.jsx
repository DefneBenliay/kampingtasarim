import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for performance optimization
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Info = lazy(() => import('./pages/Info'));
const Files = lazy(() => import('./pages/Files'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const Users = lazy(() => import('./pages/Admin/Users'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || role !== 'admin') return <Navigate to="/" />; // Redirect non-admins to home
  return children;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-lg">Yükleniyor...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Routes (for logged-in users) */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
              <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="users" element={<Users />} />
                {/* Add other admin sub-routes if needed, but managing content is done on the pages themselves usually */}
              </Route>
              {/* Catch-all Route: Redirect unknown pages to/login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
