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
  default     = "auctioneer-bot"
}

variable "GCS_NOTIF_BUCKET_NAME" {
  description = "GCS bucket for notifications bot source"
  type        = string
  default     = "auctioneer-notif-bot"
}

variable "bot_image_url" {
  description = "Container image URL for the Telegram bot"
  type        = string
}



# name of the notif bot code in zip
variable "notif_object" {
  type = string
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

variable "OPENROUTER_API_KEY" {
  description = "for telegram bot to use ai"
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

