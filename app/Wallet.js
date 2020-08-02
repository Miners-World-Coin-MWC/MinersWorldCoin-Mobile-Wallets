import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Image, Clipboard, Alert, Platform, Keyboard } from 'react-native';
import Card from '../components/Card'
import Text from '../components/Text'
import WalletHeader from '../components/WalletHeader'
import Row from '../components/Row'
import LineGradient from '../components/LineGradient'
import IOS_QR from 'react-native-qr-generator'
import DeviceInfo from 'react-native-device-info'
import GradientButton from '../components/GradentButton'
import transaction from '../components/Transactions'
import Spinner from 'react-native-loading-spinner-overlay'
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from 'react-native-modal'
import config from '../src/config'
import moment from 'moment'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";


const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default class Wallet extends Component {

    constructor(props){
        super(props)
        this.state = {
            isActivity: true,
            isReceive: false,
            isSend : false,
            fee: 0.0002034,
            address: '',
            amount: 0,
            spinner: false,
            feeButtons: {
                left: 'white',
                middle: 'grey',
                right: 'grey'
            },
            qrModal: false,
            errorIndex: '',
            sucessModal: false,
            privateKey: false,
            pin: '',
            privateKeyModalHeight: new Animated.Value(200),
            viewPrivateKey: false,
            privateKeyModalButtonTitle: 'BACKUP'
        }
    }

    changeFee = (type) => {
        if (type == 'economy'){
            this.setState({feeButtons: {left: 'white', middle: 'grey', right: 'grey'}, fee: 0.0002034})
            if ((Number(this.state.amount) + Number(this.state.fee)).toFixed(4) == this.props.balanceData.balance){
                this.setState({amount: String(Number(this.props.balanceData.balance - 0.0002034).toFixed(8))})
            }
        } else if (type == 'standard'){
            this.setState({feeButtons: {left: 'grey', middle: 'white', right: 'grey'}, fee: 0.0005034})
            if ((Number(this.state.amount) + Number(this.state.fee)).toFixed(4) == this.props.balanceData.balance){
                this.setState({amount: String(Number(this.props.balanceData.balance - 0.0005034).toFixed(8))})
            }
        } else if (type == 'fast'){
            this.setState({feeButtons: {left: 'grey', middle: 'grey', right: 'white'}, fee: 0.0007534})
            if ((Number(this.state.amount) + Number(this.state.fee)).toFixed(4) == this.props.balanceData.balance){
                this.setState({amount: String(Number(this.props.balanceData.balance - 0.0007534).toFixed(8))})
            }
        }
    }

    switchToReceive = () => {
        this.setState({isActivity: false, isReceive: true, isSend: false})
    }

    SwitchToActivity = () => {
        this.setState({isActivity: true, isReceive: false, isSend: false})
    }

    SwitchToSend = () => {
        this.setState({isActivity: false, isReceive: false, isSend: true})
    }

    sendTx = async () => {
        let self = this
        this.setState({spinner: true})
        transaction({
            to: this.state.address,
            amount: Number(this.state.amount),
            fee: Number(this.state.fee),
            from: this.props.keyPair.address,
            priv: this.props.keyPair.privatekey,
            balance: this.props.balanceData.balance,
            stageFunction: (error) => {
                this.setState({errorIndex: error})
            }
        },
        function(result){
            self.setState({spinner: false})
            if (result.status == 2){
                setTimeout(() => {
                    Alert.alert('Error', result.message)
                }, 200)
            } else if (result.status == 1){
                self.SwitchToActivity()
                self.setState({sucessModal: true, address: '', amount: 0})
                self.changeFee('economy')
            }
        })
    }

    max = () => {
        this.setState({amount: String((Number(this.props.balanceData.balance) - Number(this.state.fee)).toFixed(8))})
    }

    disMount = () => {
        this.setState({address: '', amount: ''})
        this.changeFee('economy')
    }

    onQrCodeScan = (e) => {
        this.setState({address: e.data, qrModal: false})
      }

    expand(i){
        let hl = this.props.balanceData.heightList
        if (hl[i] == 65) {
           hl[i] = 150
           this.setState({heightList: hl})
        } else {
            hl[i] = 65
            this.setState({heightList: hl})
        }
    }

     insight_explorer_transaction_value(vout, vinDirection){
         let direction
         vinDirection ? direction = 'SENT' : direction = 'RECEIVED'
        // Needs some more work
        if (direction == 'SENT'){
          var voutAddress
          for (var i = 0; i < vout.length; i++){
            if (vout[i].scriptPubKey.addresses !== undefined){
              if (vout[i].scriptPubKey.addresses[0] !== this.props.keyPair.address) voutAddress = vout[i].scriptPubKey.addresses[0]
            }
          }
          if (voutAddress !== undefined){
            return vout[vout.findIndex((x) => x.scriptPubKey.addresses[0] === voutAddress)].value
          } else {
            // tx sent to self
            let voutValues = new Array
            for (var i = 0; i < vout.length; i++){
              voutValues.push(Number(vout[i].value))
            }
            return Math.min.apply( Math, voutValues )
          }
        } else {
          var voutAddress
          for (var i = 0; i < vout.length; i++){
            if (vout[i].scriptPubKey.addresses !== undefined){
              if (vout[i].scriptPubKey.addresses[0] == this.props.keyPair.address) return vout[i].value
            }
          }
          if (voutAddress !== undefined){
            return vout[vout.findIndex((x) => x.scriptPubKey.addresses[0] === voutAddress)].value
          }
        }
      }

      backup = () => {
        RNSecureKeyStore.get("userData").then((res) => {
          if (this.state.pin == JSON.parse(res).pin){
            Keyboard.dismiss()
            Animated.timing(this.state.privateKeyModalHeight, {
              toValue: 500,
              timing: 1000
            }).start()
            let self = this
            setTimeout(() => {
              self.setState({viewPrivateKey: true, privateKeyModalButtonTitle: 'COPY TO CLIPBOARD'})
            }, 1000);
          } else {
            Alert.alert('Incorrect pin')
          }
        }, (err) => {
            Alert.alert('Error getting pin')
        })
      }

      closePrivateKeyModal = () => {
        console.log(Number(this.state.privateKeyModalHeight))
        if (this.state.viewPrivateKey) {
          this.setState({viewPrivateKey: false, privateKeyModalButtonTitle: 'BACKUP'})
          let self = this
          Animated.timing(this.state.privateKeyModalHeight, {
            toValue: 200,
            timing: 1000
          }).start()
          setTimeout(() => {
            self.setState({privateKey: false})
          }, 1000);
        } else {
          this.setState({privateKey: false})
        }
      }

      copyPrivateKey = () => {
        Clipboard.setString(this.props.keyPair.privatekey)
        Alert.alert('Copied')
      }

  render() {
    return (
        <View style={styles.background}>
        <Spinner
          visible={this.state.spinner}
          overlayColor={'rgba(0,0,0,0.8)'}
        />
        <KeyboardAvoidingView behavior="padding">
            <WalletHeader balanceData={this.props.balanceData}>
              <Row style={styles.toggle}>
                    <TouchableOpacity onPress={this.SwitchToActivity} style={{width: 100, alignItems: 'center', marginLeft: 20}}>
                      <Text size={18} bold>ACTIVITY</Text>
                      {
                          this.state.isActivity ? (
                            <LineGradient color='white' top={2} width={100}/>
                          ) : (
                            <LineGradient clear top={2} width={1}/>
                          )
                      }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.SwitchToSend} style={{width: 100, alignItems: 'center', marginRight: 0}}>
                        <Text size={18} bold>SEND</Text>
                        {
                            this.state.isSend ? (
                                <LineGradient color='white' top={2} width={100}/>
                            ) : (
                                <LineGradient clear top={2} width={100}/>
                            )
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.switchToReceive} style={{width: 100, alignItems: 'center', marginRight: 20}}>
                        <Text size={18} bold>RECEIVE</Text>
                        {
                            this.state.isReceive ? (
                                <LineGradient color='white' top={2} width={100}/>
                            ) : (
                                <LineGradient clear top={2} width={100}/>
                            )
                        }
                    </TouchableOpacity>                
                </Row>
            </WalletHeader>
            <ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={{alignItems: 'center'}}>
                {
                    this.state.isActivity ? (
                  <View style={{width: width, alignItems: 'center'}}>
                      {
                          this.props.balanceData.transactions.length == 0 ? (
                              <View style={{textAlign: 'center', padding: 20}}>
                                <Text center color="grey">No Transactions</Text>
                                <Text center color="grey">Go to the RECEIVE page to get your wallet address</Text>
                              </View>
                          ) : (
                            <View style={{width, alignItems: 'center'}}>
                                {
                                    this.props.balanceData.transactions.map((item, index) => (
                                      <TouchableOpacity onPress={() => this.expand(index)} style={[styles.transaction, {borderTopWidth: index == 0 ? 1 : 0.5, borderBottomWidth: index == this.props.balanceData.transactions.length - 1 ? 1 : 0.5, height: this.props.balanceData.heightList[index]}]}>
                                        <View style={styles.txIconCard}>
                                          <Image style={styles.txIcon} source={item.vin[0].addr == this.props.keyPair.address ? require('../assets/sent.png') : require('../assets/receive.png')}/>
                                        </View>
                                        {
                                            item.confirmations == 0 ? (
                                                <View style={styles.pending}>
                                                  <Text color="#e44c3c" bold>Pending ...</Text>
                                                </View>
                                            ) : (
                                              <View style={styles.time}>
                                                <Text bold>{moment(item.time * 1000).format("DD/MM/YYYY")}</Text>
                                                <Text>{moment(item.time * 1000).format("HH:mm")}</Text>
                                            </View>
                                            )
                                        }
                                        <View style={styles.txAmountWrapper}>
                                          <Text size={20}>{Number(this.insight_explorer_transaction_value(item.vout, item.vin[0].addr == this.props.keyPair.address)).toFixed(4)}</Text>
                                          <Text size={10}>{config.ticker}</Text>
                                        </View>
                                        {
                                            this.props.balanceData.heightList[index] == 65 ? null : (
                                                <View style={{marginTop: 20, width, alignItems: 'center'}}>
                                                  <TouchableOpacity onPress={() => {
                                                      Clipboard.setString(item.txid)
                                                      Alert.alert('Copied to clipboard')
                                                  }} style={{flexDirection: 'row'}}>
                                                      <Text size={width / 27} bold>Txid: </Text>
                                                      <Text size={width / 27}>{item.txid.slice(0, (item.vin[0].addr == this.props.keyPair.address ? item.vout[0].scriptPubKey.addresses[0].length : item.vin[0].addr.length - 3))}...</Text>
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={() => {
                                                      Clipboard.setString(item.vin[0].addr == this.props.keyPair.address ? item.vout[0].scriptPubKey.addresses[0] : item.vin[0].addr)
                                                      Alert.alert('Copied to clipboard')
                                                  }} style={{flexDirection: 'row'}}>
                                                      <Text size={width / 27} bold>{item.vin[0].addr == this.props.keyPair.address ? 'To: ' : 'From:'} </Text>
                                                       <Text size={width / 27}>{item.vin[0].addr == this.props.keyPair.address ? item.vout[0].scriptPubKey.addresses[0] : item.vin[0].addr}</Text>
                                                  </TouchableOpacity>
                                                  <View style={{flexDirection: 'row', marginTop: 7}}>
                                                    <Text size={width / 27} bold>Confirmations: </Text>
                                                    <Text size={width / 27}>{item.confirmations}</Text>
                                                  </View>
                                                </View>
                                            )
                                        }
                                      </TouchableOpacity>
                                    ))
                                   }
                              </View>
                          )
                      }
                  </View>
                    ) : this.state.isReceive ? (
              <View style={{width, alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => {
                      Clipboard.setString(this.props.keyPair.address);
                      Alert.alert('Copied to Clipboard')
                      console.log(this.props.keyPair.address)
                  }}>
                    <Card justifyCenter width={width - 50} height={50} top={30}>
                      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Text size={width / 30} center color="grey">{this.props.keyPair.address}</Text>
                        <Image style={styles.copyIcon} source={require('../assets/clipboard.png')}/>
                      </View>
                    </Card>
                  </TouchableOpacity>
                  <Card justifyCenter width={width - 50} height={width - 50} top={30}>
                            <IOS_QR 
                              size={width - 80} 
                              value={this.props.keyPair.address}
                              foregroundColor='black'
                              backgroundColor='#363636'
                          />
                  </Card>
                  <TouchableOpacity onPress={() => this.setState({privateKey: true})}>
                    <Card justifyCenter height={50} width={(width - 50) / 3} style={{marginLeft: (width - 50) / 1.5}} top={20}>
                      <Text color='grey' bold>BACKUP</Text>
                    </Card>
                  </TouchableOpacity>
                  </View>
                    ) : this.state.isSend ? (
                        <View style={{width, alignItems: 'center'}}>
                            <Card style={{flexDirection: 'row'}} justifyCenter top={50} width={300} height={50}>
                              <TextInput placeholder='Address' placeholderTextColor="grey" style={styles.input} onChangeText={(address) => this.setState({address})} value={this.state.address}/>
                              <TouchableOpacity onPress={() => this.setState({qrModal: true})} style={{position: 'absolute', right: 15}}>
                                <Image style={styles.qr} source={require('../assets/qr.png')}/>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={async () => this.setState({address: await Clipboard.getString()})} style={{position: 'absolute', right: 50}}>
                                <Image style={styles.qr} source={require('../assets/paste.png')}/>
                              </TouchableOpacity>
                            </Card>
                            <Card style={{flexDirection: 'row'}} justifyCenter top={30} width={300} height={50}>
                              <TextInput keyboardType='numeric' placeholder='Amount' placeholderTextColor="grey" style={styles.input} onChangeText={(amount) => this.setState({amount: amount.replace(/,/, '.')})} value={this.state.amount}/>
                              <TouchableOpacity onPress={this.max} style={[{borderColor: config.color}, styles.sendAll]}>
                                  <Text bold size={10}>MAX</Text>
                              </TouchableOpacity>
                            </Card>
                            <View style={{flexDirection: 'row', marginTop: 25}}>
                                <TouchableOpacity onPress={() => this.changeFee('economy')} style={[styles.feeButton, {borderTopLeftRadius: 15, borderBottomLeftRadius: 15}]}>
                                    <Text size={12} color={this.state.feeButtons.left}>Economy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeFee('standard')} style={[styles.feeButton]}>
                                    <Text size={12} color={this.state.feeButtons.middle}>Standard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeFee('fast')} style={[styles.feeButton, {borderTopRightRadius: 15, borderBottomRightRadius: 15}]}>
                                    <Text size={12} color={this.state.feeButtons.right}>Fast</Text>
                                </TouchableOpacity>
                            </View>
                            <Text top={20} color="grey">Fee: {this.state.fee}</Text>
                            {/*<TextInput multiline style={{borderColor: 'white', borderWidth: 2, width: 200, height: 200, color: 'white'}} value={this.state.errorIndex}/>*/}
                    <GradientButton onPress={this.sendTx} title="SEND" top={30} color={config.color}/>
                        <Modal style={styles.modal} isVisible={this.state.qrModal} onBackdropPress={() => this.setState({qrModal: false})}>
                            <Card width={1} height={1}>
                              <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
                                <QRCodeScanner
                                   cameraStyle={{height: height / 1.7}}
                                   onRead={this.onQrCodeScan}/>
                              </View>
                            </Card>
                        </Modal>
                      </View>
                    ) : null
                }
              </ScrollView>
            </KeyboardAvoidingView>
            <Modal animationIn='fadeIn' animationOut='fadeOut' isVisible={this.state.sucessModal} style={styles.successModal} onBackdropPress={() => this.setState({sucessModal: false})}>
                <Card height={180} width={150} justifyCenter>
                    <Image style={{width: 80, height: 80}} source={require('../assets/success.png')}/>
                    <Text bold top={20}>SUCCESS</Text>
                </Card>
            </Modal>
            <Modal style={styles.privateKeyModal} isVisible={this.state.privateKey}>
              <Card height={this.state.privateKeyModalHeight} top={50} width={width - 80}>
                <Text bold size={20} top={15}>ENTER PIN</Text>
                <TextInput secureTextEntry onChangeText={(value) => this.setState({pin: value})} keyboardType='numeric' style={styles.pinInput} value={this.state.pin}/>
                <TouchableOpacity onPress={this.closePrivateKeyModal} style={styles.close}>
                  <Text bold size={20} color='white'>CLOSE</Text>
                </TouchableOpacity>
                <GradientButton fontSize={15} onPress={this.state.viewPrivateKey ? this.copyPrivateKey : this.backup} top={30} title={this.state.privateKeyModalButtonTitle} width={width - 200} height={40}/>
                {
                  this.state.viewPrivateKey ? (
                    <View style={{width: '100%', alignItems: 'center'}}>
                      <Text bold size={15} top={20}>private key:</Text>
                      <IOS_QR 
                          style={{marginTop: 20}}
                          size={width - 200} 
                          value={this.props.keyPair.privatekey}
                          foregroundColor='black'
                          backgroundColor='#363636'
                      />
                    </View>
                  ) : null
                }
              </Card>
            </Modal>
        </View>
    )
  }
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#222222',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        alignItems: 'center',
    },
    deleteTouchable: {
        width: 277,
        height: 87,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toggle: {
        position: 'absolute',
        bottom: 20
    },
    copyIcon: {
        width: 20,
        height: 20,
        marginLeft: 10
    },
    createWrapper: {
        bottom: Platform.OS == 'ios' ? 30 : 50,
        right: 20,
        position: 'absolute',
    },
    transaction: {
        width: Dimensions.get('window').width - 10,
        borderColor: 'grey',
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5,
    },
    txIcon: {
        width: 35,
        height: 35
      },
    time: {
        marginLeft: 100,
        marginTop: 12
      },
      txAmountWrapper: {
        position: 'absolute',
        right: 20,
        marginTop: 10,
        alignItems: 'flex-end',
      },
      txIconCard: {
        position: 'absolute',
        left: 20,
        justifyContent: 'center',
        height: 65
        
      },
      logo: {
        width: 150,
        height: 150,
        position: 'absolute',
        right: 0
    },
    qr: {
        width: 25,
        height: 25,
    },
    input: {
        height: 35,
        width: 200,
        marginLeft: -80,
        color: 'white'
    },
    sendAll: {
        width:  70,
        height: 25,
        borderRadius: 20,
        borderWidth: 2,
        position: 'absolute',
        right: 13,
        alignItems: 'center',
        justifyContent: 'center'
    },
    feeButton: {
        width: width / 4.5,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#363636'
    },
    modal: {
        flex: 1,
        alignItems: 'center',
      },
      successModal: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
      },
      pending: {
        marginLeft: 100,
        marginTop: 23,
        justifyContent: 'center'
    },
    privateKeyModal: {
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    pinInput: {
      borderWidth: 2,
      borderColor: 'grey',
      width: width - 200,
      height: 30,
      marginTop: 10,
      borderRadius: 5,
      textAlign: 'center'
    },
    close: {
      position: 'absolute',
      bottom: 15
    }
});
