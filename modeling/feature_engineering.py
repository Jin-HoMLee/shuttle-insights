"""
Feature Engineering Module

This module provides data preprocessing and feature engineering functions for machine learning.
Currently contains template functions for data cleaning and transformation workflows.

Key Features:
- Data transformation pipelines
- Missing value imputation
- Column management utilities
- Feature scaling and normalization

Usage Example:
    from modeling.feature_engineering import transform_altitude, fill_missing_values
    
    # Apply transformations
    df = transform_altitude(df)
    df = fill_missing_values(df)

Dependencies:
    - pandas: For DataFrame operations
    - numpy: For numerical computations

Note:
    This module contains template feature engineering functions using coffee quality data
    as an example. For badminton pose analysis, adapt these functions to work with:
    - Pose landmark coordinates (x, y, z positions)
    - Temporal sequences of pose data
    - Shot classification features
    
    Consider adding functions for:
    - Pose sequence normalization
    - Temporal feature extraction
    - Movement pattern analysis

Author: Jin-HoMLee
Last Updated: September 2024
"""

import pandas as pd
import numpy as np

# Template constants - update for your specific use case

altitude_low_meters_mean = 1500.3684210526317
altitude_high_meters_mean = 1505.6315789473683
altitude_mean_log_mean = 7.0571530664031155


def transform_altitude(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform altitude data using logarithmic scaling.
    
    This is a template function demonstrating feature transformation.
    For badminton analysis, adapt this to transform pose coordinates or other features.
    
    Args:
        df (pd.DataFrame): Input DataFrame with altitude data
        
    Returns:
        pd.DataFrame: DataFrame with transformed altitude features
        
    Example:
        >>> df_transformed = transform_altitude(df)
        
    Note:
        Template function - adapt for badminton-specific features like:
        - Pose coordinate normalization
        - Movement velocity calculations
        - Court position transformations
    """
    df["altitude_mean_log"] = np.log(df["altitude_mean_meters"])
    df = df.drop(
        [
            "altitude_mean_meters",
        ],
        axis=1,
    )
    return df


def drop_column(df: pd.DataFrame, col_name: str) -> pd.DataFrame:
    """
    Remove a column from DataFrame.
    
    Simple utility function for removing unwanted columns during preprocessing.
    
    Args:
        df (pd.DataFrame): Input DataFrame
        col_name (str): Name of column to remove
        
    Returns:
        pd.DataFrame: DataFrame with specified column removed
        
    Example:
        >>> df_clean = drop_column(df, "unwanted_column")
    """
    df = df.drop([col_name], axis=1)
    return df


def fill_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing values using predefined means.
    
    Template function for handling missing data using mean imputation.
    For badminton data, adapt to handle missing pose coordinates or tracking gaps.
    
    Args:
        df (pd.DataFrame): Input DataFrame with missing values
        
    Returns:
        pd.DataFrame: DataFrame with missing values filled
        
    Example:
        >>> df_complete = fill_missing_values(df)
        
    Note:
        For badminton pose data, consider:
        - Interpolating missing pose landmarks
        - Handling tracking gaps in video sequences
        - Using pose-specific imputation strategies
    """
    df["altitude_low_meters"] = df["altitude_low_meters"].fillna(
        altitude_low_meters_mean
    )
    df["altitude_high_meters"] = df["altitude_high_meters"].fillna(
        altitude_high_meters_mean
    )
    df["altitude_mean_log"] = df["altitude_mean_log"].fillna(altitude_mean_log_mean)
    return df