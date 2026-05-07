import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Info, IndianRupee, Search, ArrowLeft, Cpu } from 'lucide-react';
import { generateMockPrediction, RESULT_STORAGE_KEY, saveLocalHistory } from '../utils/helpers';
import { useTheme } from '../utils/useTheme';

const Result = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const details = {
      amount: searchParams.get('amount') || '',
      senderUpi: searchParams.get('senderUpi') || '',
      receiverUpi: searchParams.get('receiverUpi') || '',
      transactionTime: searchParams.get('transactionTime') || '',
      deviceType: searchParams.get('deviceType') || '',
    };
    let prediction = '', confidence = 0, fromBackend = false, finalDetails = { ...details };
    try {
      const stored = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // We do NOT remove the storage key here anymore to prevent 
        // React StrictMode double-fire from losing the data!
        
        if (parsed.prediction != null && parsed.confidence != null) {
          prediction = String(parsed.prediction);
          confidence = Number(parsed.confidence);
          fromBackend = parsed.fromBackend === true;
          
          // Merge all keys except the metadata ones to ensure we don't miss FailedAttempts, etc
          Object.keys(parsed).forEach(k => {
             if (!['prediction', 'confidence', 'fromBackend', 'id', 'timestamp'].includes(k)) {
                 finalDetails[k] = parsed[k];
             }
          });
          
          if (parsed.id !== undefined) finalDetails.id = parsed.id;
          if (parsed.timestamp !== undefined) finalDetails.timestamp = parsed.timestamp;
        }
      }
    } catch (e) {}

    // REAL PREDICTION ONLY - removed generateMockPrediction fallback
    if (!prediction) { return; } 

    if (!finalDetails.id) {
      finalDetails.id = 'TXN' + Date.now().toString().slice(-6);
      finalDetails.timestamp = new Date().toLocaleString();
      
      // Update the sessionStorage with the newly minted ID so we don't duplicate on StrictMode's 2nd pass
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify({
        prediction, confidence, fromBackend, ...finalDetails
      }));

      saveLocalHistory({ 
         id: finalDetails.id, amount: finalDetails.amount, senderUpi: finalDetails.senderUpi, 
         receiverUpi: finalDetails.receiverUpi, timestamp: finalDetails.timestamp, 
         deviceType: finalDetails.deviceType, prediction, confidence, fromBackend 
      });
    }

    setResult({ prediction, confidence, fromBackend, details: finalDetails });
  }, [searchParams]);

  if (!result) return null;
  const { prediction, confidence, fromBackend, details } = result;

  const isFraud = prediction === 'Fraud';
  const isLegit = prediction === 'Legit';

  const predConfig = isFraud
    ? { label: 'FRAUD DETECTED', color: 'text-red-400', bg: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200', icon: <AlertTriangle className="h-10 w-10 text-red-400" />, bar: 'bg-red-500' }
    : isLegit
    ? { label: 'LEGITIMATE', color: isDark ? 'text-teal' : 'text-green-600', bg: isDark ? 'bg-teal/10 border-teal/20' : 'bg-green-50 border-green-200', icon: <ShieldCheck className={`h-10 w-10 ${isDark ? 'text-teal' : 'text-green-600'}`} />, bar: isDark ? 'bg-teal' : 'bg-green-500' }
    : { label: 'SUSPICIOUS', color: 'text-amber-400', bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200', icon: <Info className="h-10 w-10 text-amber-400" />, bar: 'bg-amber-500' };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in">
      {/* Header */}
      <div>
        <p className={`text-xs font-mono font-bold tracking-widest mb-2 ${isDark ? 'text-teal' : 'text-primary-600'}`}>ANALYSIS RESULT</p>
        <h1 className={`font-display text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>Risk Assessment</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Review the fraud analysis for this transaction.</p>
      </div>

      {/* Result card */}
      <div className={`rounded-2xl border p-8 transition-colors ${isDark ? `bg-navy-card ${predConfig.bg.split(' ')[1]}` : predConfig.bg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? predConfig.bg : predConfig.bg}`}>
            {predConfig.icon}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-mono font-bold tracking-widest mb-1 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>ASSESSMENT</p>
            <h2 className={`font-display text-4xl font-black tracking-tight ${predConfig.color}`}>{prediction}</h2>
          </div>
          {/* Confidence */}
          <div className="w-full sm:w-40">
            <p className={`text-xs font-mono font-bold tracking-widest mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>CONFIDENCE</p>
            <div className={`h-2 rounded-full ${isDark ? 'bg-navy-border' : 'bg-gray-200'} overflow-hidden`}>
              <div className={`h-full rounded-full transition-all ${predConfig.bar}`} style={{ width: `${confidence}%` }} />
            </div>
            <p className={`text-right text-lg font-mono font-bold mt-1.5 ${predConfig.color}`}>{confidence}%</p>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-navy-card border-navy-border' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-navy-border bg-navy-2' : 'border-gray-100 bg-gray-50'}`}>
          <h3 className={`font-display font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Search className={`w-4 h-4 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
            Transaction Details
          </h3>
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${isDark ? 'bg-navy-3 border-navy-border text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}>
            <Cpu className="w-3 h-3" />
            {fromBackend ? 'ML Backend' : 'Demo Mock'}
          </span>
        </div>
        <div className={`divide-y ${isDark ? 'divide-navy-border' : 'divide-gray-100'}`}>
          {[
            details.id && { label: 'Transaction ID', value: details.id, mono: true },
            { label: 'Amount', value: details.amount ? `₹ ${details.amount}` : '--', bold: true },
            { label: 'Sender UPI', value: details.senderUpi || '--', mono: true },
            { label: 'Receiver UPI', value: details.receiverUpi || '--', mono: true },
            { label: 'Time', value: details.transactionTime || details.timestamp || '--' },
            { label: 'Failed Attempts', value: (details.failedAttempts !== undefined && details.failedAttempts !== '') ? details.failedAttempts : '--' },
            { label: 'Avg User Txn', value: details.avgTransactionAmount ? `₹ ${details.avgTransactionAmount}` : '--' },
            { label: 'Device', value: details.deviceType || '--', capitalize: true },
          ].filter(Boolean).map(({ label, value, mono, bold, capitalize }, i) => (
            <div key={i} className={`px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'} transition-colors`}>
              <span className={`text-xs font-mono font-bold tracking-widest uppercase ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>{label}</span>
              <span className={`text-sm ${bold ? 'font-bold text-lg' : 'font-medium'} ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between pt-2">
        <Link to="/transaction"
          className={`flex items-center gap-2 text-sm font-mono font-bold transition-colors ${isDark ? 'text-slate-500 hover:text-teal' : 'text-gray-400 hover:text-primary-600'}`}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Link to="/transaction"
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${isDark ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}>
          <Search className="w-4 h-4" /> Check Another
        </Link>
      </div>
    </div>
  );
};

export default Result;
