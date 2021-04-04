const {Command} = require('@oclif/command')
const Connection = require('../../connection')

class LabelRemoveCommand extends Command {
  async run() {
    const {args} = this.parse(LabelRemoveCommand)
    const label = Number(args.label)

    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.send('removeLabel', [label])
      this.log('Remove Label ==> ', result)
    }
  }
}

LabelRemoveCommand.description = 'Remove a label'

LabelRemoveCommand.args = [{
  name: 'label',
  description: 'The label to remove from whitelist (numerical ID)',
  required: true,
}]

module.exports = LabelRemoveCommand
