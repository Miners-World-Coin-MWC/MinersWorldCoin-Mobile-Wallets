import config from './config'

export default function (address, cb){
  getPrice(function(price){
    getBalance(address, price, function(balance){
      getTransactions(address, function(transactions){
        cb({price: price, balance: balance.balance, fiatBalance: balance.fiatBalance, transactions: transactions.transactions, heightList: transactions.heightList})
      })
    })
  })
}

getPrice = (cb) => {
  return fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${config.coingecho_name}&vs_currencies=usd`).then((result) => result.json()).then((resultJson) => {
    if (resultJson[config.coingecho_name] == undefined){
      cb('Network Error')
    } else {
      cb(resultJson[config.coingecho_name].usd)
    }
  }).catch((error) => {
    cb('Network Error')
  })
}

getBalance = (address, price, cb) => {
  return fetch(`https://insight.clashic.cash/api/addr/${address}`).then((result) => result.json()).then((resultJson) => {
    cb({balance: resultJson.balance.toFixed(4), fiatBalance: (resultJson.balance * price).toFixed(2)})
  }).catch(err => {
    cb({balance: '0.0000', fiatBalance: '0.00', transactions: [], heightList: []})
  })
}

getTransactions = (address, cb) => {
  return fetch(`https://insight.clashic.cash/api/txs/?address=${address}`).then((result) => result.json()).then((resultJson) => {
    let heightList = new Array
    for(var i = 0; i < resultJson.txs.length; i++){
      heightList.push(65)
    }
    cb({transactions: resultJson.txs, heightList: heightList})
  }).catch((error) => {
    cb({transactions: [], heightList: []})
  })
}