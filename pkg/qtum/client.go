package qtum

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math/big"
	"net/http"
	"net/url"
	"sync"

	"github.com/go-kit/kit/log"
	"github.com/go-kit/kit/log/level"
	"github.com/pkg/errors"
)

type Client struct {
	URL  string
	doer doer

	// hex addresses to return for eth_accounts
	Accounts Accounts

	logger log.Logger
	debug  bool

	// is this client using the main network?
	isMain bool

	id      *big.Int
	idStep  *big.Int
	idMutex sync.Mutex
}

func ReformatJSON(input []byte) ([]byte, error) {
	var v interface{}
	err := json.Unmarshal([]byte(input), &v)
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(v, "", "  ")
}

func NewClient(isMain bool, rpcURL string, opts ...func(*Client) error) (*Client, error) {
	err := checkRPCURL(rpcURL)
	if err != nil {
		return nil, err
	}

	c := &Client{
		isMain: isMain,
		doer:   http.DefaultClient,
		URL:    rpcURL,
		logger: log.NewNopLogger(),
		debug:  false,
		id:     big.NewInt(0),
		idStep: big.NewInt(1),
	}

	for _, opt := range opts {
		if err := opt(c); err != nil {
			return nil, err
		}
	}

	return c, nil
}

func (c *Client) IsMain() bool {
	return c.isMain
}

func (c *Client) Request(method string, params interface{}, result interface{}) error {
	req, err := c.NewRPCRequest(method, params)
	if err != nil {
		return errors.WithMessage(err, "couldn't make new rpc request")
	}
	resp, err := c.Do(req)
	if err != nil {
		return err
	}
	err = json.Unmarshal(resp.RawResult, result)
	if err != nil {
		return errors.Wrap(err, "couldn't unmarshal response result field")
	}
	return nil
}

func (c *Client) Do(req *JSONRPCRequest) (*SuccessJSONRPCResult, error) {
	reqBody, err := json.MarshalIndent(req, "", "  ")
	if err != nil {
		return nil, err
	}

	l := log.With(level.Debug(c.logger))

	l.Log("method", req.Method)

	if c.debug {
		fmt.Printf("=> qtum RPC request\n%s\n", reqBody)
	}

	respBody, err := c.do(bytes.NewReader(reqBody))
	if err != nil {
		return nil, errors.Wrap(err, "Client#do")
	}

	if c.debug {
		maxBodySize := 1024 * 8
		formattedBody, err := ReformatJSON(respBody)
		formattedBodyStr := string(formattedBody)
		if len(formattedBodyStr) > maxBodySize {
			formattedBodyStr = formattedBodyStr[0:maxBodySize/2] + "\n...snip...\n" + formattedBodyStr[len(formattedBody)-maxBodySize/2:]
		}

		if err == nil {
			fmt.Printf("<= qtum RPC response\n%s\n", formattedBodyStr)
		}

		// l.Log("respBody", "abc")
	}

	res, err := responseBodyToResult(respBody)
	if err != nil {
		return nil, errors.Wrap(err, "responseBodyToResult")
	}

	return res, nil
}

func (c *Client) NewRPCRequest(method string, params interface{}) (*JSONRPCRequest, error) {
	paramsJSON, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	c.idMutex.Lock()
	c.id = c.id.Add(c.id, c.idStep)
	c.idMutex.Unlock()

	return &JSONRPCRequest{
		JSONRPC: RPCVersion,
		ID:      json.RawMessage(`"` + c.id.String() + `"`),
		Method:  method,
		Params:  paramsJSON,
	}, nil
}

func (c *Client) do(body io.Reader) ([]byte, error) {
	req, err := http.NewRequest(http.MethodPost, c.URL, body)
	if err != nil {
		return nil, err
	}

	resp, err := c.doer.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() {
		if resp != nil {
			io.Copy(ioutil.Discard, resp.Body)
			resp.Body.Close()
		}
	}()

	reader, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "ioutil error in qtum client package")
	}
	return reader, nil
}

type doer interface {
	Do(*http.Request) (*http.Response, error)
}

func SetDoer(d doer) func(*Client) error {
	return func(c *Client) error {
		c.doer = d
		return nil
	}
}

func SetDebug(debug bool) func(*Client) error {
	return func(c *Client) error {
		c.debug = debug
		return nil
	}
}

func SetLogger(l log.Logger) func(*Client) error {
	return func(c *Client) error {
		c.logger = log.WithPrefix(l, "component", "qtum.Client")
		return nil
	}
}

func SetAccounts(accounts Accounts) func(*Client) error {
	return func(c *Client) error {
		c.Accounts = accounts
		return nil
	}
}

func responseBodyToResult(body []byte) (*SuccessJSONRPCResult, error) {
	var res *JSONRPCResult
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}
	if res.Error != nil {
		return nil, res.Error.TryGetKnownError()
	}

	return &SuccessJSONRPCResult{
		ID:        res.ID,
		RawResult: res.RawResult,
		JSONRPC:   res.JSONRPC,
	}, nil
}

func checkRPCURL(u string) error {
	if u == "" {
		return errors.New("URL must be set")
	}

	qtumRPC, err := url.Parse(u)
	if err != nil {
		return errors.Errorf("QTUM_RPC URL: %s", u)
	}

	if qtumRPC.User == nil {
		return errors.Errorf("QTUM_RPC URL (must specify user & password): %s", u)
	}

	return nil
}
