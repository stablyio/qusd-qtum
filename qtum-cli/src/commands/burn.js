const {Command} = require('@oclif/command')
const Connection = require('../connection')

class BurnCommand extends Command {
  async run() {
    const {args} = this.parse(BurnCommand)
    const amount = args.amount

    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.send('burn', [amount])
      this.log('Burning ==> ', result)
    }
  }
}

BurnCommand.description = 'Burn an amount of tokens'

BurnCommand.args = [{
  name: 'amount',
  description: 'The amount of burn (e.g. 143.23)',
  required: true,
}]

module.exports = BurnCommand
