#!/bin/bash
# Production Deployment Script for BST API
# 
# This script deploys the BST Production API to Google Cloud Functions
# with proper security configuration and environment variables.
#
# Usage: ./deploy_production.sh [environment]
# Where environment is one of: development, staging, production

set -e

# Configuration
ENVIRONMENT=${1:-staging}
FUNCTION_NAME="bst-production-api-${ENVIRONMENT}"
RUNTIME="python39"
MEMORY="2GB"
TIMEOUT="60s"
REGION="us-central1"

echo "Deploying BST Production API"
echo "=========================================="
echo "Environment: ${ENVIRONMENT}"
echo "Function: ${FUNCTION_NAME}"
echo "Runtime: ${RUNTIME}"
echo "Memory: ${MEMORY}"
echo "Timeout: ${TIMEOUT}"
echo "Region: ${REGION}"
echo

# Validate environment
case $ENVIRONMENT in
  development|staging|production)
    echo "✓ Valid environment: ${ENVIRONMENT}"
    ;;
  *)
    echo "❌ Invalid environment. Use: development, staging, or production"
    exit 1
    ;;
esac

# Check required files
echo "Checking required files..."
REQUIRED_FILES=(
    "production_api.py"
    "serverless_api.py"
    "requirements_production.txt"
    "production_config.py"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✓ $file"
    else
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

# Environment-specific configuration
echo
echo "Configuring environment variables for ${ENVIRONMENT}..."

case $ENVIRONMENT in
  development)
    ENV_VARS="ENV=development,REQUIRE_AUTH=false,ENABLE_DOCS=true,DEBUG=true,LOG_LEVEL=DEBUG"
    ALLOW_UNAUTHENTICATED="--allow-unauthenticated"
    ;;
  staging)
    ENV_VARS="ENV=staging,REQUIRE_AUTH=true,ENABLE_DOCS=true,DEBUG=false,LOG_LEVEL=INFO,RATE_LIMIT_REQUESTS=200"
    ALLOW_UNAUTHENTICATED="--allow-unauthenticated"
    ;;
  production)
    ENV_VARS="ENV=production,REQUIRE_AUTH=true,ENABLE_DOCS=false,DEBUG=false,LOG_LEVEL=INFO,RATE_LIMIT_REQUESTS=100"
    ALLOW_UNAUTHENTICATED=""
    
    # Production-specific security checks
    if [[ -z "$ADMIN_API_KEY" ]]; then
        echo "❌ ADMIN_API_KEY environment variable required for production"
        echo "   Please set: export ADMIN_API_KEY=your-secure-admin-key"
        exit 1
    fi
    
    if [[ -z "$CORS_ORIGINS" ]]; then
        echo "⚠️  CORS_ORIGINS not set. Using default (not recommended for production)"
        CORS_ORIGINS="https://yourdomain.com"
    fi
    
    ENV_VARS="${ENV_VARS},ADMIN_API_KEY=${ADMIN_API_KEY},CORS_ORIGINS=${CORS_ORIGINS}"
    ;;
esac

echo "Environment variables: ${ENV_VARS}"

# Create deployment package
echo
echo "Preparing deployment package..."

# Copy requirements file as requirements.txt (GCF requirement)
cp requirements_production.txt requirements.txt

# Create main.py entry point for Cloud Functions
cat > main.py << EOF
#!/usr/bin/env python3
"""
Cloud Functions entry point for BST Production API

This module provides the entry point for Google Cloud Functions deployment
using FastAPI and functions_framework.
"""

from production_api import app
import functions_framework

@functions_framework.http
def main(request):
    return app(request)
EOF

echo "✓ Created Cloud Functions entry point"

# Deploy to Google Cloud Functions
echo
echo "Deploying to Google Cloud Functions..."

gcloud functions deploy $FUNCTION_NAME \
    --runtime $RUNTIME \
    --trigger-http \
    $ALLOW_UNAUTHENTICATED \
    --memory $MEMORY \
    --timeout $TIMEOUT \
    --region $REGION \
    --source . \
    --entry-point main \
    --set-env-vars $ENV_VARS

if [[ $? -eq 0 ]]; then
    echo
    echo "✅ Deployment successful!"
    
    # Get function URL
    FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(httpsTrigger.url)")
    echo "Function URL: $FUNCTION_URL"
    
    # Test deployment
    echo
    echo "Testing deployment..."
    curl -s -X GET "$FUNCTION_URL" | python -m json.tool
    
    echo
    echo "🏸 BST Production API deployed successfully!"
    echo "Environment: $ENVIRONMENT"
    echo "URL: $FUNCTION_URL"
    echo
    
    if [[ $ENVIRONMENT == "production" ]]; then
        echo "🔒 Production Security Reminders:"
        echo "  - API authentication is REQUIRED"
        echo "  - Documentation is DISABLED"
        echo "  - CORS is restricted to specified origins"
        echo "  - Rate limiting is active"
        echo
        echo "Next steps:"
        echo "  1. Test API with valid API key: curl -H 'X-API-Key: your-key' $FUNCTION_URL/health"
        echo "  2. Create client API keys via admin endpoint"
        echo "  3. Configure monitoring and alerting"
        echo "  4. Update DNS/load balancer to point to: $FUNCTION_URL"
    fi
    
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Cleanup temporary files
rm -f main.py requirements.txt

echo "Deployment complete!"