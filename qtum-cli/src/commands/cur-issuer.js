const {Command} = require('@oclif/command')
const Connection = require('../connection')

class CurIssuerCommand extends Command {
  async run() {
    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.call('issuer')
      this.log('Issuer ==> ', result)
    }
  }
}

CurIssuerCommand.description = 'Get current issuer'

module.exports = CurIssuerCommand