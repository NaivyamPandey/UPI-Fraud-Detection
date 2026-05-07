import pandas as pd
import numpy as np
import os

def generate_dataset(n_samples=5000):
    np.random.seed(42)
    
    # Basic features
    amount = np.random.exponential(scale=1000, size=n_samples)
    avg_user_txn = np.random.normal(loc=500, scale=200, size=n_samples)
    avg_user_txn = np.maximum(avg_user_txn, 50) # Ensure positive
    
    failed_attempts = np.random.poisson(lam=0.2, size=n_samples)
    transaction_hour = np.random.randint(0, 24, size=n_samples)
    
    # Probabilistic fraud signals
    # Fraud occurs more often at night, with high amounts, and failed attempts
    is_night = ((transaction_hour < 6) | (transaction_hour > 22)).astype(int)
    is_weekend = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])
    
    # Risk scores (random for now, but used as features)
    location_risk = np.random.uniform(0, 1, size=n_samples)
    merchant_risk = np.random.uniform(0, 1, size=n_samples)
    
    # Device type (0: mobile, 1: web, 2: unknown)
    device_type = np.random.choice([0, 1, 2], size=n_samples, p=[0.8, 0.15, 0.05])
    
    # Calculate derived features
    amount_ratio = amount / avg_user_txn
    log_amount = np.log1p(amount)
    
    # Generate labels (FraudFlag)
    # Fraud logic: high ratio, late night, failed attempts, high location risk
    fraud_prob = (
        0.3 * (amount_ratio > 10).astype(float) +
        0.2 * is_night +
        0.2 * (failed_attempts > 2).astype(float) +
        0.2 * location_risk +
        0.1 * (amount > 5000).astype(float)
    )
    
    # Normalize and threshold for label
    fraud_prob = fraud_prob / fraud_prob.max()
    fraud_flag = (np.random.random(n_samples) < (fraud_prob * 0.1)).astype(int)
    
    # Introduce some "obvious" fraud for the logic test
    fraud_indices = np.random.choice(n_samples, size=int(n_samples * 0.02), replace=False)
    fraud_flag[fraud_indices] = 1
    amount[fraud_indices] *= 15 # Make them high value
    amount_ratio[fraud_indices] = amount[fraud_indices] / avg_user_txn[fraud_indices]
    log_amount[fraud_indices] = np.log1p(amount[fraud_indices])

    df = pd.DataFrame({
        'amount': amount,
        'avg_user_txn': avg_user_txn,
        'amount_ratio': amount_ratio,
        'log_amount': log_amount,
        'failed_attempts': failed_attempts,
        'transaction_hour': transaction_hour,
        'risk_score_location': location_risk,
        'risk_score_merchant': merchant_risk,
        'device_type': device_type,
        'is_weekend': is_weekend,
        'is_night_transaction': is_night,
        'fraud_flag': fraud_flag
    })
    
    return df

if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(__file__), "notebook", "improved_dataset.csv")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_dataset(10000)
    df.to_csv(output_path, index=False)
    print(f"Dataset generated at {output_path}")
    print(df['fraud_flag'].value_counts())
