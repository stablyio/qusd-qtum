package transformer

import (
	"log"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

// ProxyETHNewBlockFilter implements ETHProxy
type ProxyETHNewBlockFilter struct {
	*qtum.Qtum
	filter *eth.FilterSimulator
}

func (p *ProxyETHNewBlockFilter) Method() string {
	return "eth_newBlockFilter"
}

func (p *ProxyETHNewBlockFilter) Request(rawreq *eth.JSONRPCRequest) (interface{}, error) {
	return p.request()
}

func (p *ProxyETHNewBlockFilter) request() (eth.NewBlockFilterResponse, error) {
	blockCount, err := p.GetBlockCount()
	if err != nil {
		return "", err
	}

	if p.Chain() == qtum.ChainRegTest {
		defer func() {
			if _, generateErr := p.Generate(1, nil); generateErr != nil {
				log.Println("generate block err: ", generateErr)
			}
		}()
	}

	filter := p.filter.New(eth.NewBlockFilterTy)
	filter.Data.Store("lastBlockNumber", blockCount.Uint64())

	return eth.NewBlockFilterResponse(hexutil.EncodeUint64(filter.ID)), nil
}
