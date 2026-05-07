const BACKEND_URL = 'http://localhost:5000'; // Real server route
const API_PREFIX = '/api';
const PREDICT_PATH = 'predict';

export const getBaseUrl = () => (BACKEND_URL || '').replace(/\/$/, '');

export const isBackendConfigured = () => getBaseUrl().length > 0;

async function request(path, options = {}) {
  const base = getBaseUrl();
  if (!base) return null;

  const url = base + (path.indexOf('/') === 0 ? path : API_PREFIX + '/' + path);
  const token = sessionStorage.getItem('upiShieldToken');

  const opts = {
    method: options.method || 'GET',
    credentials: 'true' ? 'include' : 'same-origin', // Ensure we use include
    headers: {
      'Content-Type': 'application/json',
      // Authorization header is no longer needed; httpOnly cookie will be sent automatically
      ...options.headers
    }
  };
  
  if (options.body && opts.method !== 'GET') {
    opts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    
    if (!res.ok) {
      const error = new Error(data.error || 'API error: ' + res.status);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (err) {
    console.warn('UPI Shield API request failed:', err.message || err);
    // Return the data if it exists (contains error msg) or null
    return err.data || null;
  }
}

export async function predictTransaction(data) {
  if (!isBackendConfigured()) return null;
  const result = await request(PREDICT_PATH, {
    method: 'POST',
    body: {
      amount: data.amount,
      senderUpi: data.senderUpi,
      receiverUpi: data.receiverUpi,
      transactionTime: data.transactionTime,
      deviceType: data.deviceType,
      // ML Context features
      Amount: data.Amount,
      trans_hour: data.trans_hour,
      FailedAttempts: data.FailedAttempts,
      Amount_to_Avg_Ratio: data.Amount_to_Avg_Ratio,
      AvgTransactionAmount: data.AvgTransactionAmount
    }
  });
  if (result && typeof result.prediction === 'string' && typeof result.confidence === 'number') {
    return result;
  }
  return null;
}

export async function getDashboardStats() {
  if (!isBackendConfigured()) return null;
  const result = await request('dashboard/stats');
  if (result && typeof result.totalTransactions === 'number') {
    return result;
  }
  return null;
}

export async function getHistory() {
  if (!isBackendConfigured()) return null;
  const result = await request('history');
  if (Array.isArray(result)) {
    return result;
  }
  return null;
}

export async function clearHistoryApi() {
  if (!isBackendConfigured()) return null;
  return request('history/clear', { method: 'DELETE' });
}

export async function loginApi(email, password) {
  if (!isBackendConfigured()) return null;
  const result = await request('auth/login', {
    method: 'POST',
    body: { email, password }
  });
  if (result && result.token) {
     sessionStorage.setItem('upiShieldToken', result.token); 
     if (result.user) sessionStorage.setItem('upiShieldUser', JSON.stringify(result.user));
  }
  return result;
}

export function signupApi(data) {
  if (!isBackendConfigured()) return Promise.resolve(null);
  return request('auth/register', {
    method: 'POST',
    body: data
  });
}

export function logoutApi() {
  if (!isBackendConfigured()) return Promise.resolve(null);
  return request('auth/logout', { method: 'POST' });
}
