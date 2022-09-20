terraform {
  backend "s3" {
    bucket         = "opg.terraform.state"
    key            = "pods-hackday-environment/terraform.tfstate"
    encrypt        = true
    region         = "eu-west-1"
    role_arn       = "arn:aws:iam::311462405659:role/pods-hackday-ci"
    dynamodb_table = "remote_lock"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.30.0"
    }
  }
  required_version = ">= 1.2.2"
}

variable "default_role" {
  type    = string
  default = "pods-hackday-ci"
}

locals {
  sandbox_account_id    = "995199299616"
  management_account_id = "311462405659"
}

provider "aws" {
  alias  = "eu_west_1"
  region = "eu-west-1"
  default_tags {
    tags = local.default_tags
  }
  assume_role {
    role_arn     = "arn:aws:iam::${local.sandbox_account_id}:role/${var.default_role}"
    session_name = "opg-pods-hackday-terraform-session"
  }
}

provider "aws" {
  alias  = "global"
  region = "us-east-1"
  default_tags {
    tags = local.default_tags
  }
  assume_role {
    role_arn     = "arn:aws:iam::${local.sandbox_account_id}:role/${var.default_role}"
    session_name = "opg-pods-hackday-terraform-session"
  }
}

provider "aws" {
  alias  = "management_eu_west_1"
  region = "eu-west-1"
  default_tags {
    tags = local.default_tags
  }
  assume_role {
    role_arn     = "arn:aws:iam::${local.management_account_id}:role/${var.default_role}"
    session_name = "opg-pods-hackday-terraform-session"
  }
}

data "aws_region" "current" {
  provider = aws.eu_west_1
}
