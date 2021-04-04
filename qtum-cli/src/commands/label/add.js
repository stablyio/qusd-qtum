const {Command} = require('@oclif/command')
const Connection = require('../../connection')

class LabelAddCommand extends Command {
  async run() {
    const {args} = this.parse(LabelAddCommand)
    const label = Number(args.label)

    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.send('addLabel', [label])
      this.log('Add Label ==> ', result)
    }
  }
}

LabelAddCommand.description = 'Add a label to whitelist'

LabelAddCommand.args = [{
  name: 'label',
  description: 'The label to whitelist (numerical ID)',
  required: true,
}]

module.exports = LabelAddCommand
