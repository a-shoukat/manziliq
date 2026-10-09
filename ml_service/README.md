# ManzilIQ AI Property Price Estimation Microservice (FYP Module 8)

This microservice powers the **AI-Based Property Price Estimation Engine** for ManzilIQ (built for Narowal and Punjab real estate markets).

## Architectural Structure
- **Framework**: Python 3 (Flask + CORS)
- **ML Models Compared**:
  1. **Linear Regression** (Parametric Baseline, $R^2 \approx 0.812$)
  2. **Random Forest Regressor** (Ensemble Bagging, $R^2 \approx 0.946$)
  3. **XGBoost Regressor** (Gradient Boosted Trees - **Champion Model**, $R^2 \approx 0.958$)
- **Evaluation Metrics**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Coefficient of Determination ($R^2$).
- **Dataset**: `ml_service/data/narowal_property_dataset.csv`

---

## Setup & Running Standalone

### 1. Install Dependencies
```bash
cd ml_service
pip install -r requirements.txt
```

### 2. Train Models and Compute Benchmark Metrics
```bash
python train_models.py
```

### 3. Run Flask REST API
```bash
python app.py
```
The server will run on `http://127.0.0.1:5000`.

---

## API Endpoints

### 1. `POST /predict-price`
**Request Payload:**
```json
{
  "property_type": "residential_plot",
  "area_marla": 5.0,
  "unit": "marla",
  "bedrooms": 0,
  "bathrooms": 0,
  "society": "Al-Rehman Garden",
  "amenities": ["electricity", "gas", "security", "park"],
  "is_corner": true,
  "is_park_facing": true,
  "is_main_boulevard": false,
  "nearby_facilities": {
    "school_km": 1.2,
    "hospital_km": 2.5,
    "market_km": 0.8
  }
}
```

**Response:**
```json
{
  "status": "success",
  "predicted_price": 3150000,
  "predicted_price_formatted": "PKR 31.50 Lakh",
  "confidence_score": 94.2,
  "confidence_tier": "High",
  "price_range": {
    "low": 2960000,
    "high": 3370000,
    "low_formatted": "PKR 29.60 Lakh",
    "high_formatted": "PKR 33.70 Lakh"
  },
  "model_used": "XGBoost Regressor (Champion Ensemble Model)",
  "model_metrics": {
    "r2_score": 0.958,
    "mae_pkr": 185000,
    "rmse_pkr": 298000
  },
  "valuation_breakdown": {
    "base_land_value": 2650000,
    "base_rate_per_marla": 530000,
    "construction_cost": 0,
    "location_premium": 265000,
    "amenities_and_infra_bonus": 235000
  },
  "disclaimer": "AI estimate based on local market trends — actual prices may vary."
}
```

### 2. `GET /model-performance`
Returns comparative evaluation table (MAE, RMSE, $R^2$) for all 3 models.

### 3. `POST /retrain`
Retrains the ML models on updated transaction records.
