# QUSD Token Contracts
# Functionality
There are 2 main smart contracts in the QUSD system. There is the ERC20 token (the Token Implementation) and an issuer contract for controlling new token issuance (the Issuer).

## Token Implementation
QUSD implements the ERC-20 standard, but is also a 2-tiered token system. The first tier aggregates data into a typical ERC-20 style view of QUSD. The second tier splits up QUSD balance into several buckets for origination tracking purposes. 

Here's a summary of all the functionality that will be implemented in addition to the ERC-20 standard.

### ERC20
QUSD implements the [ERC-20 token standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) using OpenZeppelin's ["@openzeppelin/contracts-ethereum-package": "^2.4.0"](https://www.npmjs.com/package/@openzeppelin/contracts-ethereum-package/v/2.4.0).

### Ownable
QUSD can specify an Owner that can:
* Change the Owner to a different Owner upon acceptance from new Owner
* Pause the transfer of QUSD for all holders
* Set the Issuer account for QUSD
* Set the Compliance account for QUSD

### Issuable
QUSD token supply can be increased only by the designated Issuer account and no one else.

### Burnable
QUSD tokens can be burned by anyone.

### Pausable
QUSD token transfer can be paused globally by the Owner.

### Regulatory Compliance
QUSD tokens can be frozen within an account and set to zero. All compliance activities can only be done by the Compliance account.

### 2-Tier Token
QUSD is the view of balances and ownership exposed by the first tier of the system. The total supply of QUSD is the total supply found in tier one. Tier two breaks down tier one into several buckets. These buckets can be used for tracking issuance sources (origination)

## Issuer
QUSD issuance is controlled by another smart contract, the Issuer. The Issuer exists to create a check and balance on QUSD token issuance by giving multiple members (Members) the ability to cancel a pending token creation event (Mint). The administration of the Issuer is done by the Owner.
