package transformer

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/btcsuite/btcutil"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

func TestGetAccountInfoRequest(t *testing.T) {
	//prepare request
	requestParams := []json.RawMessage{[]byte(`"0x1e6f89d7399081b4f8f8aa1ae2805a5efff2f960"`), []byte(`"123"`)}
	requestRPC, err := prepareEthRPCRequest(1, requestParams)
	if err != nil {
		panic(err)
	}
	//prepare client
	mockedClientDoer := doerMappedMock{make(map[string][]byte)}
	qtumClient, err := createMockedClient(mockedClientDoer)
	if err != nil {
		panic(err)
	}

	//prepare account
	account, err := btcutil.DecodeWIF("5JK4Gu9nxCvsCxiq9Zf3KdmA9ACza6dUn5BRLVWAYEtQabdnJ89")
	if err != nil {
		panic(err)
	}
	qtumClient.Accounts = append(qtumClient.Accounts, account)

	//prepare responses
	getAccountInfoResponse := qtum.GetAccountInfoResponse{
		Address: "1e6f89d7399081b4f8f8aa1ae2805a5efff2f960",
		Balance: 12431243,
		// Storage json.RawMessage `json:"storage"`,
		Code: "606060405236156100ad576000357c0100000000000000000...",
	}
	err = mockedClientDoer.AddResponse(3, qtum.MethodGetAccountInfo, getAccountInfoResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHGetCode{qtumClient}
	got, err := proxyEth.Request(requestRPC)
	if err != nil {
		panic(err)
	}

	want := eth.GetCodeResponse("0x606060405236156100ad576000357c0100000000000000000...")
	if !reflect.DeepEqual(got, want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			requestRPC,
			string(mustMarshalIndent(want, "", "  ")),
			string(mustMarshalIndent(got, "", "  ")),
		)
	}
}
