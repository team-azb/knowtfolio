#!/bin/bash
APP_ROOT=/home/ubuntu/knowtfolio
export $(cat $APP_ROOT/.env | grep -v '^#' | xargs)
nohup $APP_ROOT/server > $APP_ROOT/knowtfolio.out.log 2> $APP_ROOT/knowtfolio.err.log < /dev/null &
