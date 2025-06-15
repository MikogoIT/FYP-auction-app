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
  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/siteverification"
  ]
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

data "google_project" "project" {
  project_id = var.project_id
}

variable "cf_zone" {
  description = "my cloudflare zone ID for timothy-mah.com"
  type        = string
  default     = "9437947d39eb903fb917bf7620872267"
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





#————————————————————————————————————
# Enable the APIs we need
#————————————————————————————————————
resource "google_project_service" "run_api" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "artifact_registry_api" {
  project = var.project_id
  service = "artifactregistry.googleapis.com"
}

#————————————————————————————————————
# Create a GAR Docker repository
#————————————————————————————————————
resource "google_artifact_registry_repository" "fyp_docker_repo" {
  provider      = google
  project       = var.project_id
  location      = var.region
  repository_id = "fyp-auction-app"
  format        = "DOCKER"
  description   = "GAR Docker repo for Auctioneer app"

  # actually perform deletions rather than dry-run
  cleanup_policy_dry_run = false

  # delete any untagged images older than 10 days
  cleanup_policies {
    id     = "delete_untagged_older_than_10d"
    action = "DELETE"
    condition {
      tag_state = "UNTAGGED"
      older_than = "10d"
    }
  }
}


#————————————————————————————————————
# Allow Cloud Run to pull images from GAR
#————————————————————————————————————
resource "google_artifact_registry_repository_iam_member" "cloud_run_pull" {
  repository = google_artifact_registry_repository.fyp_docker_repo.repository_id
  location   = var.region
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

#————————————————————————————————————
# actual cloud run definition
#————————————————————————————————————
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

      resources {
        limits = {
          cpu    = "1"      # 1 vCPU
          memory = "512Mi"  # 512 MiB RAM
        }
      }
    }
  }

  # ensure we've enabled the API first
  depends_on = [google_project_service.run_api]
}



#————————————————————————————————————
# allow public access to website
#————————————————————————————————————
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.cloud_run_app.location
  name     = google_cloud_run_v2_service.cloud_run_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}



#————————————————————————————————————
# use cloudflare custom domain
#————————————————————————————————————
# doesnt work... had to do manually




#————————————————————————————————————
# google cloud storage (GCS) stuff
#————————————————————————————————————

# Enable the Storage API
resource "google_project_service" "storage_api" {
  project = var.project_id
  service = "storage.googleapis.com"
}

# 1️⃣ User-uploaded display photo bucket
resource "google_storage_bucket" "upl_dp_img_bucket" {
  name     = "auctioneer-dp-images"
  location = google_cloud_run_v2_service.cloud_run_app.location
  uniform_bucket_level_access = true

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 30
    }
  }

  force_destroy = true
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

# 2️⃣ Developer static asset bucket (for /images folder)
resource "google_storage_bucket" "dev_static_images_bucket" {
  name     = "auctioneer-static-assets"
  location = google_cloud_run_v2_service.cloud_run_app.location
  uniform_bucket_level_access = true

  force_destroy = true
}

resource "google_storage_bucket_iam_member" "dev_assets_public_read" {
  bucket = google_storage_bucket.dev_static_images_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
