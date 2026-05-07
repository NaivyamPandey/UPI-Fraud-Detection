import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Moon, Sun, ChevronRight } from 'lucide-react';
import { logout } from '../utils/mockAuth';
import { logoutApi } from '../utils/api';
import { useTheme } from '../utils/useTheme';

const Navbar = ({ authStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch(e) {
      console.warn("Backend logout failed", e);
    }
    logout();
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Check Transaction', path: '/transaction' },
    ...(authStatus ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'History', path: '/history' },
    ] : []),
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-navy-2/95 backdrop-blur-xl border-b border-navy-border shadow-card'
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
          : isDark
            ? 'bg-transparent border-b border-transparent'
            : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-teal/10 border border-teal/30' : 'bg-primary-50 border border-primary-200'}`}>
              <Shield className={`h-5 w-5 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-teal/5' : 'bg-primary-100/50'}`} />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              UPI<span className={isDark ? 'text-teal' : 'text-primary-600'}>Shield</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? isDark
                        ? 'text-teal bg-teal/10'
                        : 'text-primary-600 bg-primary-50'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isDark ? 'bg-teal' : 'bg-primary-600'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {authStatus ? (
              <button
                onClick={handleLogout}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-danger hover:bg-danger/10'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                  isDark
                    ? 'bg-teal text-navy hover:bg-teal-dim shadow-teal-sm'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                }`}
              >
                Sign In <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={`md:hidden border-t ${isDark ? 'bg-navy-2 border-navy-border' : 'bg-white border-gray-200'}`}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? isDark ? 'text-teal bg-teal/10' : 'text-primary-600 bg-primary-50'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {authStatus ? (
              <button
                onClick={handleLogout}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'text-slate-400 hover:text-danger hover:bg-danger/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDark ? 'text-teal bg-teal/10' : 'text-primary-600 bg-primary-50'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
