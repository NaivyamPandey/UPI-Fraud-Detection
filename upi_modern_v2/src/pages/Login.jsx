import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { loginApi, signupApi } from '../utils/api';
import { useTheme } from '../utils/useTheme';

const InputField = ({ label, icon: Icon, error, ...props }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div>
      <label className={`block text-xs font-mono font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
          </div>
        )}
        <input
          {...props}
          className={`${Icon ? 'pl-10' : 'pl-4'} ${props.suffix ? 'pr-10' : 'pr-4'} block w-full rounded-xl text-sm p-3.5 transition-all border ${
            error
              ? isDark ? 'border-red-500/50 bg-red-500/5 text-white focus:border-red-400 focus:ring-1 focus:ring-red-400/30' : 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300'
              : isDark ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100'
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
};

const Login = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrs, setFieldErrs] = useState({});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await loginApi(loginUsername, loginPassword);
    if (res && res.token) {
      window.dispatchEvent(new Event('authChange'));
      navigate('/dashboard');
    } else {
      setErrorMsg(res?.error || 'Invalid credentials');
    }
  };

  const handleCreateAccount = async () => {
    setFieldErrs({});
    setErrorMsg('');
    setSuccessMsg('');
    let errs = {};
    if (!signupEmail) errs.emailError = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.emailError = 'Valid email required.';
    if (!signupUsername) errs.usernameError = 'Username is required.';
    else if (signupUsername.length < 3) errs.usernameError = 'Min 3 characters.';
    if (!signupPassword) errs.passwordError = 'Password is required.';
    else if (signupPassword.length < 6) errs.passwordError = 'Min 6 characters.';
    if (!confirmPassword) errs.confirmPasswordError = 'Please confirm password.';
    if (signupPassword !== confirmPassword) errs.confirmPasswordError = 'Passwords do not match.';
    if (Object.keys(errs).length > 0) { setFieldErrs(errs); return; }

    const res = await signupApi({ name: signupUsername, email: signupEmail, password: signupPassword });
    if (res && res.message === 'Registration successful') {
      setSuccessMsg('Account created! Sign in to continue.');
      setTimeout(() => { setActiveTab('login'); resetSignup(); }, 2000);
    } else {
      setErrorMsg(res?.error || 'Signup failed');
    }
  };

  const resetSignup = () => {
    setSignupEmail(''); setSignupUsername(''); setSignupPassword('');
    setConfirmPassword(''); setFieldErrs({});
    setErrorMsg(''); setSuccessMsg('');
  };

  return (
    <div className="max-w-md mx-auto w-full py-8 animate-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-teal/10 border border-teal/30' : 'bg-primary-50 border border-primary-200'}`}>
          <ShieldCheck className={`h-7 w-7 ${isDark ? 'text-teal' : 'text-primary-600'}`} />
        </div>
        <h2 className={`font-display text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Sign in or create a new account</p>
      </div>

      {/* Card */}
      <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-navy-card border-navy-border' : 'bg-white border-gray-200 shadow-sm'}`}>
        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-navy-border' : 'border-gray-100'}`}>
          {['login', 'signup'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 text-sm font-mono font-bold tracking-wider uppercase transition-colors ${
                activeTab === tab
                  ? isDark ? 'text-teal border-b-2 border-teal bg-teal/5' : 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                  : isDark ? 'text-slate-600 hover:text-slate-400 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => { setActiveTab(tab); setErrorMsg(''); setSuccessMsg(''); if (tab === 'signup') resetSignup(); }}
            >
              {tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="p-7">
          {/* Alerts */}
          {errorMsg && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 text-sm border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 text-sm border ${isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Login form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in">
              <div>
                <label className={`block text-xs font-mono font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>USERNAME</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text" required placeholder="Enter username"
                    value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                    className={`pl-10 pr-4 block w-full rounded-xl text-sm p-3.5 border transition-all ${isDark ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-mono font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>PASSWORD</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'} required placeholder="Enter password"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className={`pl-10 pr-10 block w-full rounded-xl text-sm p-3.5 border transition-all ${isDark ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100'}`}
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${isDark ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}>
                Sign In
              </button>
              <p className={`text-center text-xs font-mono ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                Demo: admin / password123
              </p>
            </form>
          )}

          {/* Signup form */}
          {activeTab === 'signup' && (
            <div className="space-y-4 animate-in">
              {/* Fields */}
              {[
                { label: 'EMAIL ADDRESS', icon: Mail, type: 'email', val: signupEmail, setter: setSignupEmail, err: fieldErrs.emailError, ph: 'you@example.com' },
                { label: 'USERNAME', icon: User, type: 'text', val: signupUsername, setter: setSignupUsername, err: fieldErrs.usernameError, ph: 'Choose a username' },
              ].map(({ label, icon: Icon, type, val, setter, err, ph }) => (
                <div key={label}>
                  <label className={`block text-xs font-mono font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Icon className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                    </div>
                    <input type={type} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                      className={`pl-10 pr-4 block w-full rounded-xl text-sm p-3.5 border transition-all ${err ? isDark ? 'border-red-500/50 bg-red-500/5 text-white' : 'border-red-300 bg-red-50' : isDark ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100'} disabled:opacity-50`}
                    />
                  </div>
                  {err && <p className="mt-1.5 text-xs text-red-400 font-mono">{err}</p>}
                </div>
              ))}

              {[
                { label: 'PASSWORD', show: showSignupPassword, setShow: setShowSignupPassword, val: signupPassword, setter: setSignupPassword, err: fieldErrs.passwordError, ph: 'Create password' },
                { label: 'CONFIRM PASSWORD', show: showConfirmPassword, setShow: setShowConfirmPassword, val: confirmPassword, setter: setConfirmPassword, err: fieldErrs.confirmPasswordError, ph: 'Confirm password' },
              ].map(({ label, show, setShow, val, setter, err, ph }) => (
                <div key={label}>
                  <label className={`block text-xs font-mono font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                    </div>
                    <input type={show ? 'text' : 'password'} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                      className={`pl-10 pr-10 block w-full rounded-xl text-sm p-3.5 border transition-all ${err ? isDark ? 'border-red-500/50 bg-red-500/5 text-white' : 'border-red-300 bg-red-50' : isDark ? 'border-navy-border bg-navy-2 text-white focus:border-teal/50 focus:ring-1 focus:ring-teal/20' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100'} disabled:opacity-50`}
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {err && <p className="mt-1.5 text-xs text-red-400 font-mono">{err}</p>}
                </div>
              ))}

              <button type="button" onClick={handleCreateAccount}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 mt-4 ${isDark ? 'bg-teal text-navy shadow-teal-sm hover:bg-teal-dim' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}>
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
