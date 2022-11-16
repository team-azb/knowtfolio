locals {
  UBUNTU_20_AMI = "ami-088da9557aae42f39"
}

resource "aws_key_pair" "knowtfolio" {
  key_name   = "knowtfolio"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCOAJoXw0P64Q4alue2QrwQ1rWPUvNvtyDRJZ/tj1pjK1DldeeJ7RiZX8da8tTiEhIc4c30O2boPb3tChH5BjOARGK5iIhxAJtMqamEan/Z2AwRYlb65ZjNg6Oo3XjyPQ4460SMo6gNxg2eyNOof+ntcG5DUabVBEmIyJwW+oJA34ZXlPrF5BnV81QlXMOjzdLwIZLwLADH7X7rYUGUkFE4L/EH6DH+T6KdIC0oH4NavCxxXutXpZExt3o/1uRrTZo7qpt1sUb7tB80Cynw73uU/KI3STPriaxPYODa69ieSTcQt2D4X7L9DQWNUsGAoI9azdXgpcYUZ/H3uYiot7md"
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
    from_port   = 8080
    to_port     = 8080
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

  egress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.knowtfolio_db.id]
  }
}