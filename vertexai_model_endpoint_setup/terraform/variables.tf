variable "project_id" {
  description = "Globally unique ID for the project"
  type = string
  default = "shuttle-insights"  # You can set default here or in tfvars
}

variable "bucket_name" {
  description = "Globally unique name for the GCS bucket"
  type        = string
}

variable "region" {
  description = "GCS bucket location region, e.g. us-central1"
  type        = string
  default     = "us-central1"
}