resource "aws_dynamodb_table" "knowtfolio" {
  hash_key       = "type"
  range_key      = "key"
  name           = "knowtfolio"
  read_capacity  = 1
  write_capacity = 1

  // Each (type, key) combination holds a single string field `value`.
  attribute {
    name = "type"
    type = "S"
  }
  attribute {
    name = "key"
    type = "S"
  }
}