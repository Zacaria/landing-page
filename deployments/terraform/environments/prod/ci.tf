terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    # The name of your Terraform Cloud organization.
    organization = "havesomecode"

    # The name of the Terraform Cloud workspace to store Terraform state files in.
    workspaces {
      prefix = "landing-page-"
    }
  }
}