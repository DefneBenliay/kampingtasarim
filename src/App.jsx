import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Info from './pages/Info';
import Files from './pages/Files';
import AdminLayout from './pages/Admin/AdminLayout';
import Users from './pages/Admin/Users';

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

function App() {
  return (
    <AuthProvider>
      <Router>
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
