import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'
import Wallet from './app/Wallet'
import Login from './app/Login'
import KeyPair from './components/GenerateKeys'
import balance from './src/balances'
const {width, height} = Dimensions.get('window')

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      spinner: false,
      balanceData: {price: '0', balance: '0.0000', fiatBalance: '0.00', transactions: [], heightList: []},
      main: new Animated.Value(width),
      login: new Animated.Value(0),
      keyPair: {address: '', privateKey: ''}
    }
  }
  goToWallet = (key) => {
    let self = this
    this.setState({spinner: false, keyPair: KeyPair(key)})
    balance(KeyPair(key).address, function(response) {
      //console.log(response)
      self.setState({balanceData: response})
  })
    Animated.timing(this.state.login, {
      toValue: -width,
      timing: 300
    }).start()
    Animated.timing(this.state.main, {
      toValue: -width,
      timing: 300
    }).start()
    setInterval(() => {
      self.updateBalance()
    }, 30000)
  }

  updateBalance(){
    let self = this
    balance(this.state.keyPair.address, function(response) {
      //console.log(response)
      self.setState({balanceData: response}) 
  })
  }
  render() {
    return (
      <View style={{backgroundColor: '#222222', flexDirection: 'row', flex: 1}}>
      <Spinner
          visible={this.state.spinner}
        overlayColor={'rgba(0,0,0,0.8)'}
      />
      <Animated.View style={[{transform: [{translateX: this.state.login}]}]}>
        <Login
          goToWallet={(key) => this.goToWallet(key)}
          spinner={() => this.setState({spinner: !this.state.spinner})}
        />
      </Animated.View>
      <Animated.View style={[{transform: [{translateX: this.state.main}]}]}>
        <Wallet
          key={this.state.key}
          keyPair={this.state.keyPair}
          balanceData={this.state.balanceData}
        />
      </Animated.View>
      </View>
    );
  }
};
