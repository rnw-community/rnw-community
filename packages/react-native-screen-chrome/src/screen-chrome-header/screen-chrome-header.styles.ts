import { StyleSheet } from 'react-native';

export const screenChromeHeaderStyles = StyleSheet.create({
    container: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 3,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        width: '100%',
    },
});
