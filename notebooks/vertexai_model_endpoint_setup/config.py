import json

LOCAL_MODEL_DIR = "../../models/movenet/saved_model" # Local model path (where your trained model is on disk)

# Get global vars from terraform output
with open("../../terraform/terraform_outputs.json") as f:
    tf_outputs = json.load(f)
PROJECT_ID = tf_outputs["project_id"]["value"]
REGION = tf_outputs["region"]["value"]
BUCKET_NAME = tf_outputs["bucket_name"]["value"]

GCS_MODEL_DIR = "movenet/saved_model"  # # GCS relative path (inside the bucket, used for upload/download functions)
GCS_MODEL_URI = f"gs://{BUCKET_NAME}/{GCS_MODEL_DIR}/" # Full GCS URI (used for Vertex AI, etc.)
MODEL_DISPLAY_NAME = "movenet-tf" # Display name for the model in Vertex AI
