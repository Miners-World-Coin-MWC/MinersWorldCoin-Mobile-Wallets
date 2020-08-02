import React, {Component} from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Text from './Text'
import DeviceInfo from 'react-native-device-info'
import Card from './Card'
import config from '../src/config'

export default class CoinCard extends Component {

 nFormatter = (num) => {
    if (num >= 1000000000) {
       return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    }
    if (num >= 1000000) {
       return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
       return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

  render() {
    return (
      <View style={styles.shadow}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={config.gradient} style={styles.card}>
          <Card top={DeviceInfo.hasNotch() == 1 ? 50 : 25} width={280} height={80} justifyCenter style={{alignItems: 'flex-start'}}>
            <Image style={styles.logo} source={require('../assets/icon.png')}/>
            <View style={styles.balanceWrapper}>
              <Text size={13} bold>{this.nFormatter(this.props.balanceData.balance)} {config.ticker}</Text>
              <Text size={12}>${this.props.balanceData.fiatBalance}</Text>
            </View>
            <View style={styles.infoWrapper}>
              <Text bold>{config.name}</Text>
              <Text size={12}>{'$' + this.props.balanceData.price || 'Network Error'}</Text>
            </View>
          </Card>
            {this.props.children}
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    height: DeviceInfo.hasNotch() == 1 ? 210 : 190, 
    width: Dimensions.get('window').width, 
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  shadow: {
    shadowColor: "#181818",
    shadowOffset: {
  	width: 7,
  	height: 7,
  },
  shadowOpacity: 1,
  shadowRadius: 7,

  elevation: 40,
  backgroundColor: 'black',
  },
  arrow: {
    width: 40,
    height: 40
  },
  arrowWrapper: {
    position: 'absolute',
    left: DeviceInfo.hasNotch() == 1 ? 20 : 10,
    top: DeviceInfo.hasNotch() == 1 ? 30 : 10,
  },
  logo: {
    width: 35, 
    height: 35,
    marginLeft: 10
  },
  balanceWrapper: {
    position: 'absolute',
    right: 10,
    alignItems: 'flex-end'
  },
  infoWrapper: {
    position: 'absolute',
    left: 55,
  }
})