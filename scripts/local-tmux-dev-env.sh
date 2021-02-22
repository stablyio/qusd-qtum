#!/bin/bash

tmux kill-session  -t qtum-local-dev
tmux new -s qtum-local-dev -d
tmux send-keys 'cd vendor/janus/docker/quick_start; docker-compose up' C-m
sleep 5
tmux split-window -h
tmux send-keys 'cd vendor/janus/docker/quick_start; docker cp fill_user_account.sh qtum_testchain:.; docker exec qtum_testchain /bin/sh -c ./fill_user_account.sh; cd ../../../../token' C-m
tmux a -t qtum-local-dev
