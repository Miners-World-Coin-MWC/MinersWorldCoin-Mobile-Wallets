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

    // ✅ RN 0.72 safe trigger
    componentDidAppear() {
        this.ensureAddress();
    }

    componentDidUpdate(prevProps) {
        const prevWallet = prevProps.wallet?.[this.props.timestamp];
        const currentWallet = this.props.wallet?.[this.props.timestamp];

        if (!prevWallet || !currentWallet) return;

        const prevReceive = prevWallet.receiveAddress;
        const currentReceive = currentWallet.receiveAddress;

        const prevType = prevWallet.addressType;
        const currentType = currentWallet.addressType;

        // 🔥 ONLY trigger when something actually changed
        if (
            prevReceive !== currentReceive ||
            prevType !== currentType
        ) {
            console.log("🔄 ReceiveScreen update detected");
            this.ensureAddress();
        }
    }

    ensureAddress = async () => {
        const { timestamp, setWalletValues, updateWalletValues, wallet } = this.props;
        const walletData = wallet[timestamp];

        if (!walletData) return;

        const addressType = walletData.addressType || 'bech32';
        const addressesByType = walletData.addressesByType || {};

        // 🔥 prevent useless updates / loops
        if (
            walletData.receiveAddress &&
            addressesByType[addressType] &&
            walletData.receiveAddress === addressesByType[addressType]
        ) {
            return;
        }

        // ✅ already exists → just switch
        if (addressesByType[addressType]) {
            setWalletValues({
                receiveAddress: addressesByType[addressType],
                timestamp
            });
            return;
        }

        // ✅ generate new
        const seed = walletData.seedPhrase.join(" ");
        const derivePath = Config.DERIVATION_PATH + "0";

        const newAddressObj = await generateAddresses(
            seed,
            derivePath,
            0,
            0,
            addressType
        );

        const newAddress = Object.keys(newAddressObj)[0];

        updateWalletValues({
            addresses: {
                ...walletData.addresses,
                ...newAddressObj
            },
            addressesByType: {
                ...addressesByType,
                [addressType]: newAddress
            },
            timestamp
        });

        setWalletValues({
            receiveAddress: newAddress,
            timestamp
        });
    };

    newAddress = async () => {
        const { setWalletValues, updateWalletValues, timestamp, wallet } = this.props;
        const walletData = wallet[timestamp];

        if (!walletData) return;

        const addressType = walletData.addressType || 'bech32';
        const addresses = walletData.addresses || {};
        const addressesByType = walletData.addressesByType || {};

        let lastIndex = 0;

        for (let addr in addresses) {
            if (addresses[addr]?.index !== undefined) {
                lastIndex = Math.max(lastIndex, addresses[addr].index);
            }
        }

        const seed = walletData.seedPhrase.join(" ");
        const derivePath = Config.DERIVATION_PATH + "0";

        const newAddressObj = await generateAddresses(
            seed,
            derivePath,
            lastIndex + 1,
            lastIndex + 1,
            addressType
        );

        const newAddress = Object.keys(newAddressObj)[0];

        setWalletValues({
            receiveAddress: newAddress,
            timestamp
        });

        updateWalletValues({
            addresses: {
                ...addresses,
                ...newAddressObj
            },
            addressesByType: {
                ...addressesByType,
                [addressType]: newAddress
            },
            timestamp
        });
    };

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
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', textAlign: 'center' }}>
                        {global.strings['receive.infoSubtitle']}
                    </Text>

                    <Divider style={{ marginVertical: 5, backgroundColor: '#106860' }} />

                    <View style={styles.qrContainer}>
                        {/* 🔥 force re-render */}
                        <QRCode key={receiveAddress} value={receiveAddress || ''} size={200} />
                    </View>

                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: 11,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: 'gray'
                        }}
                        numberOfLines={1}
                    >
                        {receiveAddress || ''}
                    </Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <Button
                        icon={{ name: "clipboard", size: 14, type: 'font-awesome', color: "white" }}
                        title={global.strings['receive.copyButton']}
                        buttonStyle={styles.buttonIn}
                        containerStyle={{ width: "45%" }}
                        titleStyle={styles.buttonTitleIn}
                        onPress={this.copyAddress}
                    />

                    <Button
                        icon={{ name: "plus", size: 14, type: 'font-awesome', color: "white" }}
                        buttonStyle={styles.buttonIn}
                        titleStyle={styles.buttonTitleIn}
                        containerStyle={{ width: "45%" }}
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