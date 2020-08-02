import React, { Component } from 'react';
import {
    TouchableOpacity,
    Dimensions,
    View,
    StyleSheet
} from 'react-native';
import Text from './Text'

const {width, height} = Dimensions.get('window')

export default class KeyPad extends Component {
  constructor(){
    super()
    this.state = {
      pin: ''
    }
  }
  change = async (val) => {
    if (!(this.state.pin.length >= 6)){
      await this.setState({pin: this.state.pin + val})
      this.props.onChange(this.state.pin)
    }
  }
  back = async () => {
    await this.setState({pin: this.state.pin.substring(0, this.state.pin.length - 1)})
    this.props.onChange(this.state.pin)
  }
  render () {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => this.change('1')} style={styles.key}>
            <Text>1</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('2')} style={styles.key}>
            <Text>2</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('3')} style={styles.key}>
            <Text>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => this.change('4')} style={styles.key}>
            <Text>4</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('5')} style={styles.key}>
            <Text>5</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('6')} style={styles.key}>
            <Text>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => this.change('7')} style={styles.key}>
            <Text>7</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('8')} style={styles.key}>
            <Text>8</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('9')} style={styles.key}>
            <Text>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={this.back} style={styles.key}>
            <Text>BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.change('0')} style={styles.key}>
            <Text>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.onGoPress()} style={styles.key}>
            <Text>{this.props.goText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    width: width / 1.2,
  },
  row: {
    flexDirection: 'row'
  },
  key: {
    width: (width / 1.2) * 0.333,
    height: height / 14,
    justifyContent: 'center',
    alignItems: 'center'
  }
})