package transformer

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
)

// ProxyETHEstimateGas implements ETHProxy
type ProxyETHGasPrice struct {
	*qtum.Qtum
}

func (p *ProxyETHGasPrice) Method() string {
	return "eth_gasPrice"
}

func (p *ProxyETHGasPrice) Request(rawreq *eth.JSONRPCRequest) (interface{}, error) {
	qtumresp, err := p.Qtum.GetGasPrice()
	if err != nil {
		return nil, err
	}

	// qtum res -> eth res
	return p.response(qtumresp), nil
}

func (p *ProxyETHGasPrice) response(qtumresp *big.Int) string {
	return hexutil.EncodeBig(qtumresp)
}
