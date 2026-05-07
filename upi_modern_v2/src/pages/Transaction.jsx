import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, IndianRupee, Clock, Smartphone, Loader2, RotateCcw, Calendar, AlertCircle, Calculator, Info } from 'lucide-react';
import { predictTransaction } from '../utils/api';
import { RESULT_STORAGE_KEY } from '../utils/helpers';
import { useTheme } from '../utils/useTheme';

const getLocalDateString = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const getLocalTimeString = () => {
  const d = new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const Transaction = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    amount: '', 
    avgTransactionAmount: '',
    amountToAvgRatio: '0.00',
    failedAttempts: '0',
    senderUpi: '', 
    receiverUpi: '', 
    transactionDate: getLocalDateString(), 
    transactionTime: getLocalTimeString(), 
    deviceType: 'mobile'
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dateTimeError, setDateTimeError] = useState(null);
  const navigate = useNavigate();

  // Auto-calculate the Amount to Average Ratio
  useEffect(() => {
    const amt = parseFloat(formData.amount);
    const avg = parseFloat(formData.avgTransactionAmount);
    
    if (!isNaN(amt) && !isNaN(avg) && avg > 0) {
      setFormData(prev => ({ 
        ...prev, 
        amountToAvgRatio: (amt / avg).toFixed(2) 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        amountToAvgRatio: '0.00' 
      }));
    }
  }, [formData.amount, formData.avgTransactionAmount]);

  // Validate Date and Time
  useEffect(() => {
    if (!formData.transactionDate || !formData.transactionTime) return;

    const today = getLocalDateString();
    
    if (formData.transactionDate > today) {
      setDateTimeError("Future dates are not allowed");
    } else if (formData.transactionDate === today) {
      if (formData.transactionTime > getLocalTimeString()) {
        setDateTimeError("You can only select current or past time");
      } else {
        setDateTimeError(null);
      }
    } else {
      setDateTimeError(null);
    }
  }, [formData.transactionDate, formData.transactionTime]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateTimeError) return;
    
    setIsAnalyzing(true);
    
    try {
      // Map form data to ML model required structure
      const trans_hour = formData.transactionTime 
        ? parseInt(formData.transactionTime.split(':')[0], 10) 
        : 0;

      const mlData = {
        Amount: parseFloat(formData.amount) || 0,
        trans_hour: trans_hour,
        FailedAttempts: parseInt(formData.failedAttempts, 10) || 0,
        Amount_to_Avg_Ratio: parseFloat(formData.amountToAvgRatio) || 0,
        AvgTransactionAmount: parseFloat(formData.avgTransactionAmount) || 0
      };

      const result = await predictTransaction({ ...formData, ...mlData });
      
      if (result && result.prediction != null) {
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify({
          prediction: result.prediction, 
          confidence: result.confidence,
          id: result.id,
          timestamp: result.timestamp,
          ...formData, 
          ...mlData,
          fromBackend: true
        }));
      }
    } catch (e) { 
      console.error(e); 
    }
    
    setTimeout(() => {
      setIsAnalyzing(false);
      const params = new URLSearchParams();
      // Only set necessary params for fallback/display
      ['amount', 'senderUpi', 'receiverUpi', 'deviceType', 'transactionDate', 'transactionTime'].forEach((key) => { 
        if (formData[key]) params.set(key, String(formData[key])); 
      });
      navigate(`/result?${params.toString()}`);
    }, 800);
  };

  const inputClass = `block w-full rounded-xl text-sm p-3.5 border transition-all font-mono ${
    isDark
      ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20 placeholder:text-slate-700'
      : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 placeholder:text-gray-300'
  }`;

  const labelClass = `flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`;

  // Reusable tooltip hint icon
  const TooltipIcon = ({ title }) => (
    <div className="group relative flex items-center cursor-help">
      <Info className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-48 p-2 rounded-lg text-xs font-sans normal-case z-10 text-center shadow-lg group-hover:block transition-all ${
        isDark ? 'bg-navy-3 text-slate-300 border border-navy-border' : 'bg-gray-800 text-white'
      }`}>
        {title}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent ${
          isDark ? 'border-t-navy-3' : 'border-t-gray-800'
        }`} />
      </div>
    </div>
  );

  const todayStr = getLocalDateString();
  const maxTimePolicy = formData.transactionDate === todayStr ? getLocalTimeString() : undefined;

  return (
    <div className="max-w-3xl mx-auto py-4 animate-in">
      {/* Page title */}
      <div className="mb-8">
        <p className={`text-xs font-mono font-bold tracking-widest mb-2 ${isDark ? 'text-teal' : 'text-primary-600'}`}>FRAUD ANALYSIS</p>
        <h1 className={`font-display text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Check Transaction
        </h1>
        <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          Enter UPI transaction details to assess risk and detect potential fraud.
        </p>
      </div>

      <div className={`rounded-2xl border transition-colors ${isDark ? 'bg-navy-card border-navy-border' : 'bg-white border-gray-200 shadow-sm'}`}>
        {/* Card header */}
        <div className={`px-8 py-5 border-b flex justify-between items-center ${isDark ? 'border-navy-border' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-teal/10' : 'bg-primary-50'}`}>
              <Search className={`h-4 w-4 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
            </div>
            <span className={`font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Details</span>
          </div>
          <button 
            type="button"
            onClick={() => setFormData({ 
              amount: '12500', avgTransactionAmount: '350', amountToAvgRatio: '35.71', 
              failedAttempts: '3', senderUpi: 'suspect@upi', receiverUpi: 'merchant@upi', 
              transactionDate: todayStr, 
              transactionTime: getLocalTimeString(), deviceType: 'mobile' 
            })}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isDark ? 'border-navy-border text-teal hover:bg-teal/5' : 'border-gray-200 text-primary-600 hover:bg-primary-50'
            }`}
          >
            Load Demo Data
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section: Financial & ML Features */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Financial Dimensions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Transaction Amount */}
              <div>
                <label className={labelClass}>
                  Amount (INR)
                  <TooltipIcon title="The exact value of the current transaction attempting to be processed." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <IndianRupee className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input type="number" step="0.01" min="0.01" name="amount" required placeholder="e.g. 500.00"
                    value={formData.amount} onChange={handleChange}
                    className={`pl-10 ${inputClass} text-lg font-bold`}
                  />
                </div>
              </div>
              
              {/* Average Transaction Amount */}
              <div>
                <label className={labelClass}>
                  Avg Txn Amount
                  <TooltipIcon title="The historical average transaction value for this sender over the last 30 days." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calculator className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input type="number" step="0.01" min="0.01" name="avgTransactionAmount" required placeholder="e.g. 1500.00"
                    value={formData.avgTransactionAmount} onChange={handleChange}
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
              </div>

              {/* Amount to Average Ratio */}
              <div>
                <label className={labelClass}>
                  Amount/Avg Ratio
                  <TooltipIcon title="Automatically calculated: Current Amount ÷ Average Amount. Unusually high ratios often flag potential anomalies." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <AlertCircle className={`h-4 w-4 ${isDark ? 'text-teal' : 'text-primary-500'}`} />
                  </div>
                  <input type="number" readOnly
                    value={formData.amountToAvgRatio}
                    className={`pl-10 ${inputClass} opacity-80 cursor-not-allowed ${
                      Number(formData.amountToAvgRatio) > 10 ? (isDark ? 'text-red-400 border-red-500/30' : 'text-red-600 border-red-200') : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`w-full border-t ${isDark ? 'border-navy-border' : 'border-gray-100'}`} />

          {/* Section: Contextual Features */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Transaction Context</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Sender UPI ID</label>
                <input type="text" name="senderUpi" required placeholder="sender@upi"
                  value={formData.senderUpi} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Receiver UPI ID</label>
                <input type="text" name="receiverUpi" required placeholder="merchant@upi"
                  value={formData.receiverUpi} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Transaction Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input type="date" name="transactionDate" required
                    max={todayStr}
                    value={formData.transactionDate} onChange={handleChange}
                    className={`pl-10 ${inputClass} ${dateTimeError && formData.transactionDate > todayStr ? (isDark ? 'border-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'border-red-500 ring-1 ring-red-500') : ''}`}
                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Transaction Time (24h)
                  <TooltipIcon title="The time of transaction. ML uses the exact hour (0-23) to detect anomalous late-night transfers." />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Clock className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input type="time" name="transactionTime" required
                    max={maxTimePolicy}
                    value={formData.transactionTime} onChange={handleChange}
                    className={`pl-10 ${inputClass} ${dateTimeError && formData.transactionDate === todayStr && formData.transactionTime > getLocalTimeString() ? (isDark ? 'border-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'border-red-500 ring-1 ring-red-500') : ''}`}
                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  />
                </div>
              </div>

              {/* Show Date/Time Error full-width if exists */}
              {dateTimeError && (
                <div className="md:col-span-2 -mt-4 mb-2 flex items-center gap-2 text-sm font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  {dateTimeError}
                </div>
              )}

              <div>
                <label className={labelClass}>
                  Failed Attempts (24h)
                  <TooltipIcon title="Number of failed transaction attempts in the recent timeframe preceding this transaction." />
                </label>
                <div className="relative">
                  <input type="number" min="0" step="1" name="failedAttempts" required
                    value={formData.failedAttempts} onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Device Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Smartphone className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <select name="deviceType" value={formData.deviceType} onChange={handleChange}
                    className={`pl-10 ${inputClass}`}>
                    <option value="mobile">Mobile App</option>
                    <option value="web">Web Browser</option>
                    <option value="unknown">Unknown / Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex justify-end gap-3 pt-6 mt-4 border-t ${isDark ? 'border-navy-border' : 'border-gray-100'}`}>
            <button type="button"
              onClick={() => setFormData({ 
                amount: '', avgTransactionAmount: '', amountToAvgRatio: '0.00', failedAttempts: '0',
                senderUpi: '', receiverUpi: '', transactionDate: getLocalDateString(), transactionTime: getLocalTimeString(), deviceType: 'mobile' 
              })}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all ${isDark ? 'border-navy-border text-slate-400 hover:text-white hover:border-slate-600 bg-white/5' : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
            <button type="submit" disabled={isAnalyzing || !!dateTimeError}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none ${isDark ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}>
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Model...</>
              ) : (
                <><Search className="w-4 h-4" /> Analyze Transaction</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transaction;
