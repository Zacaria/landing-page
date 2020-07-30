provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

module "static-website" {
  source  = "GeminiWind/static-website/aws"
  version = "1.0.0"

  region = "us-east-1"
  app    = "havesomecode-landing"
  stage  = "prod"

  artifact_dir = "../../client"

  domain = "havesomecode.io."
  cname  = "www"
}

output "website_url" {
  value       = module.static-website.website_url
  description = "website url to plug into the dns"
}