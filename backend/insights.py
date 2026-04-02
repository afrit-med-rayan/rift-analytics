"""
insights.py — Rule-based + ML-weighted insight generation for Rift Analytics.

Insight priority = rule severity weight × feature importance from the model.
The top 3-5 insights are returned, sorted highest priority first.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Load threshold data
# ---------------------------------------------------------------------------
_THRESHOLDS_PATH = Path(__file__).resolve().parent.parent / "models" / "insight_thresholds.json"

with open(_THRESHOLDS_PATH, "r") as _fh:
    _THRESHOLDS: dict = json.load(_fh)

_P25 = _THRESHOLDS["percentiles"]["p25"]
_P50 = _THRESHOLDS["percentiles"]["p50"]
_P75 = _THRESHOLDS["percentiles"]["p75"]
_P30 = {k: _P25[k] + (_P50[k] - _P25[k]) * 0.2 for k in _P25}  # approx p30
_IMPORTANCE = _THRESHOLDS["ml_importance"]

# ---------------------------------------------------------------------------
# Rule definitions
# ---------------------------------------------------------------------------
# Each rule is: (feature, condition_fn, severity, message_fn)
# severity: "high" | "medium" | "low"

def _rules(player: dict[str, Any]) -> list[dict]:
    """Evaluate all rules and return triggered insights (unsorted)."""

    kda = player.get("kda_ratio", 0)
    gpm = player.get("gold_per_min", 0)
    dmg_eff = player.get("damage_efficiency", 0)
    kp = player.get("kill_participation", 0)
    vision = player.get("vision_control", 0)
    death_rate = player.get("death_rate", 0)

    raw_insights: list[dict] = []

    # ---- Death Rate -------------------------------------------------------
    if death_rate > _P75["death_rate"]:
        raw_insights.append({
            "feature": "death_rate",
            "severity": "high",
            "text": (
                f"Your death rate ({death_rate:.3f} deaths/min) is in the top 25% "
                "worst — dying frequently gives the enemy gold and map control. "
                "Focus on positioning and backing earlier."
            ),
        })
    elif death_rate > _P50["death_rate"]:
        raw_insights.append({
            "feature": "death_rate",
            "severity": "medium",
            "text": (
                f"Your death rate ({death_rate:.3f} deaths/min) is above the median. "
                "Reducing unnecessary deaths will significantly improve your win rate."
            ),
        })

    # ---- KDA Ratio --------------------------------------------------------
    if kda < _P25["kda_ratio"]:
        raw_insights.append({
            "feature": "kda_ratio",
            "severity": "high",
            "text": (
                f"Your KDA ratio ({kda:.2f}) is in the bottom 25% — a strong signal "
                "of poor combat efficiency. Aim for fewer deaths and more kill "
                "involvement."
            ),
        })
    elif kda < _P50["kda_ratio"]:
        raw_insights.append({
            "feature": "kda_ratio",
            "severity": "medium",
            "text": (
                f"Your KDA ratio ({kda:.2f}) is below median ({_P50['kda_ratio']:.1f}). "
                "Improving your KDA is the single biggest lever for improving your score."
            ),
        })

    # ---- Gold Per Minute --------------------------------------------------
    if gpm < _P30["gold_per_min"]:
        raw_insights.append({
            "feature": "gold_per_min",
            "severity": "high",
            "text": (
                f"Your gold income ({gpm:.0f} GPM) falls in the bottom 30%. "
                "Low gold limits item spikes that are critical for late-game impact. "
                "Focus on CS, objective bounties, and minimising downtime."
            ),
        })
    elif gpm < _P50["gold_per_min"]:
        raw_insights.append({
            "feature": "gold_per_min",
            "severity": "medium",
            "text": (
                f"Your gold income ({gpm:.0f} GPM) is below the median "
                f"({_P50['gold_per_min']:.0f} GPM). Improving CS consistency "
                "will accelerate your item timing."
            ),
        })

    # ---- Kill Participation -----------------------------------------------
    if kp < _P25["kill_participation"]:
        raw_insights.append({
            "feature": "kill_participation",
            "severity": "medium",
            "text": (
                f"Your kill participation ({kp:.0%}) is in the bottom 25%. "
                "Being absent from fights hurts your team's momentum. "
                "Rotate to skirmishes and objective fights more actively."
            ),
        })

    # ---- Vision Control ---------------------------------------------------
    if vision < _P30["vision_control"]:
        raw_insights.append({
            "feature": "vision_control",
            "severity": "high",
            "text": (
                f"Your vision score per minute ({vision:.3f}) is critically low — "
                "bottom 30%. Poor vision leads to ambushes and missed objective "
                "timers. Buy control wards every back."
            ),
        })
    elif vision < _P50["vision_control"]:
        raw_insights.append({
            "feature": "vision_control",
            "severity": "medium",
            "text": (
                f"Your vision contribution ({vision:.3f}/min) is below median. "
                "Placing more wards at key drake / baron timers can swing "
                "late-game decision-making."
            ),
        })

    # ---- Damage Efficiency ------------------------------------------------
    if dmg_eff < _P25["damage_efficiency"]:
        raw_insights.append({
            "feature": "damage_efficiency",
            "severity": "medium",
            "text": (
                f"Your damage efficiency ({dmg_eff:.2f}) is in the bottom 25%. "
                "You are spending a lot of gold without converting it into "
                "champion damage. Review your item build."
            ),
        })

    # ---- Positive reinforcement ------------------------------------------
    if kda >= _P75["kda_ratio"]:
        raw_insights.append({
            "feature": "kda_ratio",
            "severity": "low",
            "text": (
                f"Outstanding KDA ratio ({kda:.2f}) — you are in the top 25%. "
                "Your combat efficiency is a key strength this game."
            ),
        })

    if vision >= _P75["vision_control"]:
        raw_insights.append({
            "feature": "vision_control",
            "severity": "low",
            "text": (
                f"Excellent vision control ({vision:.3f}/min) — top 25%. "
                "Your warding habits create information advantages for your team."
            ),
        })

    if kp >= _P75["kill_participation"]:
        raw_insights.append({
            "feature": "kill_participation",
            "severity": "low",
            "text": (
                f"Solid kill participation ({kp:.0%}) — you were involved in "
                "most of your team's kills, showing strong map presence."
            ),
        })

    return raw_insights


# Severity weights for priority scoring
_SEVERITY_WEIGHT = {"high": 3.0, "medium": 1.5, "low": 0.5}


def generate_insights(
    player: dict[str, Any],
    max_insights: int = 5,
) -> list[dict[str, str]]:
    """
    Generate a priority-sorted list of insight dicts.

    Parameters
    ----------
    player : dict
        Player stat dictionary (same schema as /predict input).
    max_insights : int
        Maximum number of insights to return (default 5).

    Returns
    -------
    list of dicts, each with keys:
        text     : str  — human-readable insight message
        severity : str  — "high" | "medium" | "low"
    """
    raw = _rules(player)

    if not raw:
        return [
            {
                "text": "No significant issues detected — solid overall performance!",
                "severity": "low",
            }
        ]

    # Compute ML-weighted priority score
    for item in raw:
        feat = item["feature"]
        importance = _IMPORTANCE.get(feat, 0.05)
        sev_weight = _SEVERITY_WEIGHT.get(item["severity"], 1.0)
        item["_priority"] = importance * sev_weight

    # Sort: highest priority first, then truncate
    raw.sort(key=lambda x: x["_priority"], reverse=True)
    top = raw[:max_insights]

    return [{"text": r["text"], "severity": r["severity"]} for r in top]
