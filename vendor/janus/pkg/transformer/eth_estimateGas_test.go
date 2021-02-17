package transformer

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

func TestEstimateGasRequest(t *testing.T) {
	request := eth.CallRequest{
		From: "0x1e6f89d7399081b4f8f8aa1ae2805a5efff2f960",
		To:   "0x1e6f89d7399081b4f8f8aa1ae2805a5efff2f960",
	}
	requestRaw, err := json.Marshal(&request)
	if err != nil {
		panic(err)
	}
	requestParamsArray := []json.RawMessage{requestRaw}
	requestRPC, err := prepareEthRPCRequest(1, requestParamsArray)

	if err != nil {
		panic(err)
	}

	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)
	if err != nil {
		panic(err)
	}

	//preparing responses
	fromHexAddressResponse := qtum.FromHexAddressResponse("0x1e6f89d7399081b4f8f8aa1ae2805a5efff2f960")
	err = mockedClientDoer.AddResponse(2, qtum.MethodFromHexAddress, fromHexAddressResponse)
	if err != nil {
		panic(err)
	}

	callContractResponse := qtum.CallContractResponse{
		Address: "1e6f89d7399081b4f8f8aa1ae2805a5efff2f960",
		ExecutionResult: struct {
			GasUsed       int    `json:"gasUsed"`
			Excepted      string `json:"excepted"`
			NewAddress    string `json:"newAddress"`
			Output        string `json:"output"`
			CodeDeposit   int    `json:"codeDeposit"`
			GasRefunded   int    `json:"gasRefunded"`
			DepositSize   int    `json:"depositSize"`
			GasForDeposit int    `json:"gasForDeposit"`
		}{
			GasUsed:  21678,
			Excepted: "None",
		},
	}
	err = mockedClientDoer.AddResponse(1, qtum.MethodCallContract, callContractResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHCall{qtumClient}
	proxyEthEstimateGas := ProxyETHEstimateGas{&proxyEth}
	got, err := proxyEthEstimateGas.Request(requestRPC)
	if err != nil {
		panic(err)
	}

	want := eth.EstimateGasResponse("0x54ae")
	if !reflect.DeepEqual(got, &want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			request,
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}
