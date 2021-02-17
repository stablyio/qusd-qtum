package transformer

import (
	"testing"

	"github.com/shopspring/decimal"
)

func TestEthValueToQtumAmount(t *testing.T) {
	cases := []map[string]interface{}{
		{
			"in":   "0x64",
			"want": decimal.NewFromFloat(0.000001),
		},
		{

			"in":   "0x1",
			"want": decimal.NewFromFloat(0.00000001),
		},
	}
	for _, c := range cases {
		in := c["in"].(string)
		want := c["want"].(decimal.Decimal)
		got, err := EthValueToQtumAmount(in)
		if err != nil {
			t.Error(err)
		}
		if !got.Equal(want) {
			t.Errorf("in: %s, want: %v, got: %v", in, want, got)
		}
	}
}

func TestQtumAmountToEthValue(t *testing.T) {
	in, want := decimal.NewFromFloat(0.000001), "0x64"
	got, err := formatQtumAmount(in)
	if err != nil {
		t.Error(err)
	}
	if got != want {
		t.Errorf("in: %v, want: %s, got: %s", in, want, got)
	}
}
