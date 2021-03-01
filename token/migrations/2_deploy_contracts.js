const { deployProxy, admin } = require("@openzeppelin/truffle-upgrades");

const QUSD = artifacts.require("QUSDImplementation");
const Issuer = artifacts.require("QUSDIssuer");

// Note: Proxy owner must be DIFFERENT than any other owner
const OWNER = "0x7926223070547d2d15b2ef5e7383e541c338ffe9"; // TODO - Just placeholder addresses for now, replace and uncomment below if deployer is different than owner
const ISSUANCE_WAIT_BLOCKS = 4;

module.exports = async function(deployer) {
  const proxiedQUSD = await deployProxy(QUSD, { deployer });
  // await proxiedQUSD.proposeOwner(OWNER);
  const issuer = await deployer.deploy(
    Issuer,
    proxiedQUSD.address,
    ISSUANCE_WAIT_BLOCKS
  );
  // await issuer.proposeOwner(OWNER);
  await proxiedQUSD.setIssuer(issuer.address);
  // await admin.transferProxyAdminOwnership(OWNER); // Already owner by default if same address as deployer
};
