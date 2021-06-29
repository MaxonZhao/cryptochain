 // used for dynamic difficulty system:
 // when adding a block, compute the difference between the timestamp of the current and prev block:
 // if the diff is greater than this rate, it's mining too quickly, therefore we increament the difficulty
 // otherwise, we decreament it
const MINE_RATE = 1000 // ms
const INITIAL_DIFFICULTY = 3

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

const STARTING_BALANCE = 1000;

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE}


