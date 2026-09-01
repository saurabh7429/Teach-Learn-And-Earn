import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import TeachDevtaDrawer from './components/TeachDevtaDrawer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Teach from './pages/Teach';
import Requests from './pages/Requests';
import Progress from './pages/Progress';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  const openAIWithQuery = (q = '') => {
    setAiQuery(q);
    setAiOpen(true);
  };

  return (
    <>
      <Navbar onOpenAI={() => openAIWithQuery('')} />
      <TeachDevtaDrawer 
        isOpen={aiOpen} 
        onClose={() => setAiOpen(false)} 
        initialQuery={aiQuery} 
      />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Routes>
          {/* Public Landing & Home */}
          <Route path="/" element={<Home onOpenAI={openAIWithQuery} />} />

          {/* Auth routes */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          {/* Protected workspace routes */}
          <Route path="/learn" element={<ProtectedRoute><Learn onOpenAI={openAIWithQuery} /></ProtectedRoute>} />
          <Route path="/teach" element={<ProtectedRoute><Teach onOpenAI={openAIWithQuery} /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
