PROJECT_ID = "your-gcp-project-id"  # TODO: replace with your project id
REGION = "us-central1"  # TODO: replace with your region if needed
BUCKET_NAME = "jinhomlee-movenet-2024"  # <-- CHANGE THIS

# Local model path (where your trained model is on disk)
LOCAL_MODEL_DIR = "../../models/movenet/saved_model"

# GCS relative path (inside the bucket, used for upload/download functions)
GCS_MODEL_DIR = "movenet/saved_model"  # Folder path in bucket

# Full GCS URI (used for Vertex AI, etc.)
GCS_MODEL_URI = "gs://jinhomlee-movenet-2024/movenet/saved_model/"

# Display name for the model in Vertex AI
MODEL_DISPLAY_NAME = "movenet-tf"