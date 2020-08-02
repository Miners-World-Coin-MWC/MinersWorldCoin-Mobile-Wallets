var networks = require('./networks')
export default config = {
  color: 'rgb(253, 148, 10)',
  gradient: ['rgb(234, 120, 20)', 'rgb(253, 148, 10)'],
  name: 'Bitcoin Clashic',
  ticker: 'ASTC',
  network: networks.astracore,
  coingecho_name: 'title-network'
}

// IMPORTANT
// change require('create-hash') to require('react-native-crypto').createHash
// in node_modules/bs58check/index.js
