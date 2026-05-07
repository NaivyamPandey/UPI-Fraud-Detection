import pandas as pd
import numpy as np
import joblib
import json
from sklearn.preprocessing import StandardScaler
from config import SCALER_PATH, FEATURE_COLS_PATH, ALL_FEATURES

class DataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_columns = ALL_FEATURES

    def engineer_features(self, df):
        """Apply feature engineering consistently."""
        df = df.copy()
        
        # Ensure numeric types
        numeric_cols = ['amount', 'avg_user_txn', 'failed_attempts', 'transaction_hour']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # 1. amount_ratio
        if 'amount' in df.columns and 'avg_user_txn' in df.columns:
            # Avoid division by zero
            avg_txn = df['avg_user_txn'].replace(0, 1)
            df['amount_ratio'] = df['amount'] / avg_txn
        
        # 2. log_amount
        if 'amount' in df.columns:
            df['log_amount'] = np.log1p(df['amount'])
            
        # 3. is_night_transaction (if missing)
        if 'transaction_hour' in df.columns and 'is_night_transaction' not in df.columns:
            df['is_night_transaction'] = ((df['transaction_hour'] < 6) | (df['transaction_hour'] > 22)).astype(int)
            
        # 4. is_weekend (if missing)
        if 'is_weekend' not in df.columns:
            df['is_weekend'] = 0 # Default to weekday if not provided
            
        # Ensure all required features exist
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
                
        return df[self.feature_columns]

    def fit_transform(self, df):
        """Fit scaler and transform data."""
        df_engineered = self.engineer_features(df)
        scaled_data = self.scaler.fit_transform(df_engineered)
        
        # Save scaler and feature list
        joblib.dump(self.scaler, SCALER_PATH)
        with open(FEATURE_COLS_PATH, 'w') as f:
            json.dump(self.feature_columns, f)
            
        return scaled_data

    def transform(self, df):
        """Transform data using saved scaler."""
        if not hasattr(self, 'scaler') or self.scaler is None:
            self.scaler = joblib.load(SCALER_PATH)
            
        df_engineered = self.engineer_features(df)
        return self.scaler.transform(df_engineered)

    def load_processor(self):
        """Load saved scaler and features."""
        self.scaler = joblib.load(SCALER_PATH)
        with open(FEATURE_COLS_PATH, 'r') as f:
            self.feature_columns = json.load(f)
