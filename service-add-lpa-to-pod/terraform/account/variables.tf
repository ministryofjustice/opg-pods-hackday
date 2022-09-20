output "workspace_name" {
  value = terraform.workspace
}

locals {
  mandatory_moj_tags = {
    business-unit    = "OPG"
    application      = "opg-pods-hackday-add-lpa-to-pod"
    environment-name = "development-account"
    owner            = "OPG Webops: opgteam+pods-hackday@digital.justice.gov.uk"
    is-production    = false
    runbook          = "https://github.com/ministryofjustice/opg-pods-hackday"
    source-code      = "https://github.com/ministryofjustice/opg-pods-hackday"
  }

  optional_tags = {
    account-name           = "sandbox"
    infrastructure-support = "OPG Webops: opgteam+pods-hackday@digital.justice.gov.uk"
  }

  default_tags = merge(local.mandatory_moj_tags, local.optional_tags)
}
