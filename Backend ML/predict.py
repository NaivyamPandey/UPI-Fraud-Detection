import sys
import json
import warnings
import os

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings("ignore")

from predictor import FraudPredictor

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input provided."}))
            return

        # Expecting JSON string of transaction data
        try:
            input_json = sys.argv[1]
            data = json.loads(input_json)
        except Exception:
            print(json.dumps({"error": "Invalid JSON input."}))
            return

        # Initialize predictor (this loads models)
        # Note: In a production environment, you'd keep this instance warm
        predictor = FraudPredictor()
        
        # If data is a list of features (old format), convert to dict or handle accordingly
        # But we want to encourage the new modular dict format
        if isinstance(data, list):
            # Fallback for old system: map list to expected features
            # This is risky if order changed, but we'll try to map if it's the right length
            feature_names = [
                'amount', 'avg_user_txn', 'amount_ratio', 'log_amount', 
                'failed_attempts', 'transaction_hour', 'risk_score_location', 
                'risk_score_merchant', 'device_type', 'is_weekend', 'is_night_transaction'
            ]
            if len(data) == len(feature_names):
                data = dict(zip(feature_names, data))
            else:
                # If it's the old 12-feature list, we might need a custom mapping
                print(json.dumps({"error": f"Old feature format detected (len {len(data)}), but upgraded system expects dictionary or specific list length."}))
                return

        result = predictor.predict(data)
        
        # Print for consumption by parent process
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
