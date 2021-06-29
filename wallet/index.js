const { STARTING_BALANCE } = require("../config")
const {ec, cryptoHash} = require('../util')
const Transaction = require("./transaction")


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

    createTransaction({recipient, amount}) {
        if (amount > this.balance) throw new Error('Amount exceeds balance')
        const transaction = new Transaction({senderWallet: this, recipient, amount}) 
        return transaction
    }
}

module.exports = Wallet