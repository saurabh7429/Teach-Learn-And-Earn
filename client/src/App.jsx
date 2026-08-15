import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar   from './components/Navbar';
import Login    from './pages/Login';
import Signup   from './pages/Signup';
import Home     from './pages/Home';
import Learn    from './pages/Learn';
import Teach    from './pages/Teach';
import Requests from './pages/Requests';
import Progress from './pages/Progress';
import Chat     from './pages/Chat';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash-loader"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Landing & Home */}
        <Route path="/"         element={<Home />} />

        {/* Auth routes */}
        <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup"   element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

        {/* Protected workspace routes */}
        <Route path="/learn"    element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/teach"    element={<ProtectedRoute><Teach /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        
        {/* Catch-all redirect to Home */}
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
