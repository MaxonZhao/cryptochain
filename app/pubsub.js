const redis = require('redis')

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor({blockchain}) {
        this.blockchain = blockchain
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscribeToChannels()

        this.subscriber.on('message', (channel, message) => this.handleMesssage(channel, message))
    }

    handleMesssage(channel, message) {
        console.log(`Message received. Channel ${channel}. Message: ${message}.`)
        const parsedMessage = JSON.parse(message)
 
        if (channel == CHANNELS.BLOCKCHAIN) {
            // console.log('blockchain is ----->', this.blockchain)
            this.blockchain.replaceChain(parsedMessage)
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel)
        })
    }

    publish({channel, message}) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel)
            })
        })
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
}

module.exports = PubSub