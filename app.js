// Web3
const Web3 = require('web3');
let web3;
try {
    web3 = new Web3('https://api.harmony.one');
} catch (error) {
    console.log('⚠️  Error at: new Web3');
    console.log('🌐 Using Backup-Network\n');
    web3 = new Web3('https://harmony-0-rpc.gateway.pokt.network');
    web3 = new Web3(new Web3.providers.HttpProvider('https://harmony-0-rpc.gateway.pokt.network'));
}

const networkName = 'Harmony';

// ABI DECODING
const abiDecoder = require('abi-decoder'); // NodeJS
const abiduel = require('./abi.json');
abiDecoder.addABI(abiduel);

// Variables
let latestKnownBlockNumber = -1;
const blockTime = 7000;
let transactionsArray;
const heroAlertOnID = 33265;

/** ************************************************************** */

console.clear();


// Scan Transaction

async function scanTransaction(transactionsArr) {

    for (const transaction of transactionsArr) {

        // console.log('# TX: ', transaction)

        let singleTxObject;
        try {
            // eslint-disable-next-line no-await-in-loop
            singleTxObject = await web3.eth.getTransaction(transaction);
        } catch (error) {
            console.log('⚠️  Error at: await web3.eth.getTransaction');
            console.log('singleTxObject response on error: ', singleTxObject);

            singleTxObject = null;
        }


        /** If single Transaction has some content, check the Transaction */
        if (singleTxObject && singleTxObject !== null) {

            // console.log(`🔎 Checking Tx: ${singleTxObjectTo}`);
            // console.log(singleTxObject)

            // singleTxObjectTo !== 'undefined' && 
            if (singleTxObject.to === '0xE97196f4011dc9DA0829dd8E151EcFc0f37EE3c7') { // Search in Duel-Contract

                console.log(`✔️  Found a Transaction sent to Duel Contract | TX: ${transaction}`);

                const encodedTxInput = singleTxObject.input; // Encoded Tx HEX DATA
                // console.log(encodedTxInput)

                // Decode HEX DATA with ABI
                const decodedData = abiDecoder.decodeMethod(encodedTxInput);
                console.log(decodedData);

                if (decodedData.name === 'enterDuelLobby') {
                    console.log('🧙 Used Hero(s)', decodedData.params[1].value);

                    if (decodedData.params[1].value[0] === heroAlertOnID) {
                        console.log('########################### FLO ENTERED THE LOBBY WITH HERO: ', decodedData.params[1].value[0]);
                    }
                }
            }
        }
    }
}


// Function triggered for every Block

async function processBlock(blockNumber) {
    console.log(`\n🌐 Processing ${networkName}-Block: ${blockNumber}\n`);
    latestKnownBlockNumber = blockNumber;

    // Return Object with all Transaction-Data from current Block
    let blockTransactions;
    try {
        blockTransactions = await web3.eth.getBlock(blockNumber);
    } catch (error) {
        console.log('⚠️  Error at: blockTransactions');
        blockTransactions = null;
    }
    // console.log(blockTransactions)

    // If we have a Block with Transactions in it
    if (blockTransactions !== null) {

        // Return Array with all Transactions from Block
        transactionsArray = blockTransactions.transactions;
        // console.log(transactionsArray)

        if (transactionsArray !== null) {
            try {
                await scanTransaction(transactionsArray);
            } catch (error) {
                console.log('⚠️  Error at: await scanTransaction');
            }
        }
    }
}


// This function is called every blockTime
// check the current block-nr and orders the processing of the new block(s)

async function checkCurrentBlock() {

    const currentBlockNumber = await web3.eth.getBlockNumber();
    console.log(`\n📗 Latest ${networkName}-Block: ${currentBlockNumber}`, ` |  🔮 Script is at: ${latestKnownBlockNumber}\n`);


    while (latestKnownBlockNumber === -1 || currentBlockNumber > latestKnownBlockNumber) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await processBlock(latestKnownBlockNumber === -1
                ? currentBlockNumber
                : latestKnownBlockNumber + 1);
        } catch (error) {
            console.log('⚠️  Error at: await processBlock');
        }
    }
    setTimeout(checkCurrentBlock, blockTime);
}

checkCurrentBlock();
















/*

var myAddr = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
var currentBlock = eth.blockNumber;
var n = eth.getTransactionCount(myAddr, currentBlock);
var bal = eth.getBalance(myAddr, currentBlock);
for (var i = currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {
    try {
        var block = eth.getBlock(i, true);
        if (block && block.transactions) {
            block.transactions.forEach(function (e) {
                if (myAddr == e.from) {
                    if (e.from != e.to)
                        bal = bal.plus(e.value);
                    console.log(i, e.from, e.to, e.value.toString(10));
                    --n;
                }
                if (myAddr == e.to) {
                    if (e.from != e.to)
                        bal = bal.minus(e.value);
                    console.log(i, e.from, e.to, e.value.toString(10));
                }
            });
        }
    } catch (e) { console.error("Error in block " + i, e); }
}
*/
