terraform {
  cloud {
    organization = "tim1"
    workspaces {
      name = "auctioneer-tf"
    }
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.35"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  scopes  = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/siteverification"
  ]
}

data "google_project" "project" {
  project_id = var.project_id
}

variable "image_url" {
  description = "Docker image with tag"
  type        = string
}

variable "region" {
  description = "gcp Region"
  type        = string
  default     = "asia-southeast1"
}

variable "project_id" {
  description = "Your GCP project ID"
  type        = string
  default     = "auctioneer-460605"
}

variable "cf_zone" {
  description = "my cloudflare zone ID for timothy-mah.com"
  type        = string
  default     = "9437947d39eb903fb917bf7620872267"
}

variable "SESSION_SECRET" {
  description = "Secret used to sign Express sessions"
  type        = string
  sensitive   = true
}

variable "DATABASE_URL" {
  description = "Connection string for NeonDB"
  type        = string
  sensitive   = true
}

variable "custom_domain" {
  description = "Custom domain to map to Cloud Run"
  type        = string
  default     = "auctioneer.timothy-mah.com"
}

variable "GCS_TELE_BUCKET_NAME" {
  description = "GCS bucket for Telegram bot source"
  type        = string
  default     = "auctioneer-tele-bot"
}

# ---------------------------------------------
# New: Telegram bot token variable
# ---------------------------------------------
variable "TELEGRAM_BOT_TOKEN" {
  description = "Telegram bot token for use by Cloud Function"
  type        = string
  sensitive   = true
}

variable "BOT_SECRET" {
  description = "Telegram bot secret for use by Cloud Function"
  type        = string
  sensitive   = true
}



# Enable the APIs we need
resource "google_project_service" "run_api" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "artifact_registry_api" {
  project = var.project_id
  service = "artifactregistry.googleapis.com"
}

resource "google_project_service" "storage_api" {
  project = var.project_id
  service = "storage.googleapis.com"
}

resource "google_project_service" "cloudfunctions_api" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
}

# Artifact Registry (Docker)
resource "google_artifact_registry_repository" "fyp_docker_repo" {
  project       = var.project_id
  location      = var.region
  repository_id = "fyp-auction-app"
  format        = "DOCKER"
  description   = "GAR Docker repo for Auctioneer app"
  cleanup_policy_dry_run = false
  cleanup_policies {
    id         = "delete_untagged_older_than_4d"
    action     = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "4d"
    }
  }
}

resource "google_artifact_registry_repository_iam_member" "cloud_run_pull" {
  repository = google_artifact_registry_repository.fyp_docker_repo.repository_id
  location   = var.region
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "cloud_run_app" {
  name     = "auctioneer-app"
  location = var.region
  template {
    containers {
      image = var.image_url
      ports {
        container_port = 8080
      }
      env {
        name  = "DATABASE_URL"
        value = var.DATABASE_URL
      }
      env {
        name  = "SESSION_SECRET"
        value = var.SESSION_SECRET
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }
  depends_on = [google_project_service.run_api]
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.cloud_run_app.location
  name     = google_cloud_run_v2_service.cloud_run_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# GCS Buckets for app
resource "google_storage_bucket" "upl_dp_img_bucket" {
  name                        = "auctioneer-dp-images"
  location                    = google_cloud_run_v2_service.cloud_run_app.location
  uniform_bucket_level_access = true
  force_destroy               = true
}
resource "google_storage_bucket_iam_member" "cloud_run_can_upload" {
  bucket = google_storage_bucket.upl_dp_img_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
resource "google_storage_bucket_iam_member" "public_read_access" {
  bucket = google_storage_bucket.upl_dp_img_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket" "dev_static_images_bucket" {
  name                        = "auctioneer-static-assets"
  location                    = google_cloud_run_v2_service.cloud_run_app.location
  uniform_bucket_level_access = true
  force_destroy               = true
}
resource "google_storage_bucket_iam_member" "dev_assets_public_read" {
  bucket = google_storage_bucket.dev_static_images_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# ---------------------------------------------
# New: Telegram bot code bucket & function
# ---------------------------------------------
# 1) Create a dedicated bucket for your telegram zip
resource "google_storage_bucket" "telegram_source_bucket" {
  name                        = var.GCS_TELE_BUCKET_NAME
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

# 2) Grant read access to Cloud Functions runtime
resource "google_cloudfunctions2_function_iam_member" "telegram_invoker_cr" {
  project        = var.project_id
  location       = var.region
  cloud_function = google_cloudfunctions2_function.telegram.name
  role           = "roles/cloudfunctions.invoker"
  member         = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}



resource "google_cloudfunctions2_function" "telegram" {
  name     = "telegramBotGen2"
  project  = var.project_id
  location = var.region

  build_config {
    runtime     = "python313"
    # entry_point = "telegram_entry"
    

    source {
      storage_source {
        bucket = google_storage_bucket.telegram_source_bucket.name
        object = "telegram.zip"
      }
    }
  }

  service_config {
    # Scale from 0 up to 10 instances
    min_instance_count             = 0
    max_instance_count             = 3

    # Function timeout
    timeout_seconds                = 60

    # env vars
    environment_variables          = {
      TELEGRAM_BOT_TOKEN = var.TELEGRAM_BOT_TOKEN,
      BOT_SECRET = var.BOT_SECRET
    }

    # Allow all traffic (HTTP) and route 100% to latest revision
    ingress_settings               = "ALLOW_ALL"
    all_traffic_on_latest_revision = true
  }
}

# then separately grant public invoke permission:
resource "google_cloudfunctions2_function_iam_member" "invoker" {
  project        = var.project_id
  location       = var.region
  cloud_function = google_cloudfunctions2_function.telegram.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}



