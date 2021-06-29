const Wallet = require('./index')
const Transaction = require('./transaction')
const {verifySignature} = require('../util')

describe('Wallet', () => {
    let wallet

    beforeEach(() => {
        wallet = new Wallet()
        // a wallet should have a balance
        // a public key --> the address that others will use to send money to that owner
    })

    it('has a balance', () => {
        expect(wallet).toHaveProperty('balance')
    })

    it('has a public key', () => {
        // console.log(wallet.publicKey)
        expect(wallet).toHaveProperty('publicKey')
    })

    describe('signing data', () => {
        const data = 'foobar'

        it('verifies a signature', () => {
            expect(
            verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBe(true)
        })

        it('does not verify an invalid signature', () => {
            expect(
            verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
            })).toBe(false)
        })
    })

    describe('createTransaction()', () => {
        let transaction, amount, recipient

        beforeEach(() => {
            amount = 50
            recipient = 'foo-recipient'
            transaction = wallet.createTransaction({amount, recipient})
        })

        describe('the amount exceeds the wallet balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({amount: 999999, recipient: 'foo-recipient'}))
                .toThrow('Amount exceeds balance')
            })
        })

        describe('and the amount is valid', () => {
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true)
            })

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey) 
            })

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })
        })
    })
})