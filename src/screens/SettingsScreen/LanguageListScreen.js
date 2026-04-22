// @flow

import React, { PureComponent } from 'react';
import {
    StyleSheet,
    View,
    ScrollView
} from 'react-native';
import {
    ListItem
} from 'react-native-elements';
import { Navigation } from 'react-native-navigation';
import { connectWallet } from 'src/redux';
import { initialNav } from 'src/navigation';
import { getLanguageInfo } from 'src/utils/WalletUtils';

const styles = StyleSheet.create({
    flex: {
        flex: 1
    }
});

class LanguageListScreen extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            languageCode: global.strings.getLanguage()
        };

        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                largeTitle: {
                    visible: false,
                    noBorder: true,
                    fontSize: 30,
                    fontFamily: 'HelveticaBold',
                    color: 'white',
                },
                title: {
                    text: global.strings['languageList.title']
                },
                rightButtons: [
                    {
                        color: 'white',
                        id: 'done',
                        text: global.strings["languageList.doneButton"]
                    }
                ],
                visible: true,
            }
        });

        Navigation.events().bindComponent(this);
    }

    navigationButtonPressed = ({ buttonId }) => {
        if (buttonId === 'done') {
            this.done();
        }
    };

    chooseLanguage = (languageCode) => {
        this.setState({ languageCode });
    };

    done = () => {
        const { setDefaultValues, settingsComponentId, componentId } = this.props;
        const { languageCode } = this.state;

        setDefaultValues({ defaultLanguage: languageCode });

        Navigation.dismissModal(componentId).then(() => {
            if (languageCode !== global.strings.getLanguage()) {
                Navigation.dismissModal(settingsComponentId);
                initialNav();
            }
        });
    };

    render() {
        const { languageCode } = this.state;
        const languages = global.strings.getAvailableLanguages();

        const list = (languages || [])
            .map((code) => {
                const language = getLanguageInfo(code) || getLanguageInfo(code.split('-')[0]);

                return {
                    language,
                    languageCode: code,
                    isChecked: languageCode === code,
                    onPress: () => this.chooseLanguage(code),
                };
            })
            .filter(item => item.language); // 🚨 prevents null crashes completely

        return (
            <View style={styles.flex}>
                <ScrollView>
                    {list.map((item, i) => (
                        <ListItem
                            key={`${item.languageCode}-${i}`}
                            onPress={item.onPress}
                            bottomDivider
                        >
                            <ListItem.Content>

                                <ListItem.Title style={{ color: 'black' }}>
                                    {item.language?.name || item.languageCode}
                                </ListItem.Title>

                                <ListItem.Subtitle style={{ fontSize: 12, color: 'gray' }}>
                                    {item.language?.nativeName || ''}
                                </ListItem.Subtitle>

                            </ListItem.Content>

                            {item.isChecked && (
                                <ListItem.CheckBox
                                    checked
                                    onPress={item.onPress}
                                />
                            )}
                        </ListItem>
                    ))}
                </ScrollView>
            </View>
        );
    }
}

export default connectWallet()(LanguageListScreen);