package transformer

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
	"github.com/shopspring/decimal"
)

/*
Test is not quite finished:
//Insert some output in []*qtum.DecodedRawTransactionOutV() to force test cover more code
*/
func TestGetTransactionByHashRequest(t *testing.T) {
	//preparing request
	requestParams := []json.RawMessage{[]byte(`"0x11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5"`)}
	request, err := prepareEthRPCRequest(1, requestParams)
	if err != nil {
		panic(err)
	}
	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)

	//preparing answer to "getblockhash"
	getTransactionResponse := qtum.GetTransactionResponse{
		Amount:            decimal.NewFromFloat(0.20689141),
		Fee:               decimal.NewFromFloat(-0.2012),
		Confirmations:     2,
		BlockHash:         "ea26fd59a2145dcecd0e2f81b701019b51ca754b6c782114825798973d8187d6",
		BlockIndex:        2,
		BlockTime:         1533092896,
		ID:                "11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5",
		Time:              1533092879,
		ReceivedAt:        1533092879,
		Bip125Replaceable: "no",
		Details: []*qtum.TransactionDetail{{Account: "",
			Category:  "send",
			Amount:    decimal.NewFromInt(0),
			Vout:      0,
			Fee:       decimal.NewFromFloat(-0.2012),
			Abandoned: false}},
		Hex: "020000000159c0514feea50f915854d9ec45bc6458bb14419c78b17e7be3f7fd5f563475b5010000006a473044022072d64a1f4ea2d54b7b05050fc853ab192c91cc5ca17e23007867f92f2ab59d9202202b8c9ab9348c8edbb3b98b1788382c8f37642ec9bd6a4429817ab79927319200012103520b1500a400483f19b93c4cb277a2f29693ea9d6739daaf6ae6e971d29e3140feffffff02000000000000000063010403400d0301644440c10f190000000000000000000000006b22910b1e302cf74803ffd1691c2ecb858d3712000000000000000000000000000000000000000000000000000000000000000a14be528c8378ff082e4ba43cb1baa363dbf3f577bfc260e66272970100001976a9146b22910b1e302cf74803ffd1691c2ecb858d371288acb00f0000",
	}
	err = mockedClientDoer.AddResponse(2, qtum.MethodGetTransaction, getTransactionResponse)
	if err != nil {
		panic(err)
	}

	decodedRawTransactionResponse := qtum.DecodedRawTransactionResponse{
		ID:       "11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5",
		Hash:     "d0fe0caa1b798c36da37e9118a06a7d151632d670b82d1c7dc3985577a71880f",
		Size:     552,
		Vsize:    552,
		Version:  2,
		Locktime: 608,
		Vins: []*qtum.DecodedRawTransactionInV{{
			TxID: "7f5350dc474f2953a3f30282c1afcad2fb61cdcea5bd949c808ecc6f64ce1503",
			Vout: 0,
			ScriptSig: struct {
				Asm string `json:"asm"`
				Hex string `json:"hex"`
			}{
				Asm: "3045022100af4de764705dbd3c0c116d73fe0a2b78c3fab6822096ba2907cfdae2bb28784102206304340a6d260b364ef86d6b19f2b75c5e55b89fb2f93ea72c05e09ee037f60b[ALL] 03520b1500a400483f19b93c4cb277a2f29693ea9d6739daaf6ae6e971d29e3140",
				Hex: "483045022100af4de764705dbd3c0c116d73fe0a2b78c3fab6822096ba2907cfdae2bb28784102206304340a6d260b364ef86d6b19f2b75c5e55b89fb2f93ea72c05e09ee037f60b012103520b1500a400483f19b93c4cb277a2f29693ea9d6739daaf6ae6e971d29e3140",
			},
		}},
		Vouts: []*qtum.DecodedRawTransactionOutV{},
	}
	err = mockedClientDoer.AddResponse(3, qtum.MethodDecodeRawTransaction, decodedRawTransactionResponse)
	if err != nil {
		panic(err)
	}

	getTransactionReceiptResponse := qtum.GetTransactionReceiptResponse{}
	err = mockedClientDoer.AddResponse(4, qtum.MethodGetTransactionReceipt, &getTransactionReceiptResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHGetTransactionByHash{qtumClient}
	got, err := proxyEth.Request(request)
	if err != nil {
		panic(err)
	}

	want := &eth.GetTransactionByHashResponse{
		Hash:      "0x11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5",
		BlockHash: "0xea26fd59a2145dcecd0e2f81b701019b51ca754b6c782114825798973d8187d6",
		Value:     "0x13bb0f5",
		Nonce:     "0x01",
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

func TestGetTransactionByHashRequest_PrecisionOverflow(t *testing.T) {
	//preparing request
	requestParams := []json.RawMessage{[]byte(`"0x11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5"`)}
	request, err := prepareEthRPCRequest(1, requestParams)
	if err != nil {
		panic(err)
	}
	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)

	//preparing answer to "getblockhash"
	getTransactionResponse := qtum.GetTransactionResponse{
		Amount:            decimal.NewFromFloat(0.20689141234),
		Fee:               decimal.NewFromFloat(-0.2012),
		Confirmations:     2,
		BlockHash:         "ea26fd59a2145dcecd0e2f81b701019b51ca754b6c782114825798973d8187d6",
		BlockIndex:        2,
		BlockTime:         1533092896,
		ID:                "11e97fa5877c5df349934bafc02da6218038a427e8ed081f048626fa6eb523f5",
		Time:              1533092879,
		ReceivedAt:        1533092879,
		Bip125Replaceable: "no",
		Details: []*qtum.TransactionDetail{{Account: "",
			Category:  "send",
			Amount:    decimal.NewFromInt(0),
			Vout:      0,
			Fee:       decimal.NewFromFloat(-0.2012),
			Abandoned: false}},
		Hex: "020000000159c0514feea50f915854d9ec45bc6458bb14419c78b17e7be3f7fd5f563475b5010000006a473044022072d64a1f4ea2d54b7b05050fc853ab192c91cc5ca17e23007867f92f2ab59d9202202b8c9ab9348c8edbb3b98b1788382c8f37642ec9bd6a4429817ab79927319200012103520b1500a400483f19b93c4cb277a2f29693ea9d6739daaf6ae6e971d29e3140feffffff02000000000000000063010403400d0301644440c10f190000000000000000000000006b22910b1e302cf74803ffd1691c2ecb858d3712000000000000000000000000000000000000000000000000000000000000000a14be528c8378ff082e4ba43cb1baa363dbf3f577bfc260e66272970100001976a9146b22910b1e302cf74803ffd1691c2ecb858d371288acb00f0000",
	}
	err = mockedClientDoer.AddResponse(2, qtum.MethodGetTransaction, getTransactionResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHGetTransactionByHash{qtumClient}
	_, err = proxyEth.Request(request)

	want := string("decimal.BigInt() was not a success")
	if err.Error() != want {
		t.Errorf(
			"error\ninput: %s\nwanted error: %s\ngot: %s",
			request,
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(err, "", "  ")),
		)
	}
}
