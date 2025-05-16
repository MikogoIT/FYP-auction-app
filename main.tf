terraform { 
  cloud { 
    
    organization = "tim1" 

    workspaces { 
      name = "auctioneer-tf" 
    } 
  }
  required_providers {
        aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "ap-southeast-1"
}

provider "aws" {
  region = var.region
}


resource "aws_s3_bucket" "cdn" {
  bucket = "auctioneer-cdn"
  force_destroy = true

  tags = {
    Name = "Auctioneer CDN"
  }
}