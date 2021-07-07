const { validTransaction } = require("./transaction")

class TransactionPool {
    constructor() {
        this.transactionMap = {}
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap
    }

    existingTransaction({inputAddress}) {
        const transactions = Object.values(this.transactionMap)

        return transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions() {
        let validTransactions = []
        Object.values(this.transactionMap).forEach(tx => {
            if (validTransaction(tx)) {
                validTransactions.push(tx)
            }
        })

        return validTransactions
    }
    
    clear() {
        this.transactionMap = {}
    }

    // when replacing a new chain from the peer network, call this to wipe out the transactionMap 
    // in order to avoid duplicate transactions
    clearBlockChainTransactions({chain}) {
        for (let i = 1; i < chain.length; ++i) {
            const block = chain[i]

            for (let tx of block.data) {
                if (this.transactionMap[tx.id]) {
                    delete this.transactionMap[tx.id]
                }
            }
        }
    }
}

module.exports = TransactionPool