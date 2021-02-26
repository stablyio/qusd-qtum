#!/bin/bash

tmux kill-session  -t qtum-local-dev
tmux new -s qtum-local-dev -d
tmux send-keys 'docker-compose -f node/regtest/docker-compose.yml up' C-m
sleep 5
tmux split-window -h
tmux send-keys 'docker cp node/regtest/fill_user_account.sh qtum_regtest:.; docker exec qtum_regtest /bin/sh -c ./fill_user_account.sh' C-m
tmux a -t qtum-local-dev
