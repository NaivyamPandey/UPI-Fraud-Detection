import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Loader2, Inbox } from 'lucide-react';
import { getHistory, clearHistoryApi } from '../utils/api';
import { getLocalHistory, clearLocalHistory } from '../utils/helpers';
import { useTheme } from '../utils/useTheme';

const History = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getHistory().then(data => {
      let combinedData = [];
      const localData = getLocalHistory();
      if (data && data.length > 0) combinedData = [...data];
      localData.forEach(localTxn => {
        if (!combinedData.find(t => t.id === localTxn.id)) combinedData.push(localTxn);
      });
      combinedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistoryData(combinedData);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleClear = async () => { 
    clearLocalHistory(); 
    try {
      await clearHistoryApi();
    } catch (e) {
      console.error('Failed to clear backend history', e);
    }
    loadData(); 
  };

  const getPredBadge = (pred) => {
    if (pred === 'Fraud') return isDark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-700 bg-red-50 border-red-200';
    if (pred === 'Legit') return isDark ? 'text-teal bg-teal/10 border-teal/20' : 'text-green-700 bg-green-50 border-green-200';
    if (pred === 'Suspicious') return isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200';
    return isDark ? 'text-slate-400 bg-white/5 border-navy-border' : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className={`text-xs font-mono font-bold tracking-widest mb-2 ${isDark ? 'text-teal' : 'text-primary-600'}`}>TRANSACTION LOG</p>
          <h1 className={`font-display text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>History</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Past transactions and their risk assessments.</p>
        </div>
        {historyData.length > 0 && (
          <button onClick={handleClear}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}>
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-navy-card border-navy-border' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={isDark ? 'bg-navy-2 border-b border-navy-border' : 'bg-gray-50 border-b border-gray-100'}>
                {['ID', 'Amount', 'Sender', 'Receiver', 'Prediction', 'Confidence', 'Time'].map(h => (
                  <th key={h} className={`px-6 py-4 text-left text-xs font-mono font-bold tracking-widest uppercase ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-navy-border' : 'divide-gray-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-16 text-center ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                    <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-mono">Loading history...</p>
                  </td>
                </tr>
              ) : historyData.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-16 text-center ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                    <Inbox className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-mono">No transactions in history.</p>
                  </td>
                </tr>
              ) : historyData.map((row, idx) => (
                <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'}`}>
                  <td className={`px-6 py-4 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{row.id || '--'}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹ {row.amount || '--'}</td>
                  <td className={`px-6 py-4 text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{row.senderUpi || '--'}</td>
                  <td className={`px-6 py-4 text-sm font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{row.receiverUpi || '--'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${getPredBadge(row.prediction)}`}>
                      {row.prediction || '--'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-mono font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {row.confidence != null ? `${row.confidence}%` : '--'}
                  </td>
                  <td className={`px-6 py-4 text-xs font-mono ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                    {row.timestamp || row.transactionTime || (row.createdAt ? new Date(row.createdAt).toLocaleString() : '--')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
