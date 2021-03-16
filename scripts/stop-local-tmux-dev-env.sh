#!/bin/bash

tmux kill-session  -t qtum-local-dev
docker-compose -f node/regtest/docker-compose.yml down
./scripts/reset-local-regtest.sh
