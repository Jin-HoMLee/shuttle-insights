"""
Model Training Module

This module provides machine learning model training functionality with MLflow tracking.
Currently contains a template training pipeline using linear regression as an example.

Key Features:
- MLflow experiment tracking and logging
- Model training with cross-validation
- Automated metric computation and logging
- Model persistence and versioning

Usage Example:
    from modeling.train import run_training
    
    run_training()  # Trains model and logs to MLflow

Dependencies:
    - scikit-learn: For machine learning algorithms
    - MLflow: For experiment tracking
    - pandas: For data manipulation
    - logging: For training progress tracking

Note:
    This module contains template training code using coffee quality data.
    For badminton shot prediction, adapt this to:
    
    1. Load pose sequence data from analyze_pose.py output
    2. Implement LSTM or CNN models for temporal pattern recognition
    3. Add badminton-specific metrics (shot accuracy, timing precision)
    4. Update data loading to handle pose landmark sequences
    
    Consider implementing:
    - Sequence-to-sequence models for shot prediction
    - Multi-class classification for shot types
    - Temporal feature extraction from pose sequences
    - Video frame-to-shot mapping

Author: Jin-HoMLee
Last Updated: September 2024
"""

from logging import getLogger
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
import pickle
import warnings
import mlflow
from mlflow.sklearn import save_model  # , log_model

from modeling.feature_engineering import (
    fill_missing_values,
    drop_column,
    transform_altitude,
    altitude_high_meters_mean,
    altitude_mean_log_mean,
    altitude_low_meters_mean,
)

from modeling.config import TRACKING_URI, EXPERIMENT_NAME

warnings.filterwarnings("ignore")
logger = getLogger(__name__)


def __get_data():
    """
    Load and prepare training data.
    
    Template function that loads coffee quality data for demonstration.
    For badminton analysis, replace this with pose data loading.
    
    Returns:
        tuple: (X_train, X_test, y_train, y_test) training and test sets
        
    Note:
        For badminton shot prediction, adapt this to:
        - Load pose sequence data from CSV files
        - Handle temporal sequences of pose landmarks
        - Load corresponding shot labels from manual annotation
        - Split data maintaining temporal consistency
    """
    logger.info("Getting the data")
    # coffee data
    url = "https://github.com/jldbc/coffee-quality-database/raw/master/data/robusta_data_cleaned.csv"
    coffee_features = pd.read_csv(url)

    # coffee score

    url = "https://raw.githubusercontent.com/jldbc/coffee-quality-database/master/data/robusta_ratings_raw.csv"
    coffee_quality = pd.read_csv(url)

    # cleaning data and preparing
    Y = coffee_quality["quality_score"]
    X = coffee_features.select_dtypes(["number"])

    # splittin into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        X, Y, test_size=0.30, random_state=42
    )
    ## in order to exemplify how the predict will work.. we will save the y_train
    logger.info("Saving test data in the data folder .. wo feat eng")
    X_test.to_csv("data/X_test.csv", index=False)
    y_test.to_csv("data/y_test.csv", index=False)

    logger.info("Feature engineering on train")
    X_train = transform_altitude(X_train)
    X_train = drop_column(X_train, col_name="Unnamed: 0")
    X_train = drop_column(X_train, col_name="Quakers")
    X_train = fill_missing_values(X_train)

    # feature eng on test data
    logger.info("Feature engineering on test")
    X_test = transform_altitude(X_test)
    X_test = drop_column(X_test, col_name="Unnamed: 0")
    X_test = drop_column(X_test, col_name="Quakers")
    X_test = fill_missing_values(X_test)

    return X_train, X_test, y_train, y_test


def __compute_and_log_metrics(
    y_true: pd.Series, y_pred: pd.Series, prefix: str = "train"
):
    """
    Compute and log performance metrics to MLflow.
    
    Calculates regression metrics and logs them to the current MLflow run.
    For classification tasks, adapt to use appropriate metrics.
    
    Args:
        y_true (pd.Series): True target values
        y_pred (pd.Series): Predicted values
        prefix (str): Metric name prefix (e.g., "train", "test", "val")
        
    Returns:
        tuple: (mse, r2) computed metrics
        
    Note:
        For badminton shot classification, consider metrics like:
        - Accuracy, Precision, Recall for shot type prediction
        - Temporal alignment metrics for shot timing
        - Confusion matrices for shot type analysis
    """
    mse = mean_squared_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)

    logger.info(
        "Linear Regression performance on "
        + str(prefix)
        + " set: MSE = {:.1f}, R2 = {:.1%},".format(mse, r2)
    )
    mlflow.log_metric(prefix + "-" + "MSE", mse)
    mlflow.log_metric(prefix + "-" + "R2", r2)

    return mse, r2


def run_training():
    """
    Execute the complete training pipeline with MLflow tracking.
    
    Template training function that demonstrates:
    - Data loading and preprocessing
    - Model training with parameter logging
    - Metric computation and tracking
    - Model evaluation on test set
    
    For badminton shot prediction, adapt this to:
    - Load pose sequence data and shot labels
    - Train LSTM/CNN models for temporal pattern recognition
    - Evaluate on shot prediction accuracy
    - Log badminton-specific hyperparameters
    
    Example:
        >>> run_training()  # Trains model and logs to MLflow
        
    Note:
        This function uses template data. For production badminton analysis:
        1. Replace data loading with pose sequence data
        2. Implement appropriate model architecture (LSTM, CNN)
        3. Add badminton-specific evaluation metrics
        4. Configure model saving for inference
    """
    logger.info(f"Getting the data")
    X_train, X_test, y_train, y_test = __get_data()

    logger.info("Training simple model and tracking with MLFlow")
    mlflow.set_tracking_uri(TRACKING_URI)
    mlflow.set_experiment(EXPERIMENT_NAME)
    # model
    logger.info("Training a simple linear regression")
    with mlflow.start_run():
        reg = LinearRegression().fit(X_train, y_train)
        # taking some parameters out of the feature eng.. in your case you can use the params from CV
        params = {
            "altitude_low_meters_mean": altitude_low_meters_mean,
            "altitude_high_meters_mean": altitude_high_meters_mean,
            "altitude_mean_log_mean": altitude_mean_log_mean,
            "fit_intercept": True,
        }
        mlflow.log_params(params)
        mlflow.set_tag("worst_model", "True")
        y_train_pred = reg.predict(X_train)

        __compute_and_log_metrics(y_train, y_train_pred)

        y_test_pred = reg.predict(X_test)
        __compute_and_log_metrics(y_test, y_test_pred, "test")

        logger.info("this is obviously fishy")
        # saving the model
        # logger.info("Saving model in the model folder")
        # path = "models/linear"
        # save_model(sk_model=reg, path=path)
        # logging the model to mlflow will not work without a AWS Connection setup.. too complex for now


if __name__ == "__main__":
    import logging

    logger = logging.getLogger()
    logging.basicConfig(format="%(asctime)s: %(message)s")
    logging.getLogger("pyhive").setLevel(logging.CRITICAL)  # avoid excessive logs
    logger.setLevel(logging.INFO)

    run_training()