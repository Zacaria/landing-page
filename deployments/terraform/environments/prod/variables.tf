variable "stage" {
  description = "Stage where app should be deployed like dev, staging or prod."
  default     = "prod"
  type        = string
}

variable "cname" {
  description = "Name of CNAME record."
  default     = "www"
  type        = string
}
