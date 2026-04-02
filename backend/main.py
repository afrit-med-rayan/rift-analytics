"""
main.py — FastAPI application entry point for Rift Analytics.

Endpoints:
  POST /predict  — accepts a player stat dict, returns predictions + insights
  GET  /health   — liveness probe
  GET  /sample   — returns the bundled sample player profile + its prediction
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import predict
from insights import generate_insights

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Rift Analytics API",
    description=(
        "ML-powered League of Legends performance analyser. "
        "Predicts win probability, computes a performance score, "
        "clusters playstyle, and generates actionable insights."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Sample player profile (loaded once)
# ---------------------------------------------------------------------------
_SAMPLE_PATH = Path(__file__).resolve().parent.parent / "sample_player.json"
with open(_SAMPLE_PATH, "r") as _fh:
    _SAMPLE_PLAYER: dict[str, Any] = json.load(_fh)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PlayerStats(BaseModel):
    """
    Flat dictionary of player-level features.
    Core numeric features are required; one-hot columns default to 0.
    """
    # Core engineered features
    kda_ratio: float = Field(..., ge=0, description="(kills+assists)/max(deaths,1)")
    gold_per_min: float = Field(..., ge=0, description="Gold earned per minute")
    damage_efficiency: float = Field(..., ge=0, description="Total damage / gold spent")
    kill_participation: float = Field(..., ge=0, le=1, description="(kills+assists)/team_kills")
    vision_control: float = Field(..., ge=0, description="Vision score per minute")
    death_rate: float = Field(..., ge=0, description="Deaths per minute")

    # Optional metadata / one-hot columns (default 0)
    model_config = {"extra": "allow"}


class InsightItem(BaseModel):
    text: str
    severity: str  # "high" | "medium" | "low"


class PredictionResponse(BaseModel):
    win_probability: float
    performance_score: float
    playstyle: str
    cluster_id: int
    insights: list[InsightItem]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Meta"])
def health() -> dict[str, str]:
    """Liveness probe — returns status OK."""
    return {"status": "ok", "version": "1.0.0"}


@app.get("/sample", response_model=PredictionResponse, tags=["Meta"])
def sample() -> PredictionResponse:
    """
    Returns the bundled sample player profile with a full prediction.
    Useful for testing without constructing a request body.
    """
    player_dict = dict(_SAMPLE_PLAYER)
    pred = predict(player_dict)
    insights_list = generate_insights(player_dict)
    return PredictionResponse(
        insights=[InsightItem(**i) for i in insights_list],
        **pred,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_endpoint(stats: PlayerStats) -> PredictionResponse:
    """
    Run all ML models on the submitted player stats.

    Returns:
    - **win_probability** — 0.0–1.0 probability of winning
    - **performance_score** — 0–100 composite performance score
    - **playstyle** — cluster label (e.g. "Aggressive Carry")
    - **cluster_id** — raw cluster integer
    - **insights** — top 3-5 prioritised, severity-tagged insight strings
    """
    player_dict = stats.model_dump()

    try:
        pred = predict(player_dict)
        insights_list = generate_insights(player_dict)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}") from exc

    return PredictionResponse(
        insights=[InsightItem(**i) for i in insights_list],
        **pred,
    )
