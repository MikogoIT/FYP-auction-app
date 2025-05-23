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
   
  }
}


provider "google" {
  project = var.project_id
  region  = var.region
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