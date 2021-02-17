const { assert } = require("chai");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const assertRevert = require("./helpers/assertRevert");

const QUSDContract = artifacts.require("QUSDImplementation.sol");
const QUSDIssuer = artifacts.require("QUSDIssuer.sol");

contract("Issuer can manage labels", function ([owner, member, nonMember]) {
  beforeEach(async function () {
    const proxiedQUSD = await deployProxy(QUSDContract);
    this.token = proxiedQUSD;

    const issuer = await QUSDIssuer.new(proxiedQUSD.address, 3, {
      from: owner,
    });
    this.issuer = issuer;
    await this.token.setIssuer(issuer.address, { from: owner });
    await this.issuer.addMember(member, { from: owner });
  });

  describe("when managing labels", function () {
    const labelToAdd = 2018;

    describe("as an Issuer member", function () {
      it("can add new label", async function () {
        const labelBeforeAdding = await this.token._labelExistence(labelToAdd);
        await this.issuer.addLabel(labelToAdd, { from: member });
        const labelAfterAdding = await this.token._labelExistence(labelToAdd);

        assert.equal(labelBeforeAdding, false);
        assert.equal(labelAfterAdding, true);
      });

      it("can remove existing label", async function () {
        await this.issuer.addLabel(labelToAdd, { from: member });
        await this.issuer.removeLabel(labelToAdd, { from: member });
        const labelAfterRemoving = await this.token._labelExistence(labelToAdd);

        assert.equal(labelAfterRemoving, false);
      });
    });
    describe("as a non-member", function () {
      it("cannot add label", async function () {
        await assertRevert(
          this.issuer.addLabel(labelToAdd, { from: nonMember })
        );
      });
      it("cannot remove existing label", async function () {
        await this.issuer.addLabel(labelToAdd, { from: member });
        await assertRevert(
          this.issuer.addLabel(labelToAdd, { from: nonMember })
        );
      });
    });
  });
});
