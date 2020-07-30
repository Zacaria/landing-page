variable "region" {
  description = "AWS region to hosting resources"
  default     = "us-east-1"
  type        = string
}

variable "app" {
  description = "Name of app"
  default     = "havesomecode-landing"
  type        = string
}

variable "stage" {
  description = "Stage where app should be deployed like dev, staging or prod."
  default     = "prod"
  type        = string
}

variable "artifact_dir" {
  description = "Path to static website"
  default     = "../../client"
  type        = string
}

variable "cert_arn" {
  description = "ARN of the SSL certificate to use for the cloudfront distribution"
  default     = ""
  type        = string
}

variable "domain" {
  description = "Root domain e.g: exmaple.dev."
  default     = "havesomecode.io"
}

variable "cname" {
  description = "Name of CNAME record."
  default     = "www"
}
