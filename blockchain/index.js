const Block = require('./block')
const {cryptoHash} = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

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
    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer')
            return
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid')
            return
        }

        if (validateTransactions && !this.validTransactionData({chain})) {
            console.error('The incoming chain has invalid data')
            return
        }

        if (onSuccess) onSuccess()

        console.log('replacing chain with', chain)
        this.chain = chain
    }

    validTransactionData({ chain }) {
        for (let i=1; i<chain.length; i++) {
          const block = chain[i];
          const transactionSet = new Set();
          let rewardTransactionCount = 0;
    
          for (let transaction of block.data) {
            if (transaction.input.address === REWARD_INPUT.address) {
              rewardTransactionCount += 1;
    
              if (rewardTransactionCount > 1) {
                console.error('Miner rewards exceed limit');
                return false;
              }
    
              if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                console.error('Miner reward amount is invalid');
                return false;
              }
            } else {
              if (!Transaction.validTransaction(transaction)) {
                console.error('Invalid transaction');
                return false;
              }
              
              const trueBalance = Wallet.calculateBalance({
                  chain: this.chain,
                  address: transaction.input.address
              })

              if (transaction.input.amount !== trueBalance) {
                  console.error('Invalid input amount')
                  return false
              }

              if (transactionSet.has(transaction)) {
                  console.error('An identical transaction appears more than once in the block')
                  return false
              } else {
                  transactionSet.add(transaction)
              }
            }
          }
        }
    
        return true;
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
            const lastDifficulty = testChain[i - 1].difficulty
            const {timestamp, lastHash, hash, data, difficulty, nonce} = block

            if (lastHash !== actualLastHash) return false

            const validatedHash = cryptoHash(timestamp, lastHash, data, difficulty, nonce)
            if (validatedHash !== hash) return false
            if (Math.abs(lastDifficulty - difficulty) > 1 ) return false

        } 
        return true
    }
}


module.exports = Blockchain;