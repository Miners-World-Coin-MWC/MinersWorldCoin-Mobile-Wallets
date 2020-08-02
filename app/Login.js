import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'
import GradientButton from '../components/GradentButton'
import KeyPad from '../components/KeyPad'
import Card from '../components/Card'
import Text from '../components/Text'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import DeviceInfo from 'react-native-device-info'
import crypto from 'react-native-crypto'

const {width, height} = Dimensions.get('window')

export default class Login extends Component {
  constructor(){
    super()
    this.state = {
      spinner: false,
      userExists: false,
      inputsPosition: new Animated.Value(0),
      pinPosition: new Animated.Value(width),
      username: '',
      password: '',
      cPassword: '',
      pin: 'PIN',
      title: 'USER CREDENTIALS',
      userData: {pin: '', key: ''}
    }
  }
  componentDidMount(){
    RNSecureKeyStore.get("userData").then((res) => {
        this.setState({userExists: true, userData: JSON.parse(res), title: 'LOGIN'})
      }, (err) => {
          //this.setState({title: false})
      })
  }
  createAccount = () => {
      if (this.state.pin == 'PIN' || this.state.pin == ''){
          Alert.alert('Enter a valid PIN')
      } else {
          //this.props.spinner()
          RNSecureKeyStore.set("userData", JSON.stringify({pin: this.state.pin, key: crypto.createHmac('sha256', (this.state.username + this.state.password + 'fromlib')).digest('hex')}), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
          .then((res) => {
              this.props.goToWallet(crypto.createHmac('sha256', (this.state.username + this.state.password + 'fromlib')).digest('hex'))
            }, (err) => {
                console.log(err);
            });
      }
  }
  goToPin = () => {
      if (this.state.username == '' || this.state.password == '' || this.state.cPassword == ''){
          Alert.alert('Fill out required fields')
      } else {
          this.setState({title: 'ENTER A PIN'})
        Animated.timing(this.state.inputsPosition, {
            toValue: -width,
            timing: 300
        }).start()
        Animated.timing(this.state.pinPosition, {
            toValue: -width,
            timing: 300
        }).start()
      }
  }
  login = () => {
      if (this.state.pin !== this.state.userData.pin){
          Alert.alert('Incorrect PIN')
      } else {
          this.props.goToWallet(this.state.userData.key)
      }
  }
  render() {
    return (
      <View style={styles.background}>
          <Text size={20} bold top={DeviceInfo.hasNotch() == 1 ? 80 : 50}>
             {this.state.title}
          </Text>
          {
              this.state.userExists ? (
                  <View style={{width, alignItems: 'center'}}>
                    <Card top={30} justifyCenter width={width / 2.5} height={45}>
                       <Text bold>{this.state.pin}</Text>
                    </Card>
                    <KeyPad
                      onChange={(value) => this.setState({pin: value})}
                      goText='LOGIN'
                      style={{marginTop: height / 3}}
                      onGoPress={this.login}
                    />
                  </View>
              ) : (
                <ScrollView style={styles.mainContainer}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                  <Animated.View style={[styles.inner, {transform: [{translateX: this.state.inputsPosition}], marginTop: height / 12}]}>
                    <Card justifyCenter width={width / 1.3} height={60}>
                        <TextInput 
                          placeholder='Username' 
                          style={styles.input}
                          value={this.state.username}
                          onChangeText={(value) => this.setState({username: value})}
                        />
                    </Card>
                    <Card top={30} justifyCenter width={width / 1.3} height={60}>
                        <TextInput 
                          placeholder='Password' 
                          style={styles.input}
                          value={this.state.password}
                          secureTextEntry
                          onChangeText={(value) => this.setState({password: value})}
                        />
                    </Card>
                    <Card top={30} justifyCenter width={width / 1.3} height={60}>
                        <TextInput 
                          placeholder='Confirm Password' 
                          style={styles.input}
                          value={this.state.cPassword}
                          secureTextEntry
                          onChangeText={(value) => this.setState({cPassword: value})}
                        />
                    </Card>
                    <GradientButton onPress={this.goToPin} width={width / 1.3} top={50} title='NEXT'/>
                    <Text padding={20} center color="grey">Do not forget your username and password. These cannot be changed and you will need them in order to restore you funds.</Text>
                </Animated.View>
                <Animated.View style={[styles.inner, {transform: [{translateX: this.state.pinPosition}]}]}>
                    <Card top={30} justifyCenter width={width / 2.5} height={45}>
                        <Text bold>{this.state.pin}</Text>
                    </Card>
                    <KeyPad
                      onChange={(value) => this.setState({pin: value})}
                      goText='SETUP'
                      style={{marginTop: height / 3}}
                      onGoPress={this.createAccount}
                    />
                </Animated.View>
                </View>
            </ScrollView>
              )
          }
      </View>
    );
  }
};


const styles = StyleSheet.create({
    background: {
        backgroundColor: '#222222', 
        width: width, 
        height: height,
        alignItems: 'center'
    },
    mainContainer: {
        width: width,
        height: height / 1.2,
        position: 'absolute',
        bottom: 0,
    },
    inner: {
        width: width,
        alignItems: 'center',
    },
    input: {
        width: width / 1.4,
        height: 55,
        color: 'white'
    },
    pinCard: {
        position: 'absolute'
    }
})
