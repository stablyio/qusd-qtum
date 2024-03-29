package server

import (
	"encoding/json"
	stdLog "log"

	"github.com/go-kit/kit/log/level"
	"github.com/labstack/echo"
	"github.com/pkg/errors"
	"github.com/qtumproject/janus/pkg/eth"
)

func httpHandler(c echo.Context) error {
	myctx := c.Get("myctx")
	cc, ok := myctx.(*myCtx)
	if !ok {
		return errors.New("Could not find myctx")
	}

	var rpcReq *eth.JSONRPCRequest
	decoder := json.NewDecoder(c.Request().Body)
	if err := decoder.Decode(&rpcReq); err != nil {
		return errors.Wrap(err, "json decoder issue")
	}

	cc.rpcReq = rpcReq

	level.Info(cc.logger).Log("msg", "proxy RPC", "method", rpcReq.Method)

	// level.Debug(cc.logger).Log("msg", "before call transformer#Transform")
	result, err := cc.transformer.Transform(rpcReq)
	// level.Debug(cc.logger).Log("msg", "after call transformer#Transform")

	if err != nil {
		err1 := errors.Cause(err)
		if err != err1 {
			level.Error(cc.logger).Log("err", err.Error())
			return cc.JSONRPCError(&eth.JSONRPCError{
				Code:    100,
				Message: err1.Error(),
			})
		}

		return err
	}

	// Allow transformer to return an explicit JSON error
	if jerr, isJSONErr := result.(*eth.JSONRPCError); isJSONErr {
		return cc.JSONRPCError(jerr)
	}

	return cc.JSONRPCResult(result)
}

func errorHandler(err error, c echo.Context) {
	myctx := c.Get("myctx")
	cc, ok := myctx.(*myCtx)
	if ok {
		level.Error(cc.logger).Log("err", err.Error())
		if err := cc.JSONRPCError(&eth.JSONRPCError{
			Code:    100,
			Message: err.Error(),
		}); err != nil {
			level.Error(cc.logger).Log("msg", "reply to client", "err", err.Error())
		}
		return
	}

	stdLog.Println("errorHandler", err.Error())
}
