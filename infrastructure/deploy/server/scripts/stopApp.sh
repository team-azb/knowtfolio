#!/bin/bash
PID=$(lsof -t -i :8080)
if [ -n "$PID" ]; then
  kill $PID
  echo "stopped server PID:$PID"
else
  echo "no server to stop"
fi
exit 0
