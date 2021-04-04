const {Command} = require('@oclif/command')
const Connection = require('../connection')

class TransferCommand extends Command {
  async run() {
    const {args} = this.parse(TransferCommand)
    const amount = args.amount
    const recipient = args.to

    let connection = new Connection()
    if (connection.implementation()) {
      let tx = await connection.implementation().contract.send('transfer', [recipient, amount])
      this.log('done....!', tx)
    }
  }
}

TransferCommand.description = 'Transfer token to account.'

TransferCommand.args = [
  {
    name: 'to',
    description: 'The recipient of the transferred tokens',
    required: true,
  },
  {
    name: 'amount',
    description: 'The amount of burn (e.g. 143.23)',
    required: true,
  },
]

module.exports = TransferCommand
