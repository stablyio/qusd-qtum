#!/bin/bash

rm -rf .qtum/regtest
rm token/.openzeppelin/unknown-81.json
cd token; yarn truffle networks --clean localJanus
