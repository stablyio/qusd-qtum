const {Command} = require('@oclif/command')
const Connection = require('../connection')

class SupplyCommand extends Command {
  async run() {
      let connection = new Connection()
      if (connection.implementation()) {
          let result = await connection.implementation().contract.call('totalSupply')
          this.log('Total Supply ==> ', result.outputs)
      }
  }
}

SupplyCommand.description = 'Get total supply'

module.exports = SupplyCommand
