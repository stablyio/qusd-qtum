package transformer

import (
	"encoding/json"
	"math/big"
	"reflect"
	"testing"

	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

func TestBlockNumberRequest(t *testing.T) {
	//preparing request
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

	//preparing client response
	getBlockCountResponse := qtum.GetBlockCountResponse{Int: big.NewInt(11284900)}
	err = mockedClientDoer.AddResponse(2, qtum.MethodGetBlockCount, getBlockCountResponse)
	if err != nil {
		panic(err)
	}

	//preparing proxy & executing request
	proxyEth := ProxyETHBlockNumber{qtumClient}
	got, err := proxyEth.Request(request)
	if err != nil {
		panic(err)
	}

	want := eth.BlockNumberResponse("0xac31a4")
	if !reflect.DeepEqual(got, &want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			request,
			want,
			got,
		)
	}
}
