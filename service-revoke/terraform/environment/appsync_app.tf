resource "aws_appsync_graphql_api" "opg_vc_revocation" {
  provider            = aws.eu_west_1
  name                = "${local.environment_name}TerraformBuiltAPI"
  authentication_type = "API_KEY"
  xray_enabled        = true
  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.opg_vc_revocation.arn
    field_log_level          = "ALL"
  }

  schema = file("../../docs/vcrevocations.graphql")
}

resource "aws_appsync_api_key" "opg_vc_revocation" {
  provider = aws.eu_west_1
  api_id   = aws_appsync_graphql_api.opg_vc_revocation.id
  expires  = timeadd(timestamp(), "360h") # Now plus 15 days
}

resource "aws_dynamodb_table" "opg_vc_revocation" {
  provider       = aws.eu_west_1
  name           = "${local.environment_name}TerraformBuiltAPITable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  stream_enabled = false
  server_side_encryption {
    enabled     = true
    kms_key_arn = "arn:aws:kms:eu-west-1:995199299616:key/57f44be0-8c17-48db-8ef9-d87b57214538"
  }

  attribute {
    name = "id"
    type = "S"
  }

}

resource "aws_appsync_datasource" "opg_vc_revocation" {
  provider         = aws.eu_west_1
  api_id           = aws_appsync_graphql_api.opg_vc_revocation.id
  name             = "${local.environment_name}TerraformBuiltAPI"
  description      = "DynamoDB table backing the VCRevocationManual object type."
  service_role_arn = aws_iam_role.opg_vc_revocation.arn
  type             = "AMAZON_DYNAMODB"

  dynamodb_config {
    table_name = aws_dynamodb_table.opg_vc_revocation.name
  }
}

resource "aws_iam_role" "opg_vc_revocation" {
  provider = aws.eu_west_1
  name     = "${local.environment_name}terraform_built_api_role"
  path     = "/service-role/"
  managed_policy_arns = [
    aws_iam_policy.opg_vc_revocation.arn,
  ]

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "opg_vc_revocation" {
  provider    = aws.eu_west_1
  name        = "${local.environment_name}terraform_built_api_policy"
  path        = "/service-role/"
  description = "Allows the AWS AppSync service to access your data source."

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:*",
          # "dynamodb:GetItem",
          # "dynamodb:PutItem",
          # "dynamodb:Query",
          # "dynamodb:Scan",
          # "dynamodb:UpdateItem"
        ],
        Effect = "Allow"
        Resource = [
          "${aws_dynamodb_table.opg_vc_revocation.arn}",
          "${aws_dynamodb_table.opg_vc_revocation.arn}/*"
        ]
      },
    ]
  })
}

# resource "aws_iam_role_policy" "opg_vc_revocation" {
#   provider = aws.eu_west_1
#   name     = "${local.environment_name}opg_vc_revocation"
#   role     = aws_iam_role.opg_vc_revocation.id

#   policy = <<EOF
# {
#     "Version": "2012-10-17",
#     "Statement": [
#         {
#             "Effect": "Allow",
#             "Action": [
#                 "dynamodb:DeleteItem",
#                 "dynamodb:GetItem",
#                 "dynamodb:PutItem",
#                 "dynamodb:Query",
#                 "dynamodb:Scan",
#                 "dynamodb:UpdateItem"
#             ],
#             "Resource": [
#                 "${aws_dynamodb_table.opg_vc_revocation.arn}",
#                 "${aws_dynamodb_table.opg_vc_revocation.arn}/*"
#             ]
#         }
#     ]
# }
# EOF
# }

resource "aws_cloudwatch_query_definition" "logs" {
  provider        = aws.eu_west_1
  name            = "Hackday/Revocation Service/${local.environment_name} appsync logs"
  log_group_names = ["/aws/appsync/apis/${aws_appsync_graphql_api.opg_vc_revocation.id}"]

  query_string = <<EOF
fields @timestamp, @message
| sort @timestamp desc
EOF
}

output "app_fqdn" {
  value = aws_appsync_graphql_api.opg_vc_revocation.uris["GRAPHQL"]
}
