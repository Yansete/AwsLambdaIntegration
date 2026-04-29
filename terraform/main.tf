provider "aws" {
  region = "us-east-2"
}

locals {
  name = "${var.project_name}-${terraform.workspace}"
}

data "aws_caller_identity" "current" {}