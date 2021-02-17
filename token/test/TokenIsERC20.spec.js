const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const { expect } = require("chai");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const QUSDContract = artifacts.require("QUSDImplementation.sol");

// Based on the OpenZeppelin ERC20 tests for ERC20
contract("Token is ERC20", function ([owner, user1, user2, user3]) {
  const _name = "QUSD";
  const _symbol = "QUSD";
  const _decimals = new BN(6);

  const _uint256maxvalue = new BN(2).pow(new BN(256)).subn(1); // 2^256-1 is the max value for uint256

  const _onlyOwnerError = "only the owner can call this function";
  const _safeMathOverflowError = "SafeMath: addition overflow.";
  const _safeMathUnderflowError = "SafeMath: subtraction overflow.";
  const _insufficientFundsError = "insufficient funds";
  const _insufficientAllowanceError = "insufficient allowance";

  beforeEach(async function () {
    const proxiedQUSD = await deployProxy(QUSDContract);
    this.token = proxiedQUSD;
  });

  describe("when getting details", function () {
    it("has a name", async function () {
      expect(await this.token.name()).to.eq(_name);
    });

    it("has a symbol", async function () {
      expect(await this.token.symbol()).to.eq(_symbol);
    });

    it("has an amount of decimals", async function () {
      expect(await this.token.decimals()).to.be.bignumber.eq(_decimals);
    });
  });

  describe("when setting details", function () {
    const _newName = "StableUSD";
    const _newSymbol = "USD";

    describe("as the owner", function () {
      const _caller = owner;

      it("can change the name", async function () {
        await this.token.changeName(_newName, { from: _caller });
        expect(await this.token.name()).to.eq(_newName);
      });

      it("can change the symbol", async function () {
        await this.token.changeSymbol(_newSymbol, { from: _caller });
        expect(await this.token.symbol()).to.eq(_newSymbol);
      });
    });

    describe("as non-owner", function () {
      const _caller = user1;

      it("cannot change the name", async function () {
        await expectRevert(
          this.token.changeName(_newName, { from: _caller }),
          _onlyOwnerError
        );
      });

      it("cannot change the symbol", async function () {
        await expectRevert(
          this.token.changeSymbol(_newSymbol, { from: _caller }),
          _onlyOwnerError
        );
      });
    });
  });

  describe("when changing allowance", function () {
    const _approver = user1;
    const _spender = user2;

    describe("when setting allowance", function () {
      const _approvalAmount = new BN(100);

      describe("when the sender has enough balance", function () {
        beforeEach(async function () {
          await this.token.mintTo(_approver, _approvalAmount, {
            from: owner,
          });
        });

        describe("when approving an allowance", function () {
          it("emits an approval event", async function () {
            const { logs } = await this.token.approve(
              _spender,
              _approvalAmount,
              { from: _approver }
            );

            expectEvent.inLogs(logs, "Approval", {
              owner: _approver,
              spender: _spender,
              value: _approvalAmount,
            });
          });

          describe("when there was no approved amount before", function () {
            it("approves the requested amount", async function () {
              await this.token.approve(_spender, _approvalAmount, {
                from: _approver,
              });

              expect(
                await this.token.allowance(_approver, _spender)
              ).to.be.bignumber.eq(_approvalAmount);
            });
          });

          describe("when the spender had an approved amount", function () {
            beforeEach(async function () {
              await this.token.approve(_spender, new BN(1), {
                from: _approver,
              });
            });

            it("approves the requested amount and replaces the previous one", async function () {
              await this.token.approve(_spender, _approvalAmount, {
                from: _approver,
              });

              expect(
                await this.token.allowance(_approver, _spender)
              ).to.be.bignumber.eq(_approvalAmount);
            });
          });
        });
      });

      describe("when the sender does not have enough balance", function () {
        const _balance = _approvalAmount.subn(1);

        beforeEach(async function () {
          await this.token.mintTo(_approver, _balance, { from: owner });
        });

        it("can approve beyond the balance", async function () {
          await this.token.approve(_spender, _approvalAmount, {
            from: _approver,
          });

          expect(await this.token.balanceOf(_approver)).to.be.bignumber.eq(
            _balance
          );
          expect(
            await this.token.allowance(_approver, _spender)
          ).to.be.bignumber.eq(_approvalAmount);
          expect(_approvalAmount).to.be.bignumber.greaterThan(_balance);
        });
      });
    });

    describe("when atomically increasing an allowance", function () {
      const _approvalAmount = new BN("100");

      describe("when there was no approved amount before", function () {
        it("approves the requested amount", async function () {
          await this.token.increaseAllowance(_spender, _approvalAmount, {
            from: _approver,
          });

          expect(
            await this.token.allowance(_approver, _spender)
          ).to.be.bignumber.eq(_approvalAmount);
        });
      });

      describe("when the spender had an approved amount", function () {
        const _existingApproval = new BN(1);

        beforeEach(async function () {
          await this.token.approve(_spender, _existingApproval, {
            from: _approver,
          });
        });

        it("emits an approval event with the resulting approval amount", async function () {
          const { logs } = await this.token.increaseAllowance(
            _spender,
            _approvalAmount,
            { from: _approver }
          );

          expectEvent.inLogs(logs, "Approval", {
            owner: _approver,
            spender: _spender,
            value: _approvalAmount.add(_existingApproval),
          });
        });

        it("adds the requested amount to the previous one", async function () {
          await this.token.increaseAllowance(_spender, _approvalAmount, {
            from: _approver,
          });

          expect(
            await this.token.allowance(_approver, _spender)
          ).to.be.bignumber.equal(_approvalAmount.add(_existingApproval));
        });

        it("cannot overflow", async function () {
          await expectRevert(
            this.token.increaseAllowance(_spender, _uint256maxvalue, {
              from: _approver,
            }),
            _safeMathOverflowError
          );
        });
      });
    });

    describe("when atomically decreasing an allowance", function () {
      const _decreaseAmount = new BN(100);

      describe("when there was no approved amount before", function () {
        it("cannot underflow", async function () {
          await expectRevert(
            this.token.decreaseAllowance(_spender, _decreaseAmount, {
              from: _approver,
            }),
            _safeMathUnderflowError
          );
        });
      });

      describe("when the spender had an approved amount", function () {
        const _existingApproval = new BN(200);

        beforeEach(async function () {
          await this.token.approve(_spender, _existingApproval, {
            from: _approver,
          });
        });

        it("emits an approval event with the resulting approval amount", async function () {
          const { logs } = await this.token.decreaseAllowance(
            _spender,
            _decreaseAmount,
            { from: _approver }
          );

          expectEvent.inLogs(logs, "Approval", {
            owner: _approver,
            spender: _spender,
            value: _existingApproval.sub(_decreaseAmount),
          });
        });

        it("subtracts the requested amount from the previous one", async function () {
          await this.token.decreaseAllowance(_spender, _decreaseAmount, {
            from: _approver,
          });

          expect(
            await this.token.allowance(_approver, _spender)
          ).to.be.bignumber.equal(_existingApproval.sub(_decreaseAmount));
        });

        it("cannot underflow", async function () {
          await expectRevert(
            this.token.decreaseAllowance(_spender, _uint256maxvalue, {
              from: _approver,
            }),
            _safeMathUnderflowError
          );
        });
      });
    });
  });

  describe("when transferring", function () {
    const _sender = user1;
    const _receiver = user2;

    describe("when sender has enough balance", function () {
      const _senderBalance = new BN(100);
      const _transferAmount = new BN(10);

      beforeEach(async function () {
        await this.token.mintTo(_sender, _senderBalance, {
          from: owner,
        });
      });

      describe("when transferring own balance", function () {
        it("emits a transfer event", async function () {
          const { logs } = await this.token.transfer(
            _receiver,
            _transferAmount,
            { from: _sender }
          );

          expectEvent.inLogs(logs, "Transfer", {
            from: _sender,
            to: _receiver,
            value: _transferAmount,
          });
        });

        it("transfers the requested amount", async function () {
          await this.token.transfer(_receiver, _transferAmount, {
            from: _sender,
          });

          expect(await this.token.balanceOf(_sender)).to.be.bignumber.equal(
            _senderBalance.sub(_transferAmount)
          );

          expect(await this.token.balanceOf(_receiver)).to.be.bignumber.equal(
            _transferAmount
          );
        });

        it("does not change the total supply", async function () {
          const totalSupplyBefore = await this.token.totalSupply();

          await this.token.transfer(_receiver, _transferAmount, {
            from: _sender,
          });

          const totalSupplyAfter = await this.token.totalSupply();

          expect(totalSupplyBefore).to.be.bignumber.equal(totalSupplyAfter);
        });
      });

      describe("when transferring from approved balance", function () {
        const _spender = user3;

        describe("when the spender has enough approval", function () {
          beforeEach(async function () {
            await this.token.approve(_spender, _transferAmount, {
              from: _sender,
            });
          });

          it("emits a transfer event", async function () {
            const { logs } = await this.token.transferFrom(
              _sender,
              _receiver,
              _transferAmount,
              { from: _spender }
            );

            expectEvent.inLogs(logs, "Transfer", {
              from: _sender,
              to: _receiver,
              value: _transferAmount,
            });
          });

          it("transfers the requested amount", async function () {
            await this.token.transferFrom(_sender, _receiver, _transferAmount, {
              from: _spender,
            });

            expect(await this.token.balanceOf(_sender)).to.be.bignumber.equal(
              _senderBalance.sub(_transferAmount)
            );

            expect(await this.token.balanceOf(_receiver)).to.be.bignumber.equal(
              _transferAmount
            );
          });

          it("does not change the total supply", async function () {
            const totalSupplyBefore = await this.token.totalSupply();

            await this.token.transferFrom(_sender, _receiver, _transferAmount, {
              from: _spender,
            });

            const totalSupplyAfter = await this.token.totalSupply();

            expect(totalSupplyBefore).to.be.bignumber.equal(totalSupplyAfter);
          });
        });

        describe("when the spender does not have enough approval", function () {
          it("cannot transfer", async function () {
            await expectRevert(
              this.token.transferFrom(_sender, _receiver, _transferAmount, {
                from: _spender,
              }),
              _insufficientAllowanceError
            );
          });
        });
      });
    });

    describe("when sender does not have enough balance", function () {
      const _senderBalance = new BN(100);
      const _transferAmount = _senderBalance.addn(1);

      beforeEach(async function () {
        await this.token.mintTo(_sender, _senderBalance, {
          from: owner,
        });
      });

      describe("when transferring own balance", function () {
        it("cannot underflow", async function () {
          await expectRevert(
            this.token.transfer(_receiver, _transferAmount, {
              from: _sender,
            }),
            _insufficientFundsError
          );
        });
      });

      describe("when transferring from approved balance", function () {
        const _spender = user3;

        beforeEach(async function () {
          await this.token.approve(_spender, _transferAmount, {
            from: _sender,
          });
        });

        it("cannot underflow", async function () {
          await expectRevert(
            this.token.transferFrom(_sender, _receiver, _transferAmount, {
              from: _spender,
            }),
            _insufficientFundsError
          );
        });
      });
    });
  });
});
