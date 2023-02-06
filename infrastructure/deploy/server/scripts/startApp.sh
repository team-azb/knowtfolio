#!/bin/bash
APP_ROOT=/home/ubuntu/knowtfolio
export $(cat $APP_ROOT/.env | grep -v '^#' | xargs)
# templateとして用いるhtmlファイルのパスを指定するため、バイナリと同階層をworking directoryにする必要がある
cd $APP_ROOT
nohup ./server > /dev/null 2> knowtfolio.err.log &
