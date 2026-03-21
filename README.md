# Rift Analytics 🎮

A data science + machine learning portfolio project that turns raw League of Legends ranked match data into a working analytics platform.

## Architecture

```
rift-analytics/
├── data/            ← Raw & processed datasets
├── notebooks/       ← Jupyter notebooks (EDA, feature engineering, models)
├── models/          ← Trained .pkl model files
├── backend/         ← FastAPI REST API
└── frontend/        ← React dashboard (Vite)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Data Science | Python, Pandas, Scikit-learn, XGBoost |
| ML Backend | FastAPI, Uvicorn, Joblib |
| Frontend | React, Vite, Recharts |

## Notebooks

| # | Notebook | Description |
|---|---|---|
| 01 | `01_data_cleaning.ipynb` | Merge and clean 7 raw CSVs |
| 02 | `02_eda.ipynb` | Exploratory data analysis & insights |
| 03 | `03_feature_engineering.ipynb` | Engineer 20+ ML-ready features |
| 04 | `04_model_training.ipynb` | Win predictor + performance scorer |
| 05 | `05_playstyle_clustering.ipynb` | KMeans playstyle clustering |
| 06 | `06_insight_generation.ipynb` | "Why You Lost" insight engine |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Returns win probability, performance score, playstyle & insights |
| GET | `/health` | Health check |
| GET | `/sample` | Sample player profile + prediction |

## Dataset

- **League of Legends Ranked Matches** — ~180k participant records with KDA, gold, vision, damage stats
- **League of Legends Champions 2024** — Champion metadata: Class, Role, Difficulty

## Setup

```bash
# Data science environment
pip install -r requirements-ds.txt
jupyter lab

# Backend
pip install -r requirements-backend.txt
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## Project Status

- [x] Phase 0 — Project scaffolding
- [ ] Phase 1 — Data cleaning (Notebook 01)
- [ ] Phase 2 — EDA (Notebook 02)
- [ ] Phase 3 — Feature engineering (Notebook 03)
- [ ] Phase 4 — Model training (Notebook 04)
- [ ] Phase 5 — Playstyle clustering (Notebook 05)
- [ ] Phase 6 — Insight generation (Notebook 06)
- [ ] Phase 7 — FastAPI backend
- [ ] Phase 8 — React frontend dashboard

---

*Built by Rayan — League of Legends analytics portfolio project, March 2026*
