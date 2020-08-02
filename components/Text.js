import React, { Component } from 'react';
import {
    Text,
    Platform
} from 'react-native';

export default class Font extends Component {
  render () {
    return (
        <Text style={[this.props.style, {
            fontWeight: this.props.bold ? 'bold' : 'normal',
            marginLeft: this.props.left || 0,
            marginRight: this.props.right || 0,
            color: this.props.color || 'white',
            fontSize: this.props.size || 15,
            fontFamily: Platform.OS == 'ios' ? null : 'for oneplus devices',
            textAlign: this.props.center ? 'center' : null,
            padding: this.props.padding || 0,
            marginTop: this.props.top || 0,
            marginBottom: this.props.bottom || 0
        }]}>
            {this.props.children}
        </Text>
    )
  }
};