const Block = require('./block')
const cryptoHash = require('./crypto-hash')

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const lastBlock = this.chain[this.chain.length - 1]
        const newBlock = Block.mineBlock({
            lastBlock : lastBlock,
            data: data
        })
        this.chain.push(newBlock)
    }


    // replaceChain 
    // 1. if the incoming chain is not longer than the original one, do not replace the chain
    // 2. if the incoming chain is longer:
    //     2.1 if the incoming chain is not valid, do not replace it
    //     2.2 if the incoming chain is valid, replace the chain
    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer')
            return
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid')
            return
        }

        console.log('replacing chain with', chain)
        this.chain = chain
    }


    // isValidChain
    // 1. every block should have required fields: data, hash and lastHash
    // 2. every block has a lastHash matches the actual hash of its previous block
    // 3. every block has a hash based on its current fields
    static isValidChain(testChain) {
        if (testChain.length == 0 || JSON.stringify(testChain[0]) != JSON.stringify(Block.genesis())) return false
       

        for (let i = 1; i < testChain.length; ++i) {
            const block = testChain[i]
            const actualLastHash = testChain[i - 1].hash
            const {timestamp, lastHash, hash, data} = block
            if (lastHash !== actualLastHash) return false

            const validatedHash = cryptoHash(timestamp, lastHash, data)
            if (validatedHash !== block.hash) return false
        } 
        return true
    }
}


module.exports = Blockchain;