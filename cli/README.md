QUSD
====

QUSD CLI tool

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ yarn link
$ qusd COMMAND
running command...
$ qusd (-v|--version|version)
qusd/0.0.1 darwin-x64 node-v12.16.1
$ qusd --help [COMMAND]
USAGE
  $ qusd COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [QUSD](#qusd)
- [Usage](#usage)
- [Commands](#commands)
  - [`qusd burn`](#qusd-burn)
  - [`qusd help [COMMAND]`](#qusd-help-command)
  - [`qusd issuer:member:add`](#qusd-issuermemberadd)
  - [`qusd issuer:member:list`](#qusd-issuermemberlist)
  - [`qusd issuer:member:remove`](#qusd-issuermemberremove)
  - [`qusd issuer:mint:list`](#qusd-issuermintlist)
  - [`qusd issuer:mint:propose`](#qusd-issuermintpropose)
  - [`qusd issuer:mint:reject`](#qusd-issuermintreject)
  - [`qusd issuer:mint:send`](#qusd-issuermintsend)
  - [`qusd supply`](#qusd-supply)
  - [`qusd transfer`](#qusd-transfer)

## `qusd burn`

```
USAGE
  $ qusd burn

OPTIONS
  --amount=amount              (required) The amount of burn (e.g. 154.23)

  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.
```

_See code: [src/commands/burn.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/burn.ts)_

## `qusd help [COMMAND]`

display help for qusd

```
USAGE
  $ qusd help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `qusd issuer:member:add`

```
USAGE
  $ qusd issuer:member:add

OPTIONS
  --address=address            (required) The new issuance member to add

  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.
```

_See code: [src/commands/issuer/member/add.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/member/add.ts)_

## `qusd issuer:member:list`

```
USAGE
  $ qusd issuer:member:list

OPTIONS
  --network=ropsten|mainnet  [default: ropsten] Ethereum network to use
```

_See code: [src/commands/issuer/member/list.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/member/list.ts)_

## `qusd issuer:member:remove`

```
USAGE
  $ qusd issuer:member:remove

OPTIONS
  --address=address            (required) The issuance member to remove

  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.
```

_See code: [src/commands/issuer/member/remove.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/member/remove.ts)_

## `qusd issuer:mint:list`

```
USAGE
  $ qusd issuer:mint:list

OPTIONS
  --network=ropsten|mainnet  [default: ropsten] Ethereum network to use
```

_See code: [src/commands/issuer/mint/list.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/mint/list.ts)_

## `qusd issuer:mint:propose`

```
USAGE
  $ qusd issuer:mint:propose

OPTIONS
  --amount=amount              (required) The amount of propose (e.g. 154.23)

  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.

  --to=to                      The address to issue new tokens to, defaults to self
```

_See code: [src/commands/issuer/mint/propose.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/mint/propose.ts)_

## `qusd issuer:mint:reject`

```
USAGE
  $ qusd issuer:mint:reject

OPTIONS
  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --index=index                (required) The index of the pending mint to reject

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.
```

_See code: [src/commands/issuer/mint/reject.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/mint/reject.ts)_

## `qusd issuer:mint:send`

```
USAGE
  $ qusd issuer:mint:send

OPTIONS
  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --index=index                (required) The index of the pending mint to send

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.
```

_See code: [src/commands/issuer/mint/send.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/issuer/mint/send.ts)_

## `qusd supply`

```
USAGE
  $ qusd supply

OPTIONS
  --network=ropsten|mainnet  [default: ropsten] Ethereum network to use
```

_See code: [src/commands/supply.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/supply.ts)_

## `qusd transfer`

```
USAGE
  $ qusd transfer

OPTIONS
  --amount=amount              (required) The amount of transfer (e.g. 154.23)

  --gaspricegwei=gaspricegwei  Override the default behavior of determining gas price based on previous few blocks by
                               using a user specified gas price in Gwei. 1 Gwei is 1e9 Wei (a giga-wei).

  --hdwpath=hdwpath            Specify a custom HD wallet derivation path, or just skip the prompt for non-interactive
                               signing.

  --network=ropsten|mainnet    [default: ropsten] Ethereum network to use

  --nobroadcast                Sign but do not broadcast the transaction. Output the signed transaction to stdout.

  --nonce=nonce                Override the default behavior of getting the next nonce by using a user specified nonce.
                               Useful for retrying or queuing transactions.

  --sigmethod=privkey|ledger   (required) Signature method for signing the transaction

  --skipconfirm                Skip the confirmation and directly broadcast the transaction. Useful for non-interactive
                               use.

  --to=to                      (required) The recipient of the transferred tokens
```

_See code: [src/commands/transfer.ts](https://github.com/stablyio/qusd/blob/v0.0.1/src/commands/transfer.ts)_
<!-- commandsstop -->
