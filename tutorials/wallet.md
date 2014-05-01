### Headlines
How to create a Bitcoin Wallet

How to create a Javascript Bitcoin Wallet

How to create a Blockchain.info-like Bitcoin Wallet

Build your own Bitcoin Wallet

### Resources
http://bitcoinhistory.net/Technical_Papers/ProgrammingBitcoinTransactionScripts.pdf
http://www.righto.com/2014/02/bitcoins-hard-way-using-raw-bitcoin.html
http://bitcoin.stackexchange.com/questions/3374/how-to-redeem-a-basic-tx

### Tasks

1.
- intial code sample
- Send money (create transactions)
- Bytes/OP Code
- Stack
- Receive money/Transaction History
- Different transaction types, multisig, p2sh
- Testing, mocha, Faucet
- JSON View

2.
 - Creating/Manage addresses
 - Key generation vulnerabilities
 - HD Wallet
 - Other options, seeds, p2sh, secret sharing

require 'bitcoinjs-lib', '0.2.0' here
require 'helloblock-js'

images
seeing the script being executed on the stack was helpful

/decode endpoint; .toASM()
/propagate clean up?

### Transaction building painpoints

Do you have to spend bitcoin everytime? No! testnet.
LE/BE
scriptSig vs scriptPubKey
What does OP_DUP mean? How is that executed on the stack?
What's an unspent? UTXO
What is serializing? Why hex? Take binary?
What is signing, what are we signing? Why do we script?
hashTransactionForSignature
hash types

# How to build a wallet (Part 1 of 2)

## Introduction

