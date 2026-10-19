import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    BottomChromeInsetProvider,
    ScreenChromeFooter,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useBottomChromeInset,
    useScreenChromeHeaderMetrics,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

const MessageComposer = ({ onSend }: { readonly onSend: (message: string) => void }) => {
    const [message, setMessage] = useState('');

    return (
        <View style={styles.composer}>
            <TextInput
                onChangeText={setMessage}
                placeholder="Message"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={styles.composerInput}
                testID="keyboard-demo-input"
                value={message}
            />
            <Pressable accessibilityRole="button" onPress={() => void onSend(message)} testID="keyboard-demo-send">
                <Text style={styles.footerLabel}>Send</Text>
            </Pressable>
        </View>
    );
};

const KeyboardDemoContent = () => {
    const [lastSent, setLastSent] = useState('');
    const insets = useSafeAreaInsets();
    const headerTotalHeight = useScreenChromeHeaderMetrics();
    const { chromeHeight } = useBottomChromeInset();

    return (
        <>
            <ChromeDemoList
                contentInsetBottom={chromeHeight}
                contentInsetTop={headerTotalHeight}
                testID="keyboard-demo-scroll"
            />
            <ScreenChromeHeader style={styles.headerBackdrop} testID="keyboard-demo-header">
                <Text style={styles.slotText} testID="keyboard-demo-last-sent">
                    {lastSent === '' ? 'Nothing sent' : `Sent: ${lastSent}`}
                </Text>
            </ScreenChromeHeader>
            <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }} style={styles.keyboardFooterAnchor}>
                <ScreenChromeFooter style={styles.keyboardFooter} testID="keyboard-demo-footer">
                    <MessageComposer onSend={setLastSent} />
                </ScreenChromeFooter>
            </KeyboardStickyView>
        </>
    );
};

export const KeyboardDemoScreen = () => (
    <ScreenChromeProvider>
        <BottomChromeInsetProvider>
            <ScreenChromeFrame>
                <KeyboardDemoContent />
            </ScreenChromeFrame>
        </BottomChromeInsetProvider>
    </ScreenChromeProvider>
);
