import { Alert } from 'react-native'
import coinSelect from 'coinselect'
import lib from '../src'
import axios from 'axios'
import config from '../src/config'


export default function(params, cb){
  if (params.to == '' || params.amount <= params.fee) { cb({status: 2, message: 'Enter an address and amount greater than transaction fee'}) } else {}
    if (params.bls < Number((params.amount + params.fee).toFixed(8))) { (cb({status: 2, message: 'Not enough funds'})) } else {
      getUtxos(params, cb)
    }
}

function checkAddress(params, cb){
  try {
    lib.address.toOutputScript(params.to, config.network)
    getUtxos(params, cb)
  } catch {
    cb({status: 2, message: 'Invalid address'})
  }
}

function getUtxos(params, cb){
  axios.get(`https://insight.clashic.cash/api/addr/${params.from}/utxo`).then(function(result){
    processUtxos(params, result.data, cb)
  }).catch(function() {
    cb({status: 2, message: 'Connection error. Check your internet connectivity and try again'})
  })
}

function processUtxos(params, utxos, cb){
  // change names
  params.totalSats = (params.amount * 100000000) + (params.fee * 100000000)
  params.round = Number(params.totalSats.toFixed(0))
  var targets = [{ address: 'moKyssgHDXPfgW7AmUgQADrhtYnJLWuTGu', satoshis: params.round }]
  var feeRate = 0;
  var { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate);
  if (inputs == undefined){
    let available = 0
    for (var i = 0; i < utxos.length; i++){
      available = available + utxos[i].amount
    }
    cb({status: 2, message: `Insufficient available funds. You have ${available.toFixed(8)} ${params.coin} available. This may be caused my unconfirmed transactions.` +
   ' If you have any unconfirmed transactions wait until they have at least 1 confirmation and try again'})
  } else {
    buildTransaction(params, inputs, cb)
  }
}

function buildTransaction(params, inputs, cb){
  try {
    // init build process
    var builder = new lib.TransactionBuilder(config.network);
    // add coin specific paramiters
    // calculate change
    let values = new Array
    for (var i = 0; i < inputs.length; i++){
      values.push(inputs[i].satoshis)
    }
    params.sum = values.reduce((a, b) => a + b)
    var changeAm = params.sum - params.round;
    console.log(`sent: ${Number((params.amount * 100000000).toFixed(0))} change: ${changeAm} fee: ${params.sum - (Number((params.amount * 100000000).toFixed(0)) + changeAm)}`)
    // add tx inputs
    inputs.forEach(input => builder.addInput(input.txid, input.vout))
    // add outputs
    builder.addOutput(params.to.replace(/\s+/g, ''), Number(((params.amount * 100000000)).toFixed(0)))
    if (!(params.round == params.bls * 100000000)){
      builder.addOutput(params.from, changeAm)
    }
    signTransaction(params, inputs, builder, cb)
  } catch (err) {
    console.log(err)
    cb({status: 2, message: 'Problem building transaction. Please try again'})
  }
}

function signTransaction(params, inputs, builder, cb){
  try {
    var key = lib.ECPair.fromWIF(params.priv, config.network);
    var hashType = lib.Transaction.SIGHASH_ALL | lib.Transaction.SIGHASH_BITCOINCASHBIP143
    // applying signature
    try {
      inputs.forEach((v, i) => {builder.sign(i, key, null, hashType, inputs[i].satoshis)})
    } catch (err) {
      console.log('1 ' + err)
    }
    broadcastTransaction(builder.build().toHex(), cb)
  } catch (err) {
    console.log(err)
    cb({status: 2, message: 'Problem signing transaction. Please try again'})
  }
}

function broadcastTransaction(txhex, cb){
  console.log(txhex)
 axios.post(`https://insight.clashic.cash/api/tx/send`, {rawtx: txhex}).then(function (response) {
   console.log(response.data)
    if (response.data.error){
      cb({status: 2, message: 'problem broadcasting transaction, if you have just made a transaction that is currently unconfirmed please try again in a few minutes'})
    } else {
      cb({status: 1})
    }
  })
  .catch(function (error) {
    console.log(error)
    cb({status: 2, message: 'problem broadcasting transaction, if you have just made a transaction that is currently unconfirmed please try again in a few minutes'})
  });
}
