// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Alert,
    ScrollView
} from 'react-native';
import {
    Text,
    Button,
    Divider,
    Input
} from 'react-native-elements';

import {
    pushPasswordGate // ✅ IMPORTANT FIX
} from 'src/navigation';

import { Navigation } from 'react-native-navigation';
import { connectWallet, connectPassword } from 'src/redux';

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
        flexDirection: 'column',
        width: '95%',
    },
    buttonIn: {
        backgroundColor: 'black',
        borderColor: '#6c82cf',
        borderWidth: 2,
        borderRadius: 20,
        margin: 10,
    },
    buttonTitleIn: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    }
});

class ImportWalletScreen extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            seedPhrase: [],
            wifKey: "",
            title: "",
            timestamp: 0
        };

        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: global.strings['importWallet.title']
                },
                visible: true,
            }
        });

        Navigation.events().bindComponent(this);
    }

    componentDidMount() {
        this.modalDismissedListener =
            Navigation.events().registerModalDismissedListener(() => {});
    }

    componentWillUnmount() {
        if (this.modalDismissedListener) {
            this.modalDismissedListener.remove();
        }
    }

    // -----------------------------
    // WARNING / CONFIRMATION
    // -----------------------------
    warningPopUp = () => {
        const { seedPhrase, wifKey, title } = this.state;

        const processedSeedPhrase = seedPhrase.filter(str => str !== "");
        const isWif = wifKey && wifKey.trim().length > 0;

        // VALIDATION

        if (!isWif && processedSeedPhrase.length < 12) {
            Alert.alert(
                global.strings['importWallet.title'],
                global.strings['importWallet.invalidSeedAlert'],
                [{ text: "OK" }],
                { cancelable: false }
            );
            return;
        }

        if (isWif && wifKey.trim().length < 20) {
            Alert.alert(
                "Invalid Private Key",
                "Please enter a valid WIF/private key.",
                [{ text: "OK" }],
                { cancelable: false }
            );
            return;
        }

        if (title.length < 3) {
            Alert.alert(
                global.strings['importWallet.title'],
                global.strings['importWallet.invalidTitle'],
                [{ text: "OK" }],
                { cancelable: false }
            );
            return;
        }

        // WARNING

        Alert.alert(
            "⚠️ IMPORT WALLET WARNING",
            isWif
                ? "You are importing a PRIVATE KEY (WIF).\n\n" +
                  "This will REPLACE your current wallet.\n\n" +
                  "• Your current address will no longer be used\n" +
                  "• A new address will be derived from this key\n" +
                  "• All balances & transactions will switch\n\n" +
                  "Make sure your current wallet is backed up before continuing."
                : global.strings['importWallet.walletImportAlert'],

            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {
                        Navigation.pop(this.props.componentId);
                    }
                },
                {
                    text: isWif
                        ? "Import Private Key"
                        : global.strings['importWallet.importWalletButton'],
                    onPress: () => this.openPasswordScreen(title, processedSeedPhrase)
                }
            ],
            { cancelable: false }
        );
    };

    // -----------------------------
    // IMPORT HANDLER (FIXED)
    // -----------------------------
    openPasswordScreen = (title, processedSeedPhrase) => {
        const { setWalletValues, addNewWallet } = this.props;
        const { wifKey } = this.state;

        const timestamp = parseInt(new Date() / 1000);

        this.setState({ timestamp });

        addNewWallet({ timestamp });

        if (wifKey && wifKey.trim().length > 0) {
            setWalletValues({
                wifKey: wifKey.trim(),
                title,
                timestamp,
                type: "wif"
            });
        } else {
            setWalletValues({
                seedPhrase: processedSeedPhrase,
                title,
                timestamp,
                type: "seed"
            });
        }

        // ✅ CRITICAL FIX (DO NOT CHANGE)
        pushPasswordGate(0, timestamp);
    };

    // -----------------------------
    // RENDER
    // -----------------------------
    render() {
        const { title } = this.state;

        return (
            <View style={styles.flex}>
                <ScrollView style={{ width: '100%', flex: 1 }}>

                    <View style={styles.basicContainer}>

                        <Text h4 style={{ fontWeight: 'bold', color: 'black' }}>
                            {global.strings['importWallet.seedSubtitle']}
                        </Text>

                        <Divider style={{ height: 1, backgroundColor: 'gray', marginVertical: 10 }} />

                        {/* SEED INPUT */}
                        <Input
                            placeholder={global.strings['importWallet.seedInput']}
                            multiline
                            autoCorrect={false}
                            autoCapitalize="none"
                            containerStyle={{ flex: 1, minHeight: 75 }}
                            onChangeText={(text) =>
                                this.setState({ seedPhrase: text.split(" ") })
                            }
                        />

                        <Divider style={{ height: 1, backgroundColor: '#f0eff5', marginVertical: 10 }} />

                        {/* WIF INPUT
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>
                            Import WIF / Private Key (optional)
                        </Text>

                        <Input
                            placeholder="Enter WIF private key"
                            multiline
                            autoCorrect={false}
                            autoCapitalize="none"
                            containerStyle={{ flex: 1, minHeight: 75 }}
                            onChangeText={(text) =>
                                this.setState({ wifKey: text })
                            }
                        />

                        <Divider style={{ height: 1, backgroundColor: '#f0eff5', marginVertical: 10 }} /> */}

                        {/* TITLE */}
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>
                            {global.strings['importWallet.walletTitle']}
                        </Text>

                        <Input
                            placeholder={global.strings['importWallet.walletTitleExampleInput']}
                            value={title}
                            onChangeText={(title) => this.setState({ title })}
                        />

                    </View>

                    <Text style={{
                        width: '90%',
                        marginTop: 10,
                        fontSize: 12,
                        color: 'black',
                        alignSelf: 'center'
                    }}>
                        {global.strings['importWallet.tooltipText']}
                    </Text>

                </ScrollView>

                <View style={{
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    right: 0,
                    alignItems: 'center'
                }}>
                    <Button
                        title={global.strings['importWallet.nextButton']}
                        buttonStyle={styles.buttonIn}
                        titleStyle={styles.buttonTitleIn}
                        onPress={() => this.warningPopUp()}
                    />
                </View>
            </View>
        );
    }
}

ImportWalletScreen.propTypes = {
    wallet: PropTypes.shape({}).isRequired
};

export default connectPassword()(connectWallet()(ImportWalletScreen));