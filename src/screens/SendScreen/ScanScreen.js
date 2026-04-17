import React, { PureComponent } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import { Button } from 'react-native-elements';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';
import { connectWallet } from 'src/redux';
import { isAddress } from 'src/utils/WalletUtils';
import { Navigation } from 'react-native-navigation';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    buttonIn: {
        backgroundColor: 'black',
        borderColor: '#6c82cf',
        borderWidth: 2,
        borderRadius: 20,
        marginTop: 14,
    },
    buttonTitleIn: {
        fontSize: 14,
        fontWeight: 'bold'
    },
});

class ScanScreen extends PureComponent {
    state = {
        hasPermission: false,
        device: null
    };

    async componentDidMount() {
        Navigation.mergeOptions(this.props.componentId, {
            layout: { backgroundColor: '#fff' },
            statusBar: { visible: false },
            topBar: { visible: false }
        });

        Navigation.events().bindComponent(this);

        const permission = await Camera.requestCameraPermission();
        const devices = await Camera.getAvailableCameraDevices();

        this.setState({
            hasPermission: permission === 'authorized',
            device: devices.find(d => d.position === 'back')
        });
    }

    onSuccess = (data) => {
        const { setWalletValues, timestamp } = this.props;
        let address = data;

        if (address.startsWith(`${Config.NETWORK_NAME.toLowerCase()}:`)) {
            address = address.replace(`${Config.NETWORK_NAME.toLowerCase()}:`, '');
        }

        if (isAddress(address)) {
            setWalletValues({ cache: { sendAddress: address }, timestamp });
            this.dismissModal();
        }
    };

    dismissModal = () => {
        Navigation.dismissModal(this.props.componentId);
    };

    frameProcessor = (frame) => {
        'worklet';
        const barcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE]);

        if (barcodes.length > 0) {
            const value = barcodes[0].displayValue;
            if (value) {
                runOnJS(this.onSuccess)(value);
            }
        }
    };

    render() {
        const { device, hasPermission } = this.state;

        if (!device || !hasPermission) {
            return <Text>Loading Camera...</Text>;
        }

        return (
            <View style={{ flex: 1 }}>
                <Camera
                    style={{ flex: 1 }}
                    device={device}
                    isActive={true}
                    frameProcessor={this.frameProcessor}
                    frameProcessorFps={5}
                />

                <View style={{
                    position: "absolute",
                    bottom: 20,
                    left: 0,
                    right: 0,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Button
                        icon={{
                            name: "times",
                            size: 14,
                            type: 'font-awesome',
                            color: "white"
                        }}
                        title={global.strings['send.dismissScanModalButton']}
                        containerStyle={{ width: "90%" }}
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