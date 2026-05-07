import React from 'react';
import { Shield, Github } from 'lucide-react';
import { useTheme } from '../utils/useTheme';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t mt-auto transition-colors duration-200 ${isDark ? 'bg-navy-2 border-navy-border' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
            <span className={`text-sm font-display font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              UPI<span className={isDark ? 'text-teal' : 'text-primary-600'}>Shield</span>
            </span>
          </div>
          <p className={`text-xs font-mono ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
            &copy; {new Date().getFullYear()} · Real-time UPI fraud detection
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
