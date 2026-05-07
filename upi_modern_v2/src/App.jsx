import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import Result from './pages/Result';
import History from './pages/History';
import Login from './pages/Login';
import { isLoggedIn } from './utils/mockAuth';
import { useTheme } from './utils/useTheme';

function AppInner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [authStatus, setAuthStatus] = useState(isLoggedIn());

  useEffect(() => {
    const checkAuth = () => setAuthStatus(isLoggedIn());
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#050d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar authStatus={authStatus} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/result" element={<Result />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInner />
    </Router>
  );
}

export default App;
