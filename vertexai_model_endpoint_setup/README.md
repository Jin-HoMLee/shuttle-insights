# VertexAI Model Endpoint Setup

This directory contains notebooks and configuration for deploying trained badminton analysis models to Google Cloud VertexAI.

## Overview

Deploy your trained pose analysis and shot prediction models to Google Cloud for scalable, production-ready inference. This setup enables real-time badminton analysis through cloud endpoints.

## Deployment Pipeline

### 01_export_model_movenet.ipynb
**Purpose**: Export trained models for cloud deployment  
**Description**: Converts locally trained models into formats suitable for VertexAI deployment.

**Key Steps**:
- Model serialization and optimization
- Format conversion for cloud inference
- Model validation and testing
- Preparation for cloud upload

### 02_upload_model_to_gcs.ipynb
**Purpose**: Upload models to Google Cloud Storage  
**Description**: Handles the upload process and organizes models in GCS buckets.

**Key Steps**:
- GCS bucket configuration
- Model artifact upload
- Version management
- Access permission setup

### 03_deploy_model_on_vertexai.ipynb
**Purpose**: Deploy models to VertexAI endpoints  
**Description**: Creates prediction endpoints and configures autoscaling.

**Key Steps**:
- VertexAI model registration
- Endpoint creation and configuration
- Traffic allocation and routing
- Health monitoring setup

## Infrastructure Setup

### terraform/
**Purpose**: Infrastructure as Code for Google Cloud resources  
**Description**: Terraform configurations for provisioning required cloud infrastructure.

**Resources Managed**:
- VertexAI model registry
- Prediction endpoints
- IAM roles and permissions
- Network and security configurations

## Prerequisites

### Google Cloud Setup
1. **Google Cloud Project**: Active GCP project with billing enabled
2. **APIs Enabled**: 
   - VertexAI API
   - Cloud Storage API
   - IAM API
3. **Authentication**: Service account or user credentials configured
4. **Permissions**: Required IAM roles for VertexAI and GCS operations

### Local Environment
```bash
# Install Terraform (for infrastructure setup)
# Install gcloud CLI
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Required Dependencies
- `google-cloud-aiplatform`: VertexAI Python client
- `google-cloud-storage`: GCS operations
- `tensorflow`: Model handling
- `tensorboard`: Model monitoring

## Quick Start

1. **Configure Google Cloud**:
   ```bash
   gcloud config set project your-project-id
   gcloud auth application-default login
   ```

2. **Set up infrastructure** (optional):
   ```bash
   cd terraform/
   terraform init
   terraform plan
   terraform apply
   ```

3. **Run deployment notebooks in order**:
   - Export your trained models
   - Upload to Google Cloud Storage
   - Deploy to VertexAI endpoints

## Configuration

### config.py
Contains deployment configuration settings:
- Project and region settings
- Model versioning
- Endpoint configuration
- Resource allocation settings

Update this file with your specific GCP project details and deployment preferences.

## Model Types Supported

- **Pose Detection Models**: MoveNet, MediaPipe models
- **Shot Prediction Models**: LSTM, CNN models for temporal analysis
- **Classification Models**: Shot type and player action classifiers

## Monitoring and Management

Once deployed, models can be monitored through:
- **VertexAI Console**: Model performance and health metrics
- **Cloud Logging**: Detailed prediction logs
- **Cloud Monitoring**: Custom dashboards and alerts
- **Prediction explanations**: Understanding model decisions

## Cost Considerations

- **Prediction requests**: Pay per prediction call
- **Endpoint uptime**: Costs for keeping endpoints active
- **Storage**: GCS storage for model artifacts
- **Compute**: Machine types for model serving

Consider using:
- **Batch prediction**: For bulk analysis
- **Auto-scaling**: To manage costs during low usage
- **Model versions**: To compare performance and costs

## Security Best Practices

- Use service accounts with minimal required permissions
- Enable audit logging for model access
- Implement request authentication and authorization
- Regular security reviews of IAM policies

## Troubleshooting

Common deployment issues:
- **Authentication errors**: Check gcloud credentials and IAM roles
- **Model format issues**: Ensure proper model serialization
- **Resource quotas**: Verify VertexAI quotas in your project
- **Network connectivity**: Check firewall and VPC settings

---

**Note**: Cloud deployment incurs costs. Monitor usage and configure appropriate limits and alerts to control expenses.