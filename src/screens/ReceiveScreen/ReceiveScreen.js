// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Alert,
    Clipboard
} from 'react-native';
import {
    Text,
    Button,
    Divider
} from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Navigation } from 'react-native-navigation';
import Config from 'react-native-config';
import { generateAddresses } from 'src/utils/WalletUtils';
import { connectWallet } from 'src/redux';

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    basicContainer: {
        padding: 10,
        paddingTop: 15,
        paddingBottom: 5,
        backgroundColor: 'white',
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'space-between',
        width: "95%",
        flexDirection: 'column',
    },
    qrContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
    },
    buttonIn: {
        backgroundColor: 'black',
        borderColor: '#6c82cf',
        borderWidth: 2,
        borderRadius: 20,
        marginTop: 10,
        width: "95%"
    },
    buttonTitleIn: {
        fontSize: 14,
        fontWeight: 'bold'
    },
});

class ReceiveScreen extends PureComponent {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
    }

    componentDidMount() {
        this.ensureAddress();
    }

    ensureAddress = async () => {
        // auto-generate an address if none exists
        const { timestamp, setWalletValues, updateWalletValues, wallet } = this.props;
        const walletData = wallet[timestamp];

        if (!walletData.receiveAddress || !walletData.addresses || Object.keys(walletData.addresses).length === 0) {
            const seed = walletData.seedPhrase.join(" ");
            const newAddressObj = await generateAddresses(seed, Config.DERIVATION_PATH + "0", 0, 0);
            const firstAddress = Object.keys(newAddressObj)[0];

            // update wallet state immediately
            setWalletValues({ receiveAddress: firstAddress, timestamp });
            updateWalletValues({ addresses: newAddressObj, timestamp });
        }
    }

    newAddress = async () => {
        const { setWalletValues, updateWalletValues, timestamp, wallet } = this.props;
        const { addresses, receiveAddress, seedPhrase } = wallet[timestamp];

        const currentIndex = addresses && addresses[receiveAddress] ? addresses[receiveAddress].index : 0;
        const newAddressObj = await generateAddresses(seedPhrase.join(" "), Config.DERIVATION_PATH + "0", currentIndex + 1, currentIndex + 1);
        const firstAddress = Object.keys(newAddressObj)[0];

        setWalletValues({ receiveAddress: firstAddress, timestamp });

        // merge new address into addresses
        updateWalletValues({ addresses: { ...addresses, ...newAddressObj }, timestamp });
    }

    copyAddress = async () => {
        const { timestamp, wallet } = this.props;
        const { receiveAddress } = wallet[timestamp];

        await Clipboard.setString(receiveAddress);
        Alert.alert(
            global.strings['receive.title'],
            global.strings['receive.copyAlert'],
            [{ text: global.strings['receive.confirmAlertButton'] }],
            { cancelable: false },
        );
    }

    render() {
        const { timestamp, wallet } = this.props;

        if (!(timestamp in wallet)) {
            return <View />;
        }

        const { receiveAddress } = wallet[timestamp];

        return (
            <View style={styles.flex}>
                <View style={styles.basicContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                            {global.strings['receive.infoSubtitle']}
                        </Text>
                    </View>
                    <Divider style={{ marginTop: 5, marginBottom: 5, backgroundColor: '#106860' }} />
                    <View style={styles.qrContainer}>
                        <QRCode value={receiveAddress || ''} size={200} />
                    </View>
                    <Text style={{ marginTop: 10, marginBottom: 10, fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: 'gray' }} numberOfLines={1}>
                        {receiveAddress || ''}
                    </Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <Button
                        icon={{ name: "clipboard", size: 14, type: 'font-awesome', color: "white" }}
                        title={global.strings['receive.copyButton']}
                        buttonStyle={styles.buttonIn}
                        containerStyle={{ width: "45%", justifyContent: 'center' }}
                        titleStyle={styles.buttonTitleIn}
                        onPress={this.copyAddress}
                    />
                    <Button
                        icon={{ name: "plus", size: 14, type: 'font-awesome', color: "white" }}
                        buttonStyle={styles.buttonIn}
                        titleStyle={styles.buttonTitleIn}
                        containerStyle={{ width: "45%", justifyContent: 'center' }}
                        title={global.strings['receive.newButton']}
                        onPress={this.newAddress}
                    />
                </View>
            </View>
        );
    }
}

ReceiveScreen.propTypes = {
    wallet: PropTypes.shape({}).isRequired
};

export default connectWallet()(ReceiveScreen);