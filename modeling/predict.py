"""
Model Prediction Module

This module provides model inference functionality for trained machine learning models.
It loads saved models and applies them to new data for prediction.

Key Features:
- Model loading from MLflow or local storage
- Feature preprocessing pipeline for inference
- Batch prediction on test data
- Performance evaluation on test sets

Usage Example:
    python modeling/predict.py <model_path> <X_test_path> <y_test_path>

Command Line Arguments:
    model_path (str): Path to saved model file or MLflow model URI
    X_test_path (str): Path to test features CSV file
    y_test_path (str): Path to test labels CSV file

Dependencies:
    - scikit-learn: For model loading and prediction
    - MLflow: For model management
    - pandas: For data handling
    - pickle: For model serialization

Note:
    This module contains template prediction code for regression models.
    For badminton shot prediction, adapt this to:
    
    1. Load pose sequence models (LSTM/CNN)
    2. Handle temporal data preprocessing
    3. Predict shot types and timings
    4. Output structured predictions with confidence scores
    
    Consider implementing:
    - Real-time prediction from video streams
    - Confidence thresholding for shot detection
    - Temporal smoothing of predictions
    - Integration with pose analysis pipeline

Author: Jin-HoMLee
Last Updated: September 2024
"""

import sys
import pandas as pd
import pickle
from sklearn.metrics import mean_squared_error
import warnings
import mlflow
from mlflow.sklearn import load_model

warnings.filterwarnings("ignore")

from feature_engineering import (
    fill_missing_values,
    drop_column,
    transform_altitude,
)

print("Number of arguments:", len(sys.argv), "arguments.")
print("Argument List:", str(sys.argv))

# in an ideal world this would validated
model_path = sys.argv[1]
X_test_path = sys.argv[2]
y_test_path = sys.argv[3]

# load the model from disk
# model_path = "models/linear"
loaded_model = load_model(model_path)
X_test = pd.read_csv(X_test_path)
y_test = pd.read_csv(y_test_path)

# feature eng on test data
print("Feature engineering")
X_test = transform_altitude(X_test)
X_test = drop_column(X_test, col_name="Unnamed: 0")
X_test = drop_column(X_test, col_name="Quakers")
X_test = fill_missing_values(X_test)

y_test_pred = loaded_model.predict(X_test)
mse_test = mean_squared_error(y_test, y_test_pred)
print(f"MSE on test is: {mse_test}")
