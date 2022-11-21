resource "aws_dynamodb_table" "user_to_wallet" {
  hash_key       = "user_id"
  range_key      = "wallet_address"
  name           = "user_to_wallet"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "user_id"
    type = "S"
  }
  attribute {
    name = "wallet_address"
    type = "S"
  }

  global_secondary_index {
    hash_key        = "wallet_address"
    name            = "wallet_address-index"
    projection_type = "ALL"
    range_key       = "user_id"
    read_capacity   = 1
    write_capacity  = 1
  }
}