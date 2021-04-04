const {Command} = require('@oclif/command')
const Connection = require('../../connection')

class LabelSupplyCommand extends Command {
  async run() {
    const {args} = this.parse(LabelSupplyCommand)
    const label = Number(args.label)

    let connection = new Connection()
    if (connection.implementation()) {
      let result = await connection.implementation().contract.call('labelSupply', [label])
      this.log('Supply Label ==> ', result)
    }
  }
}

LabelSupplyCommand.description = 'Get total supply of a label'

LabelSupplyCommand.args = [{
  name: 'label',
  description: 'The label to query (numerical ID)',
  required: true,
}]

module.exports = LabelSupplyCommand
