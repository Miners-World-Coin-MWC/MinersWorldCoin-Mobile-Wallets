import React, {Component} from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Font from './Text'
import config from '../src/config'

export default class GradentButton extends Component {
    render() {
      return (
        <TouchableOpacity
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 2,
              height: 2
            },
            shadowOpacity: 0.2,
            shadowRadius: 7,
  
            elevation: 21
          }}
          onPress={() => this.props.onPress()}
          disabled={this.props.disabled}
        >
          <LinearGradient
          start={{x: 0, y: 0}}
            colors={this.props.color ? [this.props.color, this.props.color] : config.gradient}
            style={[this.props.style, {
              width: this.props.width ? this.props.width : 280,
              height: this.props.height ? this.props.height : 50,
              borderRadius: this.props.radius || 100,
              alignItems: "center",
              justifyContent: "center",
              marginTop: this.props.top ? this.props.top : 0,
              marginBottom: this.props.bottom ? this.props.bottom : 0,
              marginLeft: this.props.left ? this.props.left : 0,
              marginRight: this.props.right ? this.props.right : 0,
              opacity: this.props.disabled ? 0.5 : 1,
              elevation: 20
            }]}
          >
            <Font color="white" size={this.props.fontSize ? this.props.fontSize : 20} bold>
              {this.props.title}
            </Font>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
  }
  