module "appsync" {
  source = "terraform-aws-modules/appsync/aws"

  name = "dev-appsync"

  schema = file("../../docs/vcrevocations.graphql")

  api_keys = {
    default = null # such key will expire in 7 days
  }


  datasources = {
    dynamodb1 = {
      type       = "AMAZON_DYNAMODB"
      table_name = aws_dynamodb_table.opg_vc_revocation.name
      region     = "eu-west-1"
    }
  }
}
