package transformer

import (
	"encoding/json"

	"github.com/dcb9/go-ethereum/common/hexutil"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

// ProxyETHNewFilter implements ETHProxy
type ProxyETHNewFilter struct {
	*qtum.Qtum
	filter *eth.FilterSimulator
}

func (p *ProxyETHNewFilter) Method() string {
	return "eth_newFilter"
}

func (p *ProxyETHNewFilter) Request(rawreq *eth.JSONRPCRequest) (interface{}, error) {
	var req eth.NewFilterRequest
	if err := json.Unmarshal(rawreq.Params, &req); err != nil {
		return nil, err
	}

	return p.request(&req)
}

func (p *ProxyETHNewFilter) request(ethreq *eth.NewFilterRequest) (*eth.NewFilterResponse, error) {
	
	from, err := getBlockNumberByParam(p.Qtum, ethreq.FromBlock, true)
	if err != nil {
		return nil, err
	}

	to, err := getBlockNumberByParam(p.Qtum, ethreq.ToBlock, true)
	if err != nil {
		return nil, err
	}

	filter := p.filter.New(eth.NewFilterTy, ethreq)
	filter.Data.Store("lastBlockNumber", from.Uint64())

	filter.Data.Store("toBlock", to.Uint64())

	if len(ethreq.Topics) > 0 {
		topics, err := translateTopics(ethreq.Topics)
		if err != nil {
			return nil, err
		}
		filter.Data.Store("topics", topics)
	}
	resp := eth.NewFilterResponse(hexutil.EncodeUint64(filter.ID))
	return &resp, nil
}