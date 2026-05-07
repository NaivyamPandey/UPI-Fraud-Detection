import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, CheckCircle, Search, Clock } from 'lucide-react';
import { getDashboardStats } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import { useTheme } from '../utils/useTheme';

const StatCard = ({ label, value, icon: Icon, color, loading, isDark }) => {
  const colorMap = {
    teal: { icon: isDark ? 'text-teal' : 'text-primary-600', bg: isDark ? 'bg-teal/10' : 'bg-primary-50', border: isDark ? 'border-teal/20' : 'border-primary-100', val: isDark ? 'text-teal' : 'text-primary-600' },
    red: { icon: 'text-red-400', bg: isDark ? 'bg-red-500/10' : 'bg-red-50', border: isDark ? 'border-red-500/20' : 'border-red-100', val: 'text-red-400' },
    green: { icon: 'text-green-400', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', border: isDark ? 'border-green-500/20' : 'border-green-100', val: 'text-green-400' },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <div className={`relative p-6 rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 ${isDark ? `bg-navy-card border-navy-border hover:${c.border}` : `bg-white border-gray-100 hover:shadow-md`}`}>
      {/* Large bg icon */}
      <div className={`absolute -right-4 -top-4 opacity-5`}>
        <Icon className="h-28 w-28" />
      </div>
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        <p className={`text-xs font-mono font-bold tracking-widest uppercase mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>{label}</p>
        {loading ? (
          <div className={`h-9 w-24 rounded-lg animate-pulse ${isDark ? 'bg-navy-border' : 'bg-gray-200'}`} />
        ) : (
          <p className={`text-4xl font-display font-extrabold tracking-tight ${c.val}`}>{value}</p>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ totalTransactions: '--', fraudDetected: '--', safeTransactions: '--' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      if (data) {
        setStats({
          totalTransactions: formatNumber(data.totalTransactions),
          fraudDetected: formatNumber(data.fraudDetected),
          safeTransactions: formatNumber(data.safeTransactions),
        });
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-mono font-bold tracking-widest mb-2 ${isDark ? 'text-teal' : 'text-primary-600'}`}>OVERVIEW</p>
          <h1 className={`font-display text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Transaction monitoring and risk assessment overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard label="Total Scanned" value={stats.totalTransactions} icon={Activity} color="teal" loading={loading} isDark={isDark} />
        <StatCard label="Fraud Detected" value={stats.fraudDetected} icon={ShieldAlert} color="red" loading={loading} isDark={isDark} />
        <StatCard label="Safe Transactions" value={stats.safeTransactions} icon={CheckCircle} color="green" loading={loading} isDark={isDark} />
      </div>

      {/* Quick actions */}
      <div className={`rounded-2xl border p-8 transition-colors ${isDark ? 'bg-navy-card border-navy-border' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-teal/10' : 'bg-primary-50'}`}>
          <Search className={`h-6 w-6 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
        </div>
        <h3 className={`font-display font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          Check a specific transaction or browse recent history.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/transaction"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${isDark ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}>
            <Search className="w-4 h-4" /> Check Transaction
          </Link>
          <Link to="/history"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 border ${isDark ? 'border-navy-border text-slate-300 hover:text-white hover:border-teal/30 bg-white/5' : 'border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-white'}`}>
            <Clock className="w-4 h-4" /> View History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
