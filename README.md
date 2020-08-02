# Bitcoin Clashic Mobile Wallet

## Build instructions

Dev:
```
clone && cd repo
npm install --save
```
in node_modules/bs58check/index.js change
```javascript

require('create-hash') 
```
to
```javascript 
require('react-native-crypto').createHash
```

then to run

```
cd ios && pod install && cd ..
react-native run-ios
```
or 
```
react-native run-android
```