#!/bin/bash

docker run -it --rm \
  --name qtum \
  -e "QTUM_NETWORK=testnet" \
  -v `pwd`:/dapp \
  -p 9899:9899 \
  -p 9888:9888 \
  -p 3889:3889 \
  -p 13888:13888 \
  hayeah/qtumportal