In this tutorial, we're going to make a javascript client side Bitcoin Wallet. You may have seen some of these around.

 - [Blockchain.info](https://blockchain.info/wallet)
 - Carbon Wallet
 - [Sparecoins](http://sparecoins.io)

Client side wallets allow users to be in control of their money.

We get to the nitty gritty of how this works, right down to the raw bytes. But firstly, let's take a high level approach.

A Wallet is just a collection of Bitcoin addresses. To make a functional wallet, we need to

 - Send/Receive Bitcoins (Part 1)
 - Manage the private keys and addresses (Part 2)

We're using [bitcoinjs-lib]() for this tutorial. The library is included on the this, so you can open Chrome console (Apple + Option + J) and follow on.

We also recommend [JSON View]() which beautifies JSON data inside your browser.

## Creating Transactions - The Easy Way

One of the most difficult things to initially grasp is how to build transactions in Bitcoin. Luckily for us, bitcoinjs-lib provides a convenience methods to build transactions. You don't need to fully understand how Bitcoin transactions to get them working.

Here's some executable code (e.g you can run it in the browser)

```javascript

```

## Creating Transactions - The Hard Way

Whilst it's useful to get a high level overview, it's important to know the nitty gritty details of how transactions work, especially for Bitcoin. This is because the ecosystem is still primitive, things break all the time and we need to know how to debug.

Here's the detailed code, it will perform the same function as above, but using lower level functions.

```javascript

```

We will walk through step by step how this works. Here's a useful checklist

 - Ensure you have the private keys.
 - Get unspent outputs (UTXO) for addresses you want to send money from.
 - Determine the right transaction value (amount + fee)
 - Add all necessary inputs (UTXO)
 - All all desired outputs
    - Make sure to include a change address
 - Sign the transaction for each input
    - Hash the transaction
    - Sign the hash with your private key
    - Add the hash type to the end of signature
    - Add the signature for the input
    - Repeat for all inputs
 - Serialize the entire transaction into hexadecimal format
 - Propagate the transaction

### What is a transaction?

A transaction is a transfer of value one set of inputs to a new set of outputs.

Let's look at the raw bytes.

```javascript
  curl https://testnet.helloblock.io/q/getrawtransaction?txHashes=c772d1b8efd97e78aa882b4bfa04bb17a67fca62436010516472367aeb2b28ac

  {
    "status": "success",
    "data": {
      "transactions": [
        {
          "txHash": "c772d1b8efd97e78aa882b4bfa04bb17a67fca62436010516472367aeb2b28ac",
          "rawTxHex": "0100000001cf6b23baf0ebb8a09559f761144ab4407b5dce75a9484ed07a6da41f7f0218e9010000008a4730440220372be617d9d276340846265ddc7ba9dabbe78e97fac97091f7e2cb19ec2929ae02203be15a0a3929b2353ebb81f5d67b20ab3b1e427f124855a2309649858eaa4b340141040cfa3dfb357bdff37c8748c7771e173453da5d7caa32972ab2f5c888fff5bbaeb5fc812b473bf808206930fade81ef4e373e60039886b51022ce68902d96ef70ffffffff0240420f00000000001976a914a5319d469e1ddd9558bd558a50e95f74b3da58c988ac78c4f81e010000001976a91461b469ada61f37c620010912a9d5d56646015f1688ac00000000"
        }
      ]
    }
  }
```

### Private Keys and fees

ECDSA, elliptic curve
```javascript
  var privateKey = '1asdf'
  var key = bitcoin.ECKey.fromWif(privateKey)
```


### Unspents/UTXO

To build a new valid transaction, we must find previous outputs belonging to an address that have not already been spent. These are referred to as "Unspent Outputs" or "UTXO" for short.

Our Wallet can only use "Unspent Outputs" for the addresses it owns.

Our Wallet balance is also the value of all the Unspents Outputs.

```javascript
  helloblock.addresses.getUnspents()
```

There are 3 important fields we need to get (seen in the byte map above) and add to the pending transaction.
 - Previous Transaction Hash
 - Previous Transaction Output Index
 - Previous Transaction Output Script Pubkey

### Amount/Fees

You may only spend the entire previous transaction output.

For example, if the UTXO was 10 BTC, you can't simply send a portion of it such as 3 BTC. To spent 3 BTC, you must create 2 outputs

 1. 3 BTC to recipient
 2. 7 BTC back to yourself

To prevent Blockchain spam and DDOS attacks, every Bitcoin transaction must contain a fee. If it does not contain a fee, it is not likely to be accepted into the Blockchain by miners. The average fee is 10000 satoshis, or 0.0001 BTC, per 1000 bytes. Our transaction here is only 257 bytes. If we chooose to add more inputs/outputs, this will increase and we may need to increase the fee.

The fee is the "Total input value" - "Total output value" of a transaction. For example, if you create 2 outputs such that

1. 3 BTC is sent to the recipient
2. 6.999 BTC is sent back to yourself

0.0001 BTC will be regarded as the fee.

If you forget to send 7 BTC back to yourself in the above example, the 'missing' 7 BTC will go to Bitcoin miners as a fee.

### Add all inputs/outputs

We can use bitcoinjs-lib to add all the inputs and outputs

```javascript

```

Note that we don't include the input script for now because that requries a signature that we add later (see below).

### Script


> Bitcoin uses a scripting system for transactions. Forth-like, Script is simple, stack-based, and processed from left to right. It is purposefully not Turing-complete, with no loops.

A new transaction is valid if the transaction scripts of its input field (scriptSig) and the transaction script
of its predecessing transaction (scriptPubKey) validates to true.

In other words, we check if
```javascript
  scriptSig + scriptPubKey === true
```

You can see these components individually in the bytemap above.

In standard transactions, the ```scriptSig``` component looks like ```<signature> <pubkey>```

the ```scriptPubKey``` component then looks like ```OP_DUP OP_HASH160 <pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG```

Put together, the following expression must evaluate to true for valid transactions,

```bash
  &lt;signature&gt; &lt;pubkey&gt; OP_DUP OP_HASH160 &lt;pubkeyhash&gt; OP_EQUALVERIFY OP_CHECKSIG
```

Now the whole thing with actual data,

```javascript
  30440220372be617d9d276340846265ddc7ba9dabbe78e97fac97091f7e2cb19ec2929ae02203be15a0a3929b2353ebb81f5d67b20ab3b1e427f124855a2309649858eaa4b3401 040cfa3dfb357bdff37c8748c7771e173453da5d7caa32972ab2f5c888fff5bbaeb5fc812b473bf808206930fade81ef4e373e60039886b51022ce68902d96ef70 OP_DUP OP_HASH160 e06c30499eec71471ba28f4d684c8e1e515f7462 OP_EQUALVERIFY OP_CHECKSIG
```

Bitcoin nodes in the network run the script when they hear about a transaction.

There are many possibilities in what this scripting language offers (e.g. Multi-signature transactions) but this will be explored in another tutorial.

How this expression is evaluated is also beyond the scope of this tutorial. You may wish to read [this guide]() to get a better sense of how this works.

### Signing

To prove that you control a particular address you will have to sign the transaction. You sign over the whole transaction so evesdroppers can't simply just substitute the output address to myself and steal all your money. This would invalidate the original signature.

See [this video]() if you would like a primer on how digital signatures work.

Signing Bitcoin transactions can be a difficult process and very error-prone. A common gotcha is


Append 01

Different types of signing

We will cover differetn signature types in another tutorial.

### Serialize/propagate

Convert to hex, big endian, little endian
bitcoinjs-lib will handle this for you

You may wish to do this via bitcoind

/decode
/propagate

Propagate through the HelloBlock API.


## HelloBlock API

/testnet; faucet

A Wallet is a collection of addresses and often times, you will need to display the total balance for all addresses and propagate transactions using unspent outputs from multiple addresses.

/wallet