"""
MLflow Configuration Module

This module manages configuration settings for MLflow experiment tracking.
It handles MLflow tracking URI setup and experiment naming for model training workflows.

Key Features:
- Automatic MLflow tracking URI detection from file or environment
- Centralized experiment naming
- Logging configuration for model tracking

Configuration Sources (in order of preference):
1. .mlflow_uri file in project root
2. MLFLOW_URI environment variable

Usage Example:
    from modeling.config import TRACKING_URI, EXPERIMENT_NAME
    
    mlflow.set_tracking_uri(TRACKING_URI)
    mlflow.set_experiment(EXPERIMENT_NAME)

Dependencies:
    - parsenvy: For environment variable parsing
    - logging: For configuration logging

Note:
    This module contains template configuration. For badminton-specific modeling,
    update EXPERIMENT_NAME to reflect your use case (e.g., "badminton-shot-prediction").

Author: Jin-HoMLee
Last Updated: September 2024
"""

import logging
import parsenvy

logger = logging.getLogger(__name__)

# MLflow tracking URI configuration
# Sometimes when saving links in text files, there may be newlines - strip removes that
try:
    TRACKING_URI = open(".mlflow_uri").read().strip()
except:
    TRACKING_URI = parsenvy.str("MLFLOW_URI")

# Experiment name for MLflow tracking
# TODO: Update this for badminton-specific experiments
EXPERIMENT_NAME = "0-template-ds-modeling"