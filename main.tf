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


variable "image_url" {
  description = "Docker Hub image URI"
  type        = string
  default     = "docker.io/boiledsteak/fyp-auction-app:latest"
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
# Enable the Cloud Run API
#————————————————————————————————————
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
  project = var.project_id
  disable_on_destroy = false
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


# Grant storage access to the Cloud Run service account
resource "google_storage_bucket_iam_member" "cloud_run_can_upload" {
  bucket = google_storage_bucket.upl_dp_img_bucket.name
  role   = "roles/storage.objectAdmin"

  member = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}


resource "google_project_service" "storage_api" {
  project = var.project_id
  service = "storage.googleapis.com"
}

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
