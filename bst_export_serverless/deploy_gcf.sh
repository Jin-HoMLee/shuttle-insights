#!/bin/bash
# To make this script executable, run: chmod +x deploy_gcf.sh
# Google Cloud Functions Deployment Script for BST Serverless API

set -e

# Configuration
FUNCTION_NAME="predict-badminton-shot"
RUNTIME="python39"
MEMORY="2GB"
TIMEOUT="60s"
REGION="us-central1"

echo "Deploying BST Serverless API to Google Cloud Functions..."
echo "Function: $FUNCTION_NAME"
echo "Runtime: $RUNTIME"
echo "Memory: $MEMORY"
echo "Timeout: $TIMEOUT"
echo "Region: $REGION"

# Deploy function
gcloud functions deploy $FUNCTION_NAME \
    --runtime $RUNTIME \
    --trigger-http \
    --allow-unauthenticated \
    --memory $MEMORY \
    --timeout $TIMEOUT \
    --region $REGION \
    --source . \
    --entry-point predict_badminton_shot

echo "Deployment complete!"

# Get function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(httpsTrigger.url)")
echo "Function URL: $FUNCTION_URL"

# Test deployment
echo "Testing deployment..."
curl -X GET "$FUNCTION_URL" \
    -H "Content-Type: application/json"

echo -e "\n\nDeployment successful! Use the following URL for API calls:"
echo "$FUNCTION_URL"