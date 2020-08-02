```
cd AstraCore-Mobile-Wallets
npm install --save
npm i react-native-crypto
npm audit fix
npm install bs58check
cd node_modules
cd bs58check
nano index.js
```
change the `require('create-hash')` to 
`require('react-native-crypto').createHash`
```
cd ../..
sudo npm install -g react-native-cli
npm install
react-native run-android
```
