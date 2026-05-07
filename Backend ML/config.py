import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "final model")
DATA_DIR = os.path.join(BASE_DIR, "notebook")

# File Names
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_fraud_model.pkl")
AE_MODEL_PATH = os.path.join(MODEL_DIR, "autoencoder_model.h5")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
FEATURE_COLS_PATH = os.path.join(MODEL_DIR, "feature_columns.json")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

# Hyperparameters & Thresholds
FRAUD_THRESHOLD = 0.45
RULE_BASE_OVERRIDE_RATIO = 50.0 # amount > 50 * avg_user_txn
HYBRID_WEIGHTS = {
    "rf": 0.5,
    "ae": 0.5
}

# Feature Lists
NUMERIC_FEATURES = [
    'amount', 'avg_user_txn', 'amount_ratio', 'log_amount', 
    'failed_attempts', 'transaction_hour', 'risk_score_location', 
    'risk_score_merchant'
]
CATEGORICAL_FEATURES = [
    'device_type', 'is_weekend', 'is_night_transaction'
]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
