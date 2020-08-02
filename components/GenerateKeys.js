import '../shim'
import config from '../src/config'
var lib = require('../src')
var bigi = require('bigi')

export default function(hash){
    var keypair = new lib.ECPair(bigi.fromBuffer(hash + 'keypair'), null, {network: config.network});
    return {
        address: keypair.getAddress(),
        privatekey: keypair.toWIF(),
    }
}