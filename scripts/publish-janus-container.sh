#!/bin/bash

docker build -t stably/janus vendor/janus
docker push stably/janus:latest
