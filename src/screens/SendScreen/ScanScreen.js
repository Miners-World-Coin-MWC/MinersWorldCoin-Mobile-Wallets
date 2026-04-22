import React, { PureComponent } from 'react';

import {
    View,
    StyleSheet,
    Text
} from 'react-native';

import { Button } from 'react-native-elements';

import { CameraScreen } from 'react-native-camera-kit';

import { connectWallet } from 'src/redux';
import { isAddress } from 'src/utils/WalletUtils';

import { Navigation } from 'react-native-navigation';

import Config from 'react-native-config';

const styles = StyleSheet.create({
    buttonIn: {
        backgroundColor: 'black',
        borderRadius: 20,
        marginTop: 14,
    },

    buttonTitleIn: {
        fontSize: 14,
        fontWeight: 'bold'
    },
});

class ScanScreen extends PureComponent {

    onSuccess = (event) => {

        const { setWalletValues, timestamp } = this.props;

        let address = event?.nativeEvent?.codeStringValue;

        if (!address) {
            return;
        }

        if (address.startsWith(`${Config.NETWORK_NAME.toLowerCase()}:`)) {

            address = address.replace(
                `${Config.NETWORK_NAME.toLowerCase()}:`,
                ''
            );
        }

        if (isAddress(address)) {

            setWalletValues({
                cache: {
                    sendAddress: address
                },
                timestamp
            });

            this.dismissModal();
        }
    };

    dismissModal = () => {
        Navigation.dismissModal(this.props.componentId);
    };

    render() {

        return (
            <View style={{ flex: 1 }}>

                <CameraScreen
                    scanBarcode={true}
                    onReadCode={this.onSuccess}
                    showFrame={true}
                    laserColor={'red'}
                    frameColor={'white'}
                />

                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    alignItems: 'center'
                }}>

                    <Button
                        title={global.strings['send.dismissScanModalButton']}
                        containerStyle={{ width: '90%' }}
                        buttonStyle={styles.buttonIn}
                        titleStyle={styles.buttonTitleIn}
                        onPress={this.dismissModal}
                    />

                </View>

            </View>
        );
    }
}

export default connectWallet()(ScanScreen);