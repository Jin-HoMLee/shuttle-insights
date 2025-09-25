#!/usr/bin/env python3
"""
Google Cloud Functions entry point for BST Serverless API

This module provides the entry point for deploying the BST serverless API
on Google Cloud Functions.

Deployment:
    gcloud functions deploy predict-badminton-shot \
        --runtime python39 \
        --trigger-http \
        --allow-unauthenticated \
        --memory 2GB \
        --timeout 60s \
        --source .

Local testing with functions-framework:
    functions-framework --target=predict_badminton_shot --port=8080

Author: Jin-Ho M. Lee
Created for Issue #66: Implement Python-Based Serverless API for BST Inference
"""

# Import the Cloud Functions entry point from serverless_api
from serverless_api import predict_badminton_shot

# Export the function for Cloud Functions
__all__ = ['predict_badminton_shot']