module "website" {
  source = "../../modules/static-website"

  stage = var.stage
  cname = var.cname
}
