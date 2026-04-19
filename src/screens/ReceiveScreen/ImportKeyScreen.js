// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Alert,
    Image,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import {
    Text,
    Button,
    Input,
    Divider,
} from 'react-native-elements';
import { Navigation } from 'react-native-navigation';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { connectWallet } from 'src/redux';
import { isAddress, importAddressByWIF, getTransactionHistory, getAddressBalance } from 'src/utils/WalletUtils';

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    basicContainer: {
        padding: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignContent: 'space-between',
    },
    buttonIn: {
        backgroundColor: '#ef3b23',
        borderRadius: 25,
    },
    buttonTitleIn: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    buttonOut: {
        color: '#ef3b23',
        borderRadius: 25,
    },
    buttonTitleOut: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ef3b23'
    },
});

class ImportKeyScreen extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            wif: this.props.wif ? this.props.wif : "",
        }

        Navigation.mergeOptions(this.props.componentId, {
            layout: {
                backgroundColor: '#fff'
            },
            statusBar: {
                visible: true,
                style: 'dark'
            },
            topBar: {
                elevation: 0,
                noBorder: true,
                background: {
                    color: 'white',
                },
            }
        })

        Navigation.events().bindComponent(this);
    }

    add = async () => {
        const { wif } = this.state;
        const { updateWalletValues, setWalletValues, wallet } = this.props;

        const { timestamp } = this.props;
        const walletData = wallet[timestamp];

        if (!walletData) return;

        const safeAddresses = (walletData.addresses && typeof walletData.addresses === 'object')
            ? walletData.addresses
            : {};

        const safeTransactions = (walletData.transactions && typeof walletData.transactions === 'object')
            ? walletData.transactions
            : {};

        // 🔥 STEP 1 — derive ALL address types
        const legacy = importAddressByWIF(wif, 'legacy');
        const segwit = importAddressByWIF(wif, 'segwit');
        const bech32 = importAddressByWIF(wif, 'bech32');

        if (!legacy && !segwit && !bech32) {
            Alert.alert("Error", "Invalid private key (WIF)");
            return;
        }

        // 🔥 STEP 2 — confirm with user
        Alert.alert(
            "Import Private Key",
            "This will add addresses for ALL types (Legacy, SegWit, Bech32) using this key. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Import",
                    onPress: async () => {

                        const newAddresses = {};

                        if (legacy) {
                            newAddresses[legacy] = { index: 0, privateKey: wif, type: 'legacy' };
                        }
                        if (segwit) {
                            newAddresses[segwit] = { index: 0, privateKey: wif, type: 'segwit' };
                        }
                        if (bech32) {
                            newAddresses[bech32] = { index: 0, privateKey: wif, type: 'bech32' };
                        }

                        const mergedAddresses = {
                            ...safeAddresses,
                            ...newAddresses
                        };

                        const newAddressesByType = {
                            ...(walletData.addressesByType || {}),
                            ...(legacy && { legacy }),
                            ...(segwit && { segwit }),
                            ...(bech32 && { bech32 })
                        };

                        try {
                            // ✅ update wallet FIRST
                            updateWalletValues({
                                addresses: mergedAddresses,
                                addressesByType: newAddressesByType,
                                isImported: true,
                                timestamp
                            });

                            // ✅ set correct receive address
                            const currentType =
                                walletData.addressType ||
                                this.props.defaultAddressType ||
                                'bech32';

                            const newReceive =
                                newAddressesByType[currentType] ||
                                bech32 ||
                                segwit ||
                                legacy;

                            setWalletValues({
                                receiveAddress: newReceive,
                                timestamp
                            });

                            // 🔥 refresh tx + balance
                            const newTransactions = await getTransactionHistory(
                                global.socketConnect,
                                mergedAddresses,
                                safeTransactions
                            );

                            updateWalletValues({
                                transactions: newTransactions || {},
                                timestamp
                            });

                            const balance = await getAddressBalance({
                                ...safeTransactions,
                                ...(newTransactions || {})
                            });

                            setWalletValues({
                                balance: balance || 0,
                                timestamp
                            });

                            Alert.alert("Success", "Private key imported successfully");

                            this.cancel();

                        } catch (err) {
                            console.log("IMPORT FLOW ERROR:", err);
                            Alert.alert("Error", "Import failed");
                        }
                    }
                }
            ]
        );
    };

    cancel = async () => {
        Navigation.dismissModal(this.props.componentId);
    }

    render() {

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View enabled behavior="padding" style={[styles.flex, {justifyContent: 'flex-start', alignContent: 'center', flexDirection: 'column', backgroundColor: 'white'}]}>
                    <Image
                        style={{width: responsiveWidth(20), height: responsiveHeight(12), resizeMode: 'contain'}}
                        source={require('assets/icons/logo.png')}
                    />
                    <Text style={{fontSize: 20, marginTop: 10, color: 'black'}}>
                        {global.strings['importKey.title']}
                    </Text>
                    <Text style={{fontSize: 14, color: "gray", textAlign: 'center', marginTop: 10, width: '85%'}}>
                        {global.strings['importKey.subtitle']}
                    </Text>

                    <Divider style={{marginTop: 10, marginBottom: 10, width: '90%'}}/>

                    <Input
                        placeholder={global.strings['importKey.keyInput']}
                        inputStyle={{fontSize: 14, textAlign: 'left'}}
                        containerStyle={{paddingHorizontal: 0, width: '90%'}}
                        onChangeText={(wif) => this.setState({wif})}
                        defaultValue={this.state.wif}
                    />
                    <Text style={{fontSize: 14, color: "gray", textAlign: 'left', marginTop: 5, width: '90%'}}>
                        {global.strings['importKey.keyTooltipText']}
                    </Text>

                    <View style={{position: "absolute", bottom: 10, left: 0, right: 0, justifyContent: 'center', alignItems: 'center'}}>
                        <Button
                            icon={{ name: "check-circle",
                                            size: 14,
                                            type: 'font-awesome',
                                            color: "white" }}

                            title={global.strings["importKey.addButton"]}
                            containerStyle={{width: "90%", justifyContent: 'center'}}
                            buttonStyle={styles.buttonIn}
                            titleStyle={styles.buttonTitleIn}
                            onPress={() => this.add()}
                        />
                        <Button
                            icon={{ name: "times",
                                            size: 14,
                                            type: 'font-awesome',
                                            color: "#ef3b23" }}

                            title={global.strings["importKey.cancelButton"]}
                            type='clear'
                            containerStyle={{width: "90%", marginTop: 10, marginBottom: 10, justifyContent: 'center'}}
                            titleStyle={styles.buttonTitleOut}
                            onPress={() => this.cancel()}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

ImportKeyScreen.propTypes = {
    wallet: PropTypes.shape({}).isRequired
};

export default connectWallet()(ImportKeyScreen);
