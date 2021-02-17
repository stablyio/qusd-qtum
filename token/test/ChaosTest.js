const { expect } = require("chai");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const QUSDContract = artifacts.require("QUSDImplementation.sol");

// Based on the OpenZeppelin ERC20 tests for ERC20
contract(
  "chaos testing",
  function ([owner, user1, user2, user3, user4, user5]) {
    const users = [user1, user2, user3, user4, user5];

    beforeEach(async function () {
      const proxiedQUSD = await deployProxy(QUSDContract);
      this.token = proxiedQUSD;
    });

    describe("under normal operation", function () {
      it("behaves as expected", async function () {
        let expectedSupply = 0;
        let totalIssuedLabelSupplies = {
          0: 0,
          1: 0,
          2: 0,
        };

        for (let i = 0; i < 100; i++) {
          const randAction = Math.floor(Math.random() * 3);
          // Mint new tokens
          if (randAction == 0) {
            const randUser = users[Math.floor(Math.random() * users.length)];
            const randAmount = Math.floor(Math.random() * 100);
            const randLabel = Math.floor(Math.random() * 3);
            await this.token.mintToForLabel(randUser, randAmount, randLabel, {
              from: owner,
            });
            expectedSupply += randAmount;
            totalIssuedLabelSupplies[randLabel.toString()] += randAmount;
          }
          // Burn existing tokens
          if (randAction == 2) {
            const randUser = users[Math.floor(Math.random() * users.length)];
            const userBalance = await this.token.balanceOf(randUser);
            let randAmountProportion = Math.random();
            let randAmount = Math.floor(Math.random() * userBalance);
            if (randAmountProportion > 0.9) {
              // Give a significant chance to burn everything
              randAmount = userBalance;
            }
            if (randAmount == 0) {
              continue;
            }
            await this.token.burn(randAmount, {
              from: randUser,
            });
            expectedSupply -= randAmount;
          }
          // Transfer tokens
          if (randAction == 3) {
            const randSender = users[Math.floor(Math.random() * users.length)];
            const randRecipient =
              users[Math.floor(Math.random() * users.length)];
            const senderBalance = await this.token.balanceOf(randSender);
            let randAmountProportion = Math.random();
            let randAmount = Math.floor(Math.random() * senderBalance);
            if (randAmountProportion > 0.9) {
              // Give a significant chance to transfer everything
              randAmount = senderBalance;
            }
            await this.token.transfer(randRecipient, randAmount, {
              from: randSender,
            });
          }
        }
        const actualSupply = (await this.token.totalSupply()).toNumber();
        const supplyForLabel0 = (await this.token.labelSupply(0)).toNumber();
        const supplyForLabel1 = (await this.token.labelSupply(1)).toNumber();
        const supplyForLabel2 = (await this.token.labelSupply(2)).toNumber();
        console.log(`Expected supply: ${expectedSupply}`);
        console.log(`Actual supply: ${actualSupply}`);
        console.group(`[Label] Remaining/Issued`);
        console.log(`[0] ${supplyForLabel0}/${totalIssuedLabelSupplies["0"]}`);
        console.log(`[1] ${supplyForLabel1}/${totalIssuedLabelSupplies["1"]}`);
        console.log(`[2] ${supplyForLabel2}/${totalIssuedLabelSupplies["2"]}`);
        console.groupEnd();
        console.log(
          `Sum of labels remaining: ${
            supplyForLabel0 + supplyForLabel1 + supplyForLabel2
          }`
        );
        expect(expectedSupply).to.eq(actualSupply);
        expect(actualSupply).to.eq(
          supplyForLabel0 + supplyForLabel1 + supplyForLabel2
        );
      });
    });
  }
);
