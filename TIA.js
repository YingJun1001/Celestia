const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing")
const { SigningStargateClient } = require("@cosmjs/stargate")
const fs = require("fs")


//import data
const datajson = JSON.parse(fs.readFileSync('Data.json').toString())

// EDIT HERE
const Memonic  = datajson.Memonic 
const TOTAL_TX = datajson.TotalTx //change to a number transsaction you want
///////////////

const MEMO = datajson.MEMO
const FEE = datajson.FEE
const GAS = datajson.GAS
const RPC = datajson.RPC

const prepareAccount = async () => {
  return DirectSecp256k1HdWallet.fromMnemonic(Memonic.toString(), {
    prefix: "celestia"
  })
}

const Start = async () => {
  const my_Wallet = await prepareAccount()
  const my_Pubkey = (await my_Wallet.getAccounts())[0].address

  const signingClient = await SigningStargateClient.connectWithSigner(
    RPC,
    my_Wallet
  )
  const balances = await signingClient.getAllBalances(my_Pubkey)
  const utiaBalance = balances.find(coin => coin.denom === "utia")
  const utiaAmount = utiaBalance ? parseFloat(utiaBalance.amount) : 0
  const tiaAmount = utiaAmount / 1_000_000

  console.log(`My wallet Address: ${my_Pubkey}`)
  console.log(
    ` - Chain: ${await signingClient.getChainId()}\n - Balance: ${tiaAmount}\n - Block Height: ${await signingClient.getHeight()}\n\n`
  )

  for (let count = 0; count < TOTAL_TX; count++) {
    const result = await signingClient.sendTokens(
      my_Pubkey,
      my_Pubkey,
      [{ denom: "utia", amount: "1" }],
      {
        amount: [{ denom: "utia", amount: FEE }],
        gas: GAS
      },
      MEMO
    )

    console.log(
      `${count + 1}. Explorer: https://celestia.explorers.guru/transaction/${
        result.transactionHash
      }`
    )
  }

  console.log("\n=======> [ MINT DONE ] <=======")
}

Start()
