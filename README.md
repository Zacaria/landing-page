# havesomecode landing-page

## Deploy bucket :

```
cd deployments/terraform
terraform init
terraform apply
```

Refresh terraform state after a drift

`terraform refresh`

## Deploy static site :

```
serverless client deploy
```

## Errors :

Error: error creating CloudFront Distribution: CNAMEAlreadyExists: One or more of the CNAMEs you provided are already associated with a different resource.

`terraform import aws_cloudfront_distribution.distribution [CLOUDFRONT DIST ID]`

https://stackoverflow.com/questions/49838898/terraform-aws-cloudfront-distribution-gives-cnamealreadyexists-error-after-chan