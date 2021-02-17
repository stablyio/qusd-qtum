package transformer

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

func TestGetBlockByNumberRequest(t *testing.T) {
	requestParams := []json.RawMessage{[]byte(`"0x1b4"`), []byte(`true`)}
	request, err := prepareEthRPCRequest(1, requestParams)
	if err != nil {
		panic(err)
	}

	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)

	//preparing answer to "getblockhash"
	getBlockHashResponse := qtum.GetBlockHashResponse("0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331")
	err = mockedClientDoer.AddResponse(2, qtum.MethodGetBlockHash, getBlockHashResponse)
	if err != nil {
		panic(err)
	}

	getBlockHeaderResponse := qtum.GetBlockHeaderResponse{
		Hash:              "bba11e1bacc69ba535d478cf1f2e542da3735a517b0b8eebaf7e6bb25eeb48c5",
		Confirmations:     1,
		Height:            3983,
		Version:           536870912,
		VersionHex:        "20000000",
		Merkleroot:        "0b5f03dc9d456c63c587cc554b70c1232449be43d1df62bc25a493b04de90334",
		Time:              1536551888,
		Mediantime:        1536551728,
		Nonce:             0,
		Bits:              "207fffff",
		Difficulty:        4.656542373906925,
		Chainwork:         "0000000000000000000000000000000000000000000000000000000000001f20",
		HashStateRoot:     "3e49216e58f1ad9e6823b5095dc532f0a6cc44943d36ff4a7b1aa474e172d672",
		HashUTXORoot:      "130a3e712d9f8b06b83f5ebf02b27542fb682cdff3ce1af1c17b804729d88a47",
		Previousblockhash: "6d7d56af09383301e1bb32a97d4a5c0661d62302c06a778487d919b7115543be",
		Flags:             "proof-of-stake",
		Proofhash:         "15bd6006ecbab06708f705ecf68664b78b388e4d51416cdafb019d5b90239877",
		Modifier:          "a79c00d1d570743ca8135a173d535258026d26bafbc5f3d951c3d33486b1f120",
	}
	err = mockedClientDoer.AddResponse(3, qtum.MethodGetBlockHeader, getBlockHeaderResponse)
	if err != nil {
		panic(err)
	}

	getBlockResponse := qtum.GetBlockResponse{
		Hash:              "bba11e1bacc69ba535d478cf1f2e542da3735a517b0b8eebaf7e6bb25eeb48c5",
		Confirmations:     1,
		Strippedsize:      584,
		Size:              620,
		Weight:            2372,
		Height:            3983,
		Version:           536870912,
		VersionHex:        "20000000",
		Merkleroot:        "0b5f03dc9d456c63c587cc554b70c1232449be43d1df62bc25a493b04de90334",
		Time:              1536551888,
		Mediantime:        1536551728,
		Nonce:             0,
		Bits:              "207fffff",
		Difficulty:        4.656542373906925,
		Chainwork:         "0000000000000000000000000000000000000000000000000000000000001f20",
		HashStateRoot:     "3e49216e58f1ad9e6823b5095dc532f0a6cc44943d36ff4a7b1aa474e172d672",
		HashUTXORoot:      "130a3e712d9f8b06b83f5ebf02b27542fb682cdff3ce1af1c17b804729d88a47",
		Previousblockhash: "6d7d56af09383301e1bb32a97d4a5c0661d62302c06a778487d919b7115543be",
		Flags:             "proof-of-stake",
		Proofhash:         "15bd6006ecbab06708f705ecf68664b78b388e4d51416cdafb019d5b90239877",
		Modifier:          "a79c00d1d570743ca8135a173d535258026d26bafbc5f3d951c3d33486b1f120",
		Txs: []string{"3208dc44733cbfa11654ad5651305428de473ef1e61a1ec07b0c1a5f4843be91",
			"8fcd819194cce6a8454b2bec334d3448df4f097e9cdc36707bfd569900268950"},
		Nextblockhash: "d7758774cfdd6bab7774aa891ae035f1dc5a2ff44240784b5e7bdfd43a7a6ec1",
		Signature:     "3045022100a6ab6c2b14b1f73e734f1a61d4d22385748e48836492723a6ab37cdf38525aba022014a51ecb9e51f5a7a851641683541fec6f8f20205d0db49e50b2a4e5daed69d2",
	}
	err = mockedClientDoer.AddResponse(4, qtum.MethodGetBlock, getBlockResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHGetBlockByNumber{qtumClient}
	got, err := proxyEth.Request(request)
	if err != nil {
		panic(err)
	}

	want := &eth.GetBlockByNumberResponse{
		Number:           "0xf8f",
		Hash:             "0xbba11e1bacc69ba535d478cf1f2e542da3735a517b0b8eebaf7e6bb25eeb48c5",
		ParentHash:       "0x6d7d56af09383301e1bb32a97d4a5c0661d62302c06a778487d919b7115543be",
		Miner:            "0x0000000000000000000000000000000000000000",
		Size:             "0x26c",
		Nonce:            "0x0",
		TransactionsRoot: "0x0b5f03dc9d456c63c587cc554b70c1232449be43d1df62bc25a493b04de90334",
		StateRoot:        "0x3e49216e58f1ad9e6823b5095dc532f0a6cc44943d36ff4a7b1aa474e172d672",
		Difficulty:       "0x4",
		TotalDifficulty:  "0x0",
		ExtraData:        "0x0",
		GasLimit:         "0x0",
		GasUsed:          "0x0",
		Timestamp:        "0x5b95ebd0",
		Transactions: []interface{}{"0x3208dc44733cbfa11654ad5651305428de473ef1e61a1ec07b0c1a5f4843be91",
			"0x8fcd819194cce6a8454b2bec334d3448df4f097e9cdc36707bfd569900268950"},
		Uncles: []string{},
	}

	if !reflect.DeepEqual(got, want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			request,
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}
