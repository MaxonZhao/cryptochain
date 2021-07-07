  
const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
    
    constructor() {
        this.balance = STARTING_BALANCE
        
        // a wallet should have a key pair - private and public, 
        // where the private key is used to generate signatures for the 
        // private key owner on pieces of data and the public key is public
        // in order to allow others to use it as an address in the cryptocurrency
        this.keyPair = ec.genKeyPair()
        this.publicKey = this.keyPair.getPublic().encode('hex')
    }

    sign(data) {
        // the sign method works optimally when the data
        // arrives with a single cryptographic form of hash
        return this.keyPair.sign(cryptoHash(data))
    }

    createTransaction({recipient, amount, chain}) {
        if (chain) {
            this.balance = Wallet.calculateBalance({chain, address: this.publicKey})
        }


        if (amount > this.balance) throw new Error('Amount exceeds balance')

        return new Transaction({ senderWallet: this, recipient, amount });

    }

    static calculateBalance({chain, address}) {
        let hasConductedTransaction = false
        let outputsTotal = 0
        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i]
            for (let tx of block.data) {
                if (tx.input.address === address) {
                    hasConductedTransaction =  true
                }
                const addressOutput = tx.outputMap[address]
                outputsTotal = outputsTotal + addressOutput
            }

            if (hasConductedTransaction) break
        }
        return hasConductedTransaction?
        outputsTotal:
        STARTING_BALANCE + outputsTotal
    }
}

module.exports = Wallet;