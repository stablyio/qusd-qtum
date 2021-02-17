package transformer

import (
	"bytes"
	"encoding/binary"
	"encoding/hex"

	"github.com/btcsuite/btcd/btcec"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/pkg/errors"
	"github.com/qtumproject/janus/pkg/eth"
	"github.com/qtumproject/janus/pkg/qtum"
	"github.com/qtumproject/janus/pkg/utils"
)

// ProxyETHGetLogs implements ETHProxy
type ProxyETHSign struct {
	*qtum.Qtum
}

func (p *ProxyETHSign) Method() string {
	return "eth_sign"
}

func (p *ProxyETHSign) Request(rawreq *eth.JSONRPCRequest) (interface{}, error) {
	var req eth.SignRequest
	if err := unmarshalRequest(rawreq.Params, &req); err != nil {
		return nil, err
	}

	addr := utils.RemoveHexPrefix(req.Account)

	acc := p.Qtum.Accounts.FindByHexAddress(addr)
	if acc == nil {
		return nil, errors.Errorf("No such account: %s", addr)
	}

	sig, err := signMessage(acc.PrivKey, req.Message)
	if err != nil {
		return nil, err
	}

	return eth.SignResponse("0x" + hex.EncodeToString(sig)), nil
}

func signMessage(key *btcec.PrivateKey, msg []byte) ([]byte, error) {
	msghash := chainhash.DoubleHashB(paddedMessage(msg))

	secp256k1 := btcec.S256()

	return btcec.SignCompact(secp256k1, key, msghash, true)
}

var qtumSignMessagePrefix = []byte("\u0015Qtum Signed Message:\n")

func paddedMessage(msg []byte) []byte {
	var wbuf bytes.Buffer

	wbuf.Write(qtumSignMessagePrefix)

	var msglenbuf [binary.MaxVarintLen64]byte
	msglen := binary.PutUvarint(msglenbuf[:], uint64(len(msg)))

	wbuf.Write(msglenbuf[:msglen])
	wbuf.Write(msg)

	return wbuf.Bytes()
}
