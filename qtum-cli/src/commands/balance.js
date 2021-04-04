const {Command} = require('@oclif/command')
const Connection = require('../connection')

class BalanceCommand extends Command {
  async run() {
    const {args} = this.parse(BalanceCommand)
    const address = args.address

    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.call('balanceOf', [address])
      this.log('BalanceOf ==> ', result)
    }
  }
}

BalanceCommand.description = 'Get the balance of an address'

BalanceCommand.args = [{
  name: 'address',
  description: 'Address of the owner',
  required: true,
}]

module.exports = BalanceCommand
