const {Command, flags} = require('@oclif/command')
const Connection = require('../connection')

class MintCommand extends Command {
  async run() {
    const {flags} = this.parse(MintCommand)
    const toLabel = flags.label
    const toAddress = flags.address

    const {args} = this.parse(MintCommand)
    const amount = args.amount

    let connection = new Connection()
    if (connection.implementation()) {
      if (toLabel !== undefined && toLabel !== null && toLabel !== '') {
        let result = await connection.implementation().contract.send('mintForLabel', [amount, toLabel], {
          senderAddress: 'qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW',
        })
        this.log('Minting ==> ', result)
      } else if (toAddress !== undefined && toAddress !== null && toAddress !== '') {
        let result = await connection.implementation().contract.send('mintTo', [toAddress, amount], {
          senderAddress: 'qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW',
        })
        this.log('Minting ==> ', result)
      } else {
        let result = await connection.implementation().contract.send('mint', [amount], {
          senderAddress: 'qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW',
        })
        this.log('Minting ==> ', result.txid, result)

        await result.confirm(3)
        this.log('confirmed')
      }
    }
  }
}

MintCommand.description = 'Mint / mint to a label'

MintCommand.flags = {
  label: flags.string({
    char: 'l',
    description: 'Label to mint',
    exclusive: ['address'],
    required: false,
  }),
  address: flags.string({
    char: 'a',
    description: 'Address to mint',
    exclusive: ['label'],
    required: false,
  }),
}

MintCommand.args = [{
  name: 'amount',
  description: 'The amount of mint (e.g. 143.23)',
  required: true,
}]

module.exports = MintCommand
