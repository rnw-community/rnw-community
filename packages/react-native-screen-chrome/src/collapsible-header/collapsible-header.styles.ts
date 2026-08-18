import { StyleSheet } from 'react-native';

export const collapsibleHeaderStyles = StyleSheet.create({
    container: {
        zIndex: 3,
    },
    persistentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        width: '100%',
    },
    titleSpacer: {
        flex: 1,
    },
    titleLayer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 72,
    },
});
