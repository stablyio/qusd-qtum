const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const QUSDContract = artifacts.require("QUSDImplementation.sol");

const assertRevert = require("./helpers/assertRevert");

// Test that the labeling logic works.
contract("QUSD Label", function ([owner, anotherAccount]) {
  beforeEach(async function () {
    const proxiedQUSD = await deployProxy(QUSDContract);
    this.token = proxiedQUSD;
  });

  describe("when minting labeled tokens", function () {
    it("keeps track of the label", async function () {
      const label1 = 1;
      const label2 = 2;
      await this.token.mintForLabel(1, label1, { from: owner });
      await this.token.mintForLabel(2, label2, { from: owner });
      const balance1 = await this.token.balanceOfUserForLabel(owner, label1);
      const balance2 = await this.token.balanceOfUserForLabel(owner, label2);
      const qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(balance1, 1);
      assert.equal(balance2, 2);
      assert.equal(qLength, 2);
    });

    it("does not append label to queue if it already exists", async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.mintForLabel(i, i, { from: owner });
      }
      for (let i = 1; i <= 3; i++) {
        await this.token.mintForLabel(i, i, { from: owner });
      }
      for (let i = 1; i <= 3; i++) {
        const balance = await this.token.balanceOfUserForLabel(owner, i);
        assert.equal(balance, i * 2);
      }
      const qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 3);
    });
  });

  describe("when burning labeled tokens", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.addLabel(i, { from: owner });
        await this.token.mintForLabel(i, i, { from: owner });
      }
    });

    it("removes label when burning one label worth", async function () {
      await this.token.burn(1, { from: owner });
      const qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 2);
    });

    it("removes two labels when burning two labels worth", async function () {
      await this.token.burn(3, { from: owner });
      const qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 1);
    });

    it("removes all labels when burning all tokens", async function () {
      await this.token.burn(6, { from: owner });
      const qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 0);
    });

    it("removes zero balance labels", async function () {
      await this.token.addLabel(4, { from: owner });
      await this.token.addLabel(5, { from: owner });
      await this.token.mintForLabel(0, 4, { from: owner });
      await this.token.mintForLabel(1, 5, { from: owner });
      let qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 5);
      await this.token.burn(7, { from: owner });
      qLength = await this.token.userLabelQueueLength(owner);
      assert.equal(qLength, 0);
    });
  });

  describe("when transferring labeled tokens", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.addLabel(i, { from: owner });
        await this.token.mintForLabel(i, i, { from: owner });
      }
    });

    it("transfers one label when transferring one labels worth", async function () {
      await this.token.transfer(anotherAccount, 1, { from: owner });
      const qLengthOwner = await this.token.userLabelQueueLength(owner);
      const qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthOwner, 2);
      assert.equal(qLengthAnother, 1);
    });

    it("transfers two labels when transferring two labels worth", async function () {
      await this.token.transfer(anotherAccount, 2, { from: owner });
      const qLengthOwner = await this.token.userLabelQueueLength(owner);
      const qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthOwner, 2);
      assert.equal(qLengthAnother, 2);
    });

    it("transfers all labels when transferring everything", async function () {
      await this.token.transfer(anotherAccount, 6, { from: owner });
      const qLengthOwner = await this.token.userLabelQueueLength(owner);
      const qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthOwner, 0);
      assert.equal(qLengthAnother, 3);
    });

    it("does not append label to queue when it already exists", async function () {
      await this.token.transfer(anotherAccount, 2, { from: owner });
      // Now each user has 1 token with label 2
      const qLengthAnotherBefore = await this.token.userLabelQueueLength(
        anotherAccount
      );
      await this.token.transfer(anotherAccount, 1, { from: owner });
      const qLengthAnotherAfter = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthAnotherBefore, 2);
      assert.equal(qLengthAnotherAfter, 2);
    });

    it("handles zero balance labels", async function () {
      await this.token.addLabel(4, { from: owner });
      await this.token.mintForLabel(0, 4, { from: owner });
      await this.token.mintForLabel(1, 0, { from: owner }); // The zero balance label will consolidate here
      let qLengthOwner = await this.token.userLabelQueueLength(owner);
      assert.equal(qLengthOwner, 5);
      await this.token.transfer(anotherAccount, 7, { from: owner });
      qLengthOwner = await this.token.userLabelQueueLength(owner);
      const qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthOwner, 0);
      assert.equal(qLengthAnother, 4); // All labels are transferred over, except the 0 balance label
    });
  });

  describe("when consolidating labeled tokens", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.addLabel(i, { from: owner });
      }
      await this.token.setConsolidationThreshold(10, { from: owner });
    });

    it("consolidates labels transferred under the threshold", async function () {
      await this.token.mintForLabel(100, 1, { from: owner });
      await this.token.mintForLabel(100, 2, { from: owner });

      await this.token.transfer(anotherAccount, 5, { from: owner });
      let qLengthOwner = await this.token.userLabelQueueLength(owner);
      let qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthOwner, 2);
      assert.equal(qLengthAnother, 1); // The label consolidated to the consolidation label
      let balance0 = await this.token.balanceOfUserForLabel(anotherAccount, 0);
      let balance1 = await this.token.balanceOfUserForLabel(anotherAccount, 1);
      assert.equal(balance0, 5);
      assert.equal(balance1, 0);

      await this.token.transfer(anotherAccount, 100, { from: owner });
      qLengthOwner = await this.token.userLabelQueueLength(owner);
      qLengthAnother = await this.token.userLabelQueueLength(anotherAccount);
      assert.equal(qLengthOwner, 1);
      assert.equal(qLengthAnother, 2); // The consolidation label and label 1
      balance0 = await this.token.balanceOfUserForLabel(anotherAccount, 0);
      balance1 = await this.token.balanceOfUserForLabel(anotherAccount, 1);
      assert.equal(balance0, 10);
      assert.equal(balance1, 95);

      await this.token.transfer(anotherAccount, 95, { from: owner });
      qLengthOwner = await this.token.userLabelQueueLength(owner);
      qLengthAnother = await this.token.userLabelQueueLength(anotherAccount);
      assert.equal(qLengthOwner, 0);
      assert.equal(qLengthAnother, 3); // The consolidation label, label 1 and label 2
      balance0 = await this.token.balanceOfUserForLabel(anotherAccount, 0);
      balance1 = await this.token.balanceOfUserForLabel(anotherAccount, 1);
      let balance2 = await this.token.balanceOfUserForLabel(anotherAccount, 2);
      assert.equal(balance0, 10);
      assert.equal(balance1, 95);
      assert.equal(balance2, 95);
    });

    it("consolidates zero balance labels", async function () {
      await this.token.mintForLabel(0, 1, { from: owner });
      await this.token.mintForLabel(0, 2, { from: owner });
      await this.token.mintForLabel(100, 3, { from: owner });

      await this.token.transfer(anotherAccount, 100, { from: owner });

      let qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      assert.equal(qLengthAnother, 2);
    });

    it("consolidates removed labels", async function () {
      await this.token.mintForLabel(100, 100, { from: owner });
      await this.token.mintForLabel(50, 101, { from: owner });

      await this.token.transfer(anotherAccount, 150, { from: owner });
      const qLengthAnother = await this.token.userLabelQueueLength(
        anotherAccount
      );
      const balance0 = await this.token.balanceOfUserForLabel(
        anotherAccount,
        0
      );
      assert.equal(qLengthAnother, 1);
      assert.equal(balance0, 150);
    });
  });

  describe("when burning a specific label", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.addLabel(i, { from: owner });
        await this.token.mintForLabel(i, i, { from: owner });
      }
    });

    it("burns within the label balance", async function () {
      await this.token.burnForLabel(1, 2, { from: owner });
      const balance2 = await this.token.balanceOfUserForLabel(owner, 2);
      assert.equal(balance2, 1);
      const balance = await this.token.balanceOf(owner);
      assert.equal(balance, 5);
    });

    it("cannot burn more than the label balance", async function () {
      await assertRevert(this.token.burnForLabel(3, 2, { from: owner }));
    });
  });

  describe("when transferring a specific label", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 3; i++) {
        await this.token.addLabel(i, { from: owner });
        await this.token.mintForLabel(i, i, { from: owner });
      }
    });

    it("transfers within the label balance", async function () {
      await this.token.transferForLabel(anotherAccount, 1, 2, { from: owner });
      const balance2Owner = await this.token.balanceOfUserForLabel(owner, 2);
      const balance2Another = await this.token.balanceOfUserForLabel(
        anotherAccount,
        2
      );
      assert.equal(balance2Owner, 1);
      assert.equal(balance2Another, 1);
      const balanceOwner = await this.token.balanceOf(owner);
      const balanceAnother = await this.token.balanceOf(anotherAccount);
      assert.equal(balanceOwner, 5);
      assert.equal(balanceAnother, 1);
    });

    it("cannot transfer more than the label balance", async function () {
      await assertRevert(
        this.token.transferForLabel(anotherAccount, 3, 2, { from: owner })
      );
    });

    it("does not dequeue, but gets dequeued in subsequent main token transfer", async function () {
      await this.token.transferForLabel(anotherAccount, 2, 2, { from: owner });
      const balance2 = await this.token.balanceOfUserForLabel(owner, 2);
      assert.equal(balance2, 0);
      const qLengthBefore = await this.token.userLabelQueueLength(owner);
      assert.equal(qLengthBefore, 3);
      await this.token.transfer(anotherAccount, 4, { from: owner });
      const balanceOwner = await this.token.balanceOf(owner);
      assert.equal(balanceOwner, 0);
      const qLengthAfter = await this.token.userLabelQueueLength(owner);
      assert.equal(qLengthAfter, 0);
    });
  });
});
