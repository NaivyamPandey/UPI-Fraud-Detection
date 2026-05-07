export function generateMockPrediction() {
  const r = Math.random();
  let prediction;

  if (r < 0.3) {
    prediction = 'Fraud';
  } else if (r < 0.7) {
    prediction = 'Legit';
  } else {
    prediction = 'Suspicious';
  }

  // Confidence between 60 and 100 (inclusive)
  const confidence = 60 + Math.floor(Math.random() * 41);

  return {
    prediction,
    confidence
  };
}

export function formatNumber(n) {
  if (typeof n !== 'number' || isNaN(n)) return '--';
  return n >= 1000 ? n.toLocaleString() : String(n);
}

export const RESULT_STORAGE_KEY = 'upiShieldLastResult';
export const HISTORY_STORAGE_KEY = 'upiTransactionHistory';

export function getLocalHistory() {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalHistory(transaction) {
  try {
    const history = getLocalHistory();
    const newTxn = {
      ...transaction,
      id: transaction.id || 'TXN' + Date.now().toString().slice(-6),
      timestamp: transaction.timestamp || new Date().toLocaleString()
    };
    const updated = [newTxn, ...history];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save to history', e);
    return [];
  }
}

export function clearLocalHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {}
}
