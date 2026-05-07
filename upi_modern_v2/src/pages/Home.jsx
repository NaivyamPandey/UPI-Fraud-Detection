import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ShieldCheck, Zap, ArrowRight, Lock, Eye, BarChart3 } from 'lucide-react';
import { useTheme } from '../utils/useTheme';

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const features = [
    { title: "Real-time Assessment", desc: "Continuous scoring surfaces high-risk transactions the moment they occur.", icon: Activity, accent: 'text-teal-500' },
    { title: "Fraud Indicators", desc: "Explainable signals give investigators the context to act decisively.", icon: AlertTriangle, accent: 'text-red-400' },
    { title: "Transaction Context", desc: "Device, temporal, and behavioral signals grouped for efficient review.", icon: Eye, accent: 'text-blue-400' },
    { title: "Dashboard Insights", desc: "Aggregates, trends, and alerts built for security operations teams.", icon: BarChart3, accent: 'text-amber-400' },
  ];

  return (
    <div className="space-y-20 py-4">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div className={`absolute inset-0 rounded-3xl ${isDark ? 'bg-grid-pattern opacity-30' : 'bg-gradient-to-br from-primary-50 to-teal-50/30'}`} />
        {isDark && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-navy-card via-navy-2 to-navy-3" />
        )}
        {/* Glow blob */}
        {isDark && (
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 bg-teal-DEFAULT pointer-events-none" />
        )}

        <div className={`relative rounded-3xl border ${isDark ? 'border-navy-border' : 'border-primary-100'} px-8 py-16 md:py-24 lg:px-16 flex flex-col md:flex-row items-center gap-14`}>
          {/* Text */}
          <div className="flex-1 space-y-7">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border ${isDark ? 'bg-teal/10 border-teal/20 text-teal' : 'bg-primary-50 border-primary-200 text-primary-700'}`}>
              <Zap className="h-3 w-3" />
              SMART FRAUD DETECTION
            </div>

            <h1 className={`font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Explore UPI<br />
              <span className={isDark ? 'text-teal' : 'text-primary-600'}>Transaction</span><br />
              Risk Indicators
            </h1>

            <p className={`text-lg leading-relaxed max-w-xl ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              UPI Shield provides real-time risk assessment and fraud indicators for UPI transactions. 
              Actionable insights, alerts, and risk scores to support investigation and decision-making.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim'
                    : 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                }`}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/transaction"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 border ${
                  isDark
                    ? 'border-navy-border text-slate-300 hover:text-white hover:border-teal/50 bg-white/5'
                    : 'border-gray-200 text-gray-700 hover:text-gray-900 hover:border-primary-200 bg-white'
                }`}
              >
                Check a Transaction
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div className="flex-1 flex justify-center">
            <div className={`relative w-full max-w-xs animate-float rounded-2xl p-8 border ${isDark ? 'bg-navy-card border-navy-border shadow-card-lg' : 'bg-white border-primary-100 shadow-xl'}`}>
              <div className="flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? 'bg-teal/10 border border-teal/30' : 'bg-primary-50 border border-primary-200'}`}>
                  <ShieldCheck className={`w-10 h-10 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
                </div>
              </div>
              <h3 className={`font-display font-bold text-xl text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>UPI Shield</h3>
              <p className={`text-sm text-center mb-6 font-mono ${isDark ? 'text-teal' : 'text-primary-600'}`}>Active Protection</p>
              
              {/* Mini stats */}
              {[
                { label: 'Transactions Scanned', val: '12.4K', color: isDark ? 'text-white' : 'text-gray-900' },
                { label: 'Fraud Detected', val: '347', color: 'text-red-400' },
                { label: 'Safe Verified', val: '12,053', color: isDark ? 'text-teal' : 'text-primary-600' },
              ].map((s, i) => (
                <div key={i} className={`flex justify-between items-center py-2.5 border-t text-sm ${isDark ? 'border-navy-border' : 'border-gray-100'}`}>
                  <span className={isDark ? 'text-slate-500 font-mono text-xs' : 'text-gray-500 font-mono text-xs'}>{s.label}</span>
                  <span className={`font-display font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="text-center mb-12">
          <p className={`text-xs font-mono font-bold tracking-widest mb-3 ${isDark ? 'text-teal' : 'text-primary-600'}`}>HOW IT WORKS</p>
          <h2 className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Three Steps to Clarity</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Analyze', desc: 'Collect transaction telemetry and run risk scoring to produce concise analysis results.', icon: Activity, color: 'blue' },
            { step: '02', title: 'Detect', desc: 'Identify anomalous patterns and flag transactions that warrant further review.', icon: AlertTriangle, color: 'red' },
            { step: '03', title: 'Act', desc: 'Present actionable alerts and context to help investigators prioritize response.', icon: ShieldCheck, color: 'green' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div
              key={step}
              className={`relative p-8 rounded-2xl border transition-all group hover:-translate-y-1 ${
                isDark
                  ? 'bg-navy-card border-navy-border hover:border-teal/30 hover:shadow-teal-sm'
                  : 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className={`font-mono text-5xl font-bold mb-6 opacity-10 ${isDark ? 'text-teal' : 'text-primary-400'}`}>{step}</div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                color === 'blue' ? isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600' :
                color === 'red' ? isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600' :
                isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className={`font-display font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={`rounded-3xl p-10 border ${isDark ? 'bg-navy-card border-navy-border' : 'bg-gray-50 border-gray-100'}`}>
        <div className="text-center mb-10">
          <p className={`text-xs font-mono font-bold tracking-widest mb-3 ${isDark ? 'text-teal' : 'text-primary-600'}`}>CAPABILITIES</p>
          <h2 className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Key Features</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ title, desc, icon: Icon, accent }, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl border transition-all hover:-translate-y-0.5 ${
                isDark ? 'bg-navy-2 border-navy-border hover:border-teal/20' : 'bg-white border-gray-200 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-5 h-5 mb-4 ${accent}`} />
              <h4 className={`font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
