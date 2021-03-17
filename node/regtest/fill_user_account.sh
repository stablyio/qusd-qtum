#import private keys and then prefund them

# account 1 - addr=qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW hex=0x7926223070547d2d15b2ef5e7383e541c338ffe9
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk" "ac1"
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword generatetoaddress 600 qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW

# account 2 - addr=qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf hex=0x2352be3db3177f0a07efbe6da5857615b8c9901d
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cRcG1jizfBzHxfwu68aMjhy78CpnzD9gJYZ5ggDbzfYD3EQfGUDZ" "ac2"

# account 3 - addr=qTCCy8qy7pW94EApdoBjYc1vQ2w68UnXPi hex=0x69b004ac2b3993bf2fdf56b02746a1f57997420d
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cV79qBoCSA2NDrJz8S3T7J8f3zgkGfg4ua4hRRXfhbnq5VhXkukT" "ac3"

# account 4 - addr=qWMi6ne9mDQFatRGejxdDYVUV9rQVkAFGp hex=0x8c647515f03daeefd09872d7530fa8d8450f069a
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cV93kaaV8hvNqZ711s2z9jVWLYEtwwsVpyFeEZCP6otiZgrCTiEW" "ac4"

# account 5 - addr=qLcshhsRS6HKeTKRYFdpXnGVZxw96QQcfm hex=0x2191744eb5ebeac90e523a817b77a83a0058003b
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cVPHpTvmv3UjQsZfsMRrW5RrGCyTSAZ3MWs1f8R1VeKJSYxy5uac" "ac5"

#account 6 - addr=qW28njWueNpBXYWj2KDmtFG2gbLeALeHfV hex=0x88b0bf4b301c21f8a47be2188bad6467ad556dcf
qtum-cli -rpcuser=stably -rpcpassword=mandatorypassword importprivkey "cTs5NqY4Ko9o6FESHGBDEG77qqz9me7cyYCoinHcWEiqMZgLC6XY" "ac6"