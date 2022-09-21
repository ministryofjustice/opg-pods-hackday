output "workspace_name" {
  value = terraform.workspace
}

variable "container_version" {
  type    = string
  default = "latest"
}

output "container_version" {
  value = var.container_version
}

locals {
  environment_name = lower(replace(terraform.workspace, "_", "-"))

  mandatory_moj_tags = {
    business-unit    = "OPG"
    application      = "opg-pods-hackday-revocation-service"
    environment-name = local.environment_name
    owner            = "OPG Webops: opgteam+pods-hackday@digital.justice.gov.uk"
    is-production    = false
    runbook          = "https://github.com/ministryofjustice/opg-pods-hackday"
    source-code      = "https://github.com/ministryofjustice/opg-pods-hackday"
  }

  optional_tags = {
    account-name           = "sandbox"
    infrastructure-support = "OPG Webops: opgteam+modernising-lpa@digital.justice.gov.uk"
  }

  default_tags = merge(local.mandatory_moj_tags, local.optional_tags)
}
