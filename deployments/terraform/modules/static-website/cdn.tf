resource "aws_s3_bucket" "site_bucket" {
  bucket = "${var.app}-site-bucket--stage-${var.stage}"

  force_destroy = true

  acl = "public-read"

  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${var.app}-site-bucket--stage-${var.stage}/*"
    }
  ]
}
EOF

  tags = {
    APP   = var.app
    STAGE = var.stage
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}
