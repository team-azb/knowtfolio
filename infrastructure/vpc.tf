resource "aws_vpc" "knowtfolio" {
  cidr_block = "10.0.0.0/16"
  tags = {
    "Name" = "knowtfolio"
  }
}

resource "aws_subnet" "knowtfolio_public_a" {
  vpc_id                  = aws_vpc.knowtfolio.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-northeast-1a"
  map_public_ip_on_launch = true
  tags = {
    "Name" = "knowtfolio-public-a"
  }
}

resource "aws_subnet" "knowtfolio_public_c" {
  vpc_id                  = aws_vpc.knowtfolio.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-northeast-1c"
  map_public_ip_on_launch = true
  tags = {
    "Name" = "knowtfolio-public-c"
  }
}

resource "aws_subnet" "knowtfolio_private_a" {
  vpc_id            = aws_vpc.knowtfolio.id
  cidr_block        = "10.0.16.0/20"
  availability_zone = "ap-northeast-1a"
  tags = {
    "Name" = "knowtfolio-private-a"
  }
}

resource "aws_subnet" "knowtfolio_private_c" {
  vpc_id            = aws_vpc.knowtfolio.id
  cidr_block        = "10.0.32.0/20"
  availability_zone = "ap-northeast-1c"
  tags = {
    "Name" = "knowtfolio-private-c"
  }
}

resource "aws_internet_gateway" "knowtfolio" {
  vpc_id = aws_vpc.knowtfolio.id

  tags = {
    "Name" = "knowtfolio-igw"
  }
}

resource "aws_route_table" "knowtfolio_public" {
  vpc_id = aws_vpc.knowtfolio.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.knowtfolio.id
  }

  tags = {
    "Name" = "knowtfolio"
  }
}

resource "aws_route_table" "knowtfolio_private_a" {
  vpc_id = aws_vpc.knowtfolio.id

  tags = {
    "Name" = "knowtfolio-private-a"
  }
}

resource "aws_route_table" "knowtfolio_private_c" {
  vpc_id = aws_vpc.knowtfolio.id

  tags = {
    "Name" = "knowtfolio-private-c"
  }
}

resource "aws_route_table_association" "knowtoflio_public_a" {
  route_table_id = aws_route_table.knowtfolio_public.id
  subnet_id      = aws_subnet.knowtfolio_public_a.id
}

resource "aws_route_table_association" "knowtfolio_public_c" {
  route_table_id = aws_route_table.knowtfolio_public.id
  subnet_id      = aws_subnet.knowtfolio_public_c.id
}

resource "aws_main_route_table_association" "knowtfolio" {
  vpc_id         = aws_vpc.knowtfolio.id
  route_table_id = aws_route_table.knowtfolio_public.id
}

resource "aws_route_table_association" "knowtfolio_private_a" {
  route_table_id = aws_route_table.knowtfolio_private_a.id
  subnet_id      = aws_subnet.knowtfolio_private_a.id
}

resource "aws_route_table_association" "knowtfolio_private_c" {
  route_table_id = aws_route_table.knowtfolio_private_c.id
  subnet_id      = aws_subnet.knowtfolio_private_c.id
}