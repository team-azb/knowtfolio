locals {
  UBUNTU_20_AMI = "ami-088da9557aae42f39"
}

resource "aws_key_pair" "knowtfolio" {
  key_name   = "knowtfolio"
  public_key = file("${path.module}/public_keys/knowtfolio.pub")
}

resource "aws_instance" "knowtfolio_backend" {
  ami                         = local.UBUNTU_20_AMI
  instance_type               = "t2.medium"
  subnet_id                   = aws_subnet.knowtfolio_public_a.id
  key_name                    = aws_key_pair.knowtfolio.id
  associate_public_ip_address = true

  root_block_device {
    volume_type = "gp2"
    volume_size = 30
  }

  vpc_security_group_ids = [aws_security_group.knowtfolio_backend_ec2.id]

  tags = {
    "Name" = "dev-knowtfolio-backend"
  }

  user_data = file("${path.module}/user_data/knowtfolio_backend.sh")
}

resource "aws_security_group" "knowtfolio_backend_ec2" {
  name   = "knowtfolio-backend-ec2"
  vpc_id = aws_vpc.knowtfolio.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}