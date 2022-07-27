resource "aws_lb" "knowtfolio_backend" {
  name               = "knowtfolio-backend"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.knowtfolio_public_a.id, aws_subnet.knowtfolio_public_c.id]
  security_groups    = [aws_security_group.knowtfolio_backend_alb.id]

  tags = {
    Environment = "development"
  }
}

resource "aws_lb_target_group" "knowtfolio_backend" {
  name        = "knowtfolio-backend"
  target_type = "instance"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.knowtfolio.id

  health_check {
    interval            = 30
    path                = "/api/articles/"
    port                = 8080
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 4
    matcher             = "200"
  }
}

resource "aws_lb_target_group_attachment" "knowtfolio_backend" {
  target_group_arn = aws_lb_target_group.knowtfolio_backend.arn
  target_id        = aws_instance.knowtfolio_backend.id
  port             = 8080
}

resource "aws_lb_listener" "knowtfolio_backend" {
  load_balancer_arn = aws_lb.knowtfolio_backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.knowtfolio_backend.arn
  }
}

resource "aws_security_group" "knowtfolio_backend_alb" {
  name   = "knowtfolio-backend-alb"
  vpc_id = aws_vpc.knowtfolio.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}