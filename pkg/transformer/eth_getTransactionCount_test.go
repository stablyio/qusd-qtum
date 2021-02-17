package transformer

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestGetTransactionCountRequest(t *testing.T) {
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

	//preparing proxy & executing request
	proxyEth := ProxyETHTxCount{qtumClient}
	got, err := proxyEth.Request(request)
	if err != nil {
		panic(err)
	}

	want := string("0x1") //tx count is hardcoded inside the implement
	if !reflect.DeepEqual(got, want) {
		t.Errorf(
			"error\ninput: %s\nwant: %s\ngot: %s",
			request,
			want,
			got,
		)
	}
}
