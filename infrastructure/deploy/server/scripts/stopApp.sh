#!/bin/bash
PID=$(lsof -t -i :8080)
if [ -n "$PID" ]; then
  kill -9 $PID
  echo "kill server PID:$PID"
else
  echo "no server to kill"
fi
exit 0