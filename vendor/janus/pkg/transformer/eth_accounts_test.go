package transformer

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/btcsuite/btcutil"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

func TestAccountRequest(t *testing.T) {
	requestParams := []json.RawMessage{}
	request, err := prepareEthRPCRequest(1, requestParams)
	if err != nil {
		panic(err)
	}

	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)
	if err != nil {
		panic(err)
	}

	exampleAcc1, err := btcutil.DecodeWIF("5JK4Gu9nxCvsCxiq9Zf3KdmA9ACza6dUn5BRLVWAYEtQabdnJ89")
	if err != nil {
		panic(err)
	}
	exampleAcc2, err := btcutil.DecodeWIF("5JwvXtv6YCa17XNDHJ6CJaveg4mrpqFvcjdrh9FZWZEvGFpUxec")
	if err != nil {
		panic(err)
	}

	qtumClient.Accounts = append(qtumClient.Accounts, exampleAcc1, exampleAcc2)

	//preparing proxy & executing request
	proxyEth := ProxyETHAccounts{qtumClient}
	got, err := proxyEth.Request(request)
	if err != nil {
		panic(err)
	}

	want := eth.AccountsResponse{"0x6d358cf96533189dd5a602d0937fddf0888ad3ae", "0x7e22630f90e6db16283af2c6b04f688117a55db4"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			request,
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}

func TestAccountMethod(t *testing.T) {
	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)
	if err != nil {
		panic(err)
	}
	//preparing proxy & executing request
	proxyEth := ProxyETHAccounts{qtumClient}
	got := proxyEth.Method()

	want := string("eth_accounts")
	if !reflect.DeepEqual(got, want) {
		t.Errorf(
			"error\n\nwant: %s\ngot: %s",
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}
func TestAccountToResponse(t *testing.T) {
	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)
	if err != nil {
		panic(err)
	}
	proxyEth := ProxyETHAccounts{qtumClient}
	callResponse := qtum.CallContractResponse{
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
			Output: "0x0000000000000000000000000000000000000000000000000000000000000002",
		},
	}

	got := proxyEth.ToResponse(&callResponse)
	want := eth.CallResponse("0x0000000000000000000000000000000000000000000000000000000000000002")
	if !reflect.DeepEqual(got, &want) {
		t.Errorf(
			"error\n\nwant: %s\ngot: %s",
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}
