const {QtumRPC, Contract} = require('qtumjs')

const contractData1 = require('../build/QUSDImplementation.json')
const contractData2 = require('../build/SimpleTest.json')
const qtum = new QtumRPC('http://stably:mandatorypassword@localhost:3889')

class Connection {
    constructor() {
        this._contracts = []
        const contract1 = new Contract(qtum, contractData1)
        const address1 = contractData1.networks["4132"].address;
        contract1.updateAddress(address1.slice(2, this.address.length));

        const contract2 = new Contract(qtum, contractData2)
        const address2 = contractData2.networks["4132"].address;
        contract2.updateAddress(address2.slice(2, this.address.length));

        this._contracts.push({
            name: 'QUSDImplementation',
            contract: contract1,
        })

        this._contracts.push({
            name: 'SimpleTest',
            contract: contract2,
        })
    }
    
    implementation() {
        return this._contracts[0]
    }

    test() {
        return this._contracts[1]
    }
}

module.exports = Connection
