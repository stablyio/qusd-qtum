const { deployProxy, admin } = require("@openzeppelin/truffle-upgrades");

const QUSD = artifacts.require("QUSDImplementation");
const Issuer = artifacts.require("QUSDIssuer");

// Note: Proxy owner must be DIFFERENT than any other owner
const OWNER = "0x24256D9012482f2245519F74115339b3BA522711"; // TODO - Just placeholder addresses for now
const ISSUANCE_WAIT_BLOCKS = 4;

module.exports = async function (deployer) {
  const proxiedQUSD = await deployProxy(QUSD, { deployer });
  await proxiedQUSD.proposeOwner(OWNER);
  const issuer = await deployer.deploy(
    Issuer,
    proxiedQUSD.address,
    ISSUANCE_WAIT_BLOCKS
  );
  await issuer.proposeOwner(OWNER);
  await proxiedQUSD.setIssuer(issuer.address);
  await admin.transferProxyAdminOwnership(OWNER);
};
