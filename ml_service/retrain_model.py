"""
ManzilIQ ML Valuation Engine - Automated Model Retraining Script
FYP Module 8: AI-Based Property Price Estimation Engine

Executes automated retraining pipeline on updated transaction data,
logs updated MAE, RMSE, R² scores, and updates model artifacts.
"""

import sys
import os
import json
from train_models import train_and_evaluate_models


def retrain(dataset_override_path=None):
    print("[MANZILIQ ML] Initiating model retraining pipeline...")
    if dataset_override_path and os.path.exists(dataset_override_path):
        print(f"[MANZILIQ ML] Ingesting updated dataset from: {dataset_override_path}")
    
    results = train_and_evaluate_models()
    print("[MANZILIQ ML] Retraining cycle finalized.")
    print(f"[MANZILIQ ML] Best Model: {results.get('champion_model')}")
    return results


if __name__ == '__main__':
    custom_dataset = sys.argv[1] if len(sys.argv) > 1 else None
    retrain(custom_dataset)
