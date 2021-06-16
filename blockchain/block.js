const {GENESIS_DATA, MINE_RATE} = require('../config')
const cryptoHash = require('../util/crypto-hash')
const hexToBinary = require('hex-to-binary')

class Block {
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.nonce = nonce

        // the difficulty defines how many leading zeros a valid hash should have.
        this.difficulty = difficulty
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data}) {
        let hash, timestamp  
        let difficulty = lastBlock.difficulty

        const lastHash = lastBlock.hash
        let nonce = 0

        // continuously increamenting nonce until we find a valid hash value
        do {
            timestamp = Date.now()
            nonce++
            difficulty = this.adjustDifficulty({originalBlock: lastBlock, timestamp: timestamp})
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
        } while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))
        

        return new this({
           timestamp : Date.now(),
           lastHash : lastBlock.hash,
           data : data,
           difficulty : difficulty,
           nonce : nonce,
           hash :  hash
        })
    }

    static adjustDifficulty({originalBlock, timestamp}) {
        // the timestamp represents the timestamp for a newly mined block

        if (originalBlock.difficulty < 1) return 1
        if (timestamp - originalBlock.timestamp < MINE_RATE) return originalBlock.difficulty + 1
        return originalBlock.difficulty - 1
    }
}

module.exports = Block;