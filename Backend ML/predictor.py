import pandas as pd
import numpy as np
import joblib
import os
import json
import tensorflow as tf
from data_preprocessing import DataProcessor
from config import RF_MODEL_PATH, AE_MODEL_PATH, HYBRID_WEIGHTS, RULE_BASE_OVERRIDE_RATIO, FRAUD_THRESHOLD

class FraudPredictor:
    def __init__(self):
        self.processor = DataProcessor()
        self.processor.load_processor()
        
        self.rf_model = joblib.load(RF_MODEL_PATH)
        self.ae_model = tf.keras.models.load_model(AE_MODEL_PATH, compile=False)
        
        # Load calibration data
        calibration_path = os.path.join(os.path.dirname(RF_MODEL_PATH), "calibration.json")
        if os.path.exists(calibration_path):
            with open(calibration_path, 'r') as f:
                self.calibration = json.load(f)
        else:
            self.calibration = {"legit_mse_mean": 0.5, "legit_mse_std": 0.2, "threshold_mse": 1.0}

    def calculate_risk_score(self, rf_prob, ae_score, features_df):
        """
        Custom risk scoring logic.
        risk = w1*supervised + w2*anomaly + w3*rules
        """
        # Normalize AE score using calibration
        # We use a sigmoid-like scaling: if it's > threshold_mse, it's very anomalous
        # score = 1 / (1 + math.exp(-(mse - threshold) / std))
        # Simple linear scaling for now:
        norm_ae_score = (ae_score - self.calibration['legit_mse_mean']) / (self.calibration['threshold_mse'] - self.calibration['legit_mse_mean'] + 1e-6)
        norm_ae_score = np.clip(norm_ae_score, 0, 1.2) / 1.2 # Scale to [0, 1]
        
        # Hybrid supervised/unsupervised score
        base_score = (HYBRID_WEIGHTS['rf'] * rf_prob) + (HYBRID_WEIGHTS['ae'] * norm_ae_score)
        
        # Behavioral penalties
        penalty = 0.0
        row = features_df.iloc[0]
        
        if row['amount_ratio'] > 20: penalty += 0.2
        if row['failed_attempts'] > 3: penalty += 0.15
        if row['is_night_transaction'] == 1 and row['amount'] > 5000: penalty += 0.1
        
        final_score = min(base_score + penalty, 1.0)
        return final_score

    def get_explainability(self, row, rf_prob, ae_score, risk_score):
        reasons = []
        if rf_prob > 0.7: reasons.append("Behavioral patterns match known fraud signatures.")
        
        # Check if AE score is significantly higher than legit threshold
        if ae_score > self.calibration['threshold_mse']:
            reasons.append("Transaction details are highly anomalous compared to user history.")
        
        if row['amount_ratio'] > RULE_BASE_OVERRIDE_RATIO: reasons.append(f"Transaction amount is extremely high ({row['amount_ratio']:.1f}x average).")
        if row['failed_attempts'] > 2: reasons.append(f"Multiple failed transaction attempts ({row['failed_attempts']}) detected.")
        if row['is_night_transaction'] == 1 and row['amount'] > 2000: reasons.append("High-value transaction during unusual hours.")
        
        if not reasons:
            if risk_score < 0.2:
                reasons.append("Transaction aligns perfectly with normal user behavior.")
            else:
                reasons.append("Transaction shows low-level risk factors but appears within normal bounds.")
                
        return reasons

    def predict(self, raw_data):
        """
        raw_data: dict containing transaction fields
        """
        # Convert to DataFrame
        df = pd.DataFrame([raw_data])
        
        # Rule-based override (High Value)
        is_override = False
        if 'amount' in df.columns and 'avg_user_txn' in df.columns:
            if df['amount'].iloc[0] > (RULE_BASE_OVERRIDE_RATIO * df['avg_user_txn'].iloc[0]):
                is_override = True
        
        # Preprocess
        X_scaled = self.processor.transform(df)
        
        # 1. RF Prediction
        rf_prob = float(self.rf_model.predict_proba(X_scaled)[:, 1][0])
        
        # 2. AE Anomaly Score
        reconstruction = self.ae_model.predict(X_scaled, verbose=0)
        ae_mse = float(np.mean(np.power(X_scaled - reconstruction, 2)))
        
        # 3. Risk Scoring & Final Decision
        risk_score = self.calculate_risk_score(rf_prob, ae_mse, self.processor.engineer_features(df))
        
        if is_override:
            risk_score = max(risk_score, 0.95)
            
        prediction = "Fraud" if risk_score > FRAUD_THRESHOLD else "Legit"
        confidence = risk_score if prediction == "Fraud" else (1.0 - risk_score)
        
        # Explainability
        reasons = self.get_explainability(self.processor.engineer_features(df).iloc[0], rf_prob, ae_mse, risk_score)
        
        return {
            "prediction": prediction,
            "confidence": round(float(confidence) * 100, 2),
            "risk_score": round(float(risk_score), 4),
            "reasons": reasons,
            "details": {
                "rf_score": round(rf_prob, 4),
                "anomaly_score": round(ae_mse, 4)
            }
        }

if __name__ == "__main__":
    # Test sample
    test_txn = {
        "amount": 15000,
        "avg_user_txn": 200,
        "failed_attempts": 4,
        "transaction_hour": 2,
        "device_type": 1,
        "is_weekend": 1,
        "risk_score_location": 0.8,
        "risk_score_merchant": 0.5
    }
    
    predictor = FraudPredictor()
    result = predictor.predict(test_txn)
    print(json.dumps(result, indent=2))
