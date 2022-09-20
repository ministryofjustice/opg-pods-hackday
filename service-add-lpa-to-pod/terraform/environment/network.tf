data "aws_vpc" "main" {
  filter {
    name   = "tag:application"
    values = ["sandbox"]
  }
  provider = aws.eu_west_1
}

data "aws_availability_zones" "available" {
  provider = aws.eu_west_1
}

data "aws_subnet" "application" {
  count             = 3
  vpc_id            = data.aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]

  filter {
    name   = "tag:Name"
    values = ["application*"]
  }
  provider = aws.eu_west_1
}

data "aws_subnet" "public" {
  count             = 3
  vpc_id            = data.aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]

  filter {
    name   = "tag:Name"
    values = ["public*"]
  }
  provider = aws.eu_west_1
}

# application_subnets = data.aws_subnet.application.*.id
# public_subnets      = data.aws_subnet.public.*.id
