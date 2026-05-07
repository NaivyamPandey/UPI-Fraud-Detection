import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam
import tensorflow as tf

from config import RF_MODEL_PATH, AE_MODEL_PATH, DATA_DIR, MODEL_DIR
from data_preprocessing import DataProcessor

# Try to import SMOTE
try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False
    print("Warning: imbalanced-learn not installed. Skipping SMOTE.")

def build_autoencoder(input_dim):
    """Build a simple Autoencoder for anomaly detection."""
    input_layer = Input(shape=(input_dim,))
    
    # Encoder
    encoded = Dense(16, activation='relu')(input_layer)
    encoded = Dense(8, activation='relu')(encoded)
    encoded = Dense(4, activation='relu')(encoded)
    
    # Decoder
    decoded = Dense(8, activation='relu')(encoded)
    decoded = Dense(16, activation='relu')(decoded)
    decoded = Dense(input_dim, activation='sigmoid')(decoded)
    
    autoencoder = Model(input_layer, decoded)
    autoencoder.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    return autoencoder

def train_system():
    # Load dataset
    data_path = os.path.join(DATA_DIR, "improved_dataset.csv")
    if not os.path.exists(data_path):
        print("Data not found. Run generate_realistic_data.py first.")
        return
        
    df = pd.read_csv(data_path)
    X = df.drop('fraud_flag', axis=1)
    y = df['fraud_flag']
    
    # Initialize processor and transform data
    processor = DataProcessor()
    X_scaled = processor.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    
    # 1. Handle Class Imbalance with SMOTE
    if HAS_SMOTE:
        smote = SMOTE(random_state=42)
        X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
        print(f"Resampled dataset shape: {pd.Series(y_train_res).value_counts()}")
    else:
        X_train_res, y_train_res = X_train, y_train

    # 2. Train Random Forest
    print("Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        class_weight='balanced',
        random_state=42
    )
    rf.fit(X_train_res, y_train_res)
    joblib.dump(rf, RF_MODEL_PATH)
    
    # 3. Train Autoencoder (Anomalies)
    # Train only on Legit transactions to learn the normality
    X_legit = X_train[y_train == 0]
    print(f"Training Autoencoder on {len(X_legit)} legit samples...")
    
    ae = build_autoencoder(X_train.shape[1])
    ae.fit(
        X_legit, X_legit,
        epochs=50,
        batch_size=32,
        shuffle=True,
        validation_split=0.1,
        verbose=0
    )
    ae.save(AE_MODEL_PATH)
    
    # Evaluation
    y_pred = rf.predict(X_test)
    print("\nRandom Forest Performance:")
    print(classification_report(y_test, y_pred))
    
    # Check AE reconstruction error on test set
    reconstructions = ae.predict(X_test)
    mse = np.mean(np.power(X_test - reconstructions, 2), axis=1)
    
    legit_mse = mse[y_test == 0]
    fraud_mse = mse[y_test == 1]
    
    print(f"Mean MSE for Legit in Test: {legit_mse.mean():.4f}")
    print(f"Mean MSE for Fraud in Test: {fraud_mse.mean():.4f}")

    # Save calibration data
    calibration = {
        "legit_mse_mean": float(legit_mse.mean()),
        "legit_mse_std": float(legit_mse.std()),
        "threshold_mse": float(np.percentile(legit_mse, 95)) # 95th percentile
    }
    with open(os.path.join(MODEL_DIR, "calibration.json"), 'w') as f:
        json.dump(calibration, f)

if __name__ == "__main__":
    train_system()
