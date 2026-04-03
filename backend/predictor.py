"""
predictor.py — Model inference layer for Rift Analytics.

Loads the three trained artefacts once at module import time and exposes
a single `predict()` function that the FastAPI routes call.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_ROOT = Path(__file__).resolve().parent.parent
_MODELS_DIR = _ROOT / "models"

# ---------------------------------------------------------------------------
# Model artefacts (loaded once at import time)
# ---------------------------------------------------------------------------
_win_predictor = joblib.load(_MODELS_DIR / "win_predictor.pkl")
_performance_scorer = joblib.load(_MODELS_DIR / "performance_scorer.pkl")
_perf_scaler = joblib.load(_MODELS_DIR / "perf_scaler.pkl")
_playstyle_clusterer = joblib.load(_MODELS_DIR / "playstyle_clusterer.pkl")

# ---------------------------------------------------------------------------
# Cluster label mapping  (centroid-based labels assigned in notebook 05)
# ---------------------------------------------------------------------------
CLUSTER_LABELS: dict[int, str] = {
    0: "Passive-Struggling",
    1: "Support-Oriented",
    2: "Aggressive Carry",
    3: "Balanced",
    4: "Vision-Dominant",
}

# Core 6 features used for playstyle clustering (must match training order)
_CLUSTER_FEATURES = [
    "kda_ratio",
    "gold_per_min",
    "damage_efficiency",
    "kill_participation",
    "vision_control",
    "death_rate",
]

# Features expected by the win predictor (matches features_engineered.csv columns)
_WIN_FEATURES = [
    "kda_ratio",
    "gold_per_min",
    "damage_efficiency",
    "kill_participation",
    "vision_control",
    "death_rate",
    "cs_per_min",
    "role_DUO",
    "role_DUO_CARRY",
    "role_DUO_SUPPORT",
    "role_NONE",
    "role_SOLO",
    "position_BOT",
    "position_JUNGLE",
    "position_MID",
    "position_TOP",
    "primary_class_Artillery",
    "primary_class_Assassin",
    "primary_class_Assassin  Diver",
    "primary_class_Battlemage",
    "primary_class_Burst",
    "primary_class_Burst  Artillery",
    "primary_class_Burst  Enchanter",
    "primary_class_Catcher",
    "primary_class_Diver",
    "primary_class_Enchanter",
    "primary_class_Enchanter  Warden",
    "primary_class_Juggernaut",
    "primary_class_Marksman",
    "primary_class_Marksman  Artillery",
    "primary_class_Marksman  Catcher",
    "primary_class_Skirmisher",
    "primary_class_Specialist",
    "primary_class_Unknown",
    "primary_class_Vanguard",
    "primary_class_Warden",
]

# Features expected by the performance scorer
_PERF_FEATURES = [
    "kda_ratio",
    "gold_per_min",
    "kill_participation",
    "vision_control",
]


def _build_dataframe(player: dict[str, Any], feature_list: list[str]) -> pd.DataFrame:
    """
    Build a single-row DataFrame aligned to `feature_list`.
    Missing keys default to 0 so unknown one-hot columns don't crash the model.
    """
    row = {feat: player.get(feat, 0) for feat in feature_list}
    return pd.DataFrame([row])


def predict(player: dict[str, Any]) -> dict[str, Any]:
    """
    Run all three models on the incoming player stat dictionary.

    Parameters
    ----------
    player : dict
        Keys match the columns in features_engineered.csv plus the one-hot
        encoded role / position / class columns.

    Returns
    -------
    dict with keys:
        win_probability   float  0-1
        performance_score float  0-100
        playstyle         str
        cluster_id        int
    """
    # --- Win probability -------------------------------------------------
    win_df = _build_dataframe(player, _WIN_FEATURES)
    win_prob: float = float(_win_predictor.predict_proba(win_df)[0][1])

    # --- Performance score -----------------------------------------------
    # The performance scorer was trained on the same 36 features to predict the composite score
    raw_score: float = float(_performance_scorer.predict(win_df)[0])
    performance_score = float(np.clip(raw_score, 0, 100))

    # --- Playstyle cluster -----------------------------------------------
    cluster_features = _playstyle_clusterer["features"]
    cluster_df = _build_dataframe(player, cluster_features)
    cluster_scaled = _playstyle_clusterer["scaler"].transform(cluster_df)
    cluster_id = int(_playstyle_clusterer["kmeans"].predict(cluster_scaled)[0])
    playstyle = _playstyle_clusterer["labels_map"].get(cluster_id, f"Cluster {cluster_id}")

    return {
        "win_probability": round(win_prob, 4),
        "performance_score": round(performance_score, 2),
        "playstyle": playstyle,
        "cluster_id": cluster_id,
    }
