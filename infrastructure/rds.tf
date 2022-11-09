resource "aws_db_instance" "knowtfolio_db" {
  identifier             = "knowtfolio-db"
  db_name                = "knowtfolio_db"
  allocated_storage      = 20 # 無料枠は20GBまでなので、初期値もこれに合わせる
  max_allocated_storage  = 100
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t2.micro"
  username               = "admin"
  password               = "password"
  vpc_security_group_ids = [aws_security_group.knowtfolio_db.id]
  db_subnet_group_name   = aws_db_subnet_group.knowtfolio_db.name
  skip_final_snapshot    = true
}

resource "aws_db_subnet_group" "knowtfolio_db" {
  name        = "knowtfolio-db"
  description = "rds subnet group for knowtfolio"
  subnet_ids  = [aws_subnet.knowtfolio_private_a.id, aws_subnet.knowtfolio_private_c.id]
}

resource "aws_security_group" "knowtfolio_db" {
  name        = "knowtfolio-db"
  description = "rds service security group for knowtfolio"
  vpc_id      = aws_vpc.knowtfolio.id
}

resource "aws_security_group_rule" "knowtfolio_db_to_backend" {
  type                     = "egress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.knowtfolio_backend_ec2.id
  security_group_id        = aws_security_group.knowtfolio_db.id
}