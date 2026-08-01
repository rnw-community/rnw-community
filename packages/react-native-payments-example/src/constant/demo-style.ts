import { StyleSheet } from 'react-native';

export const demoStyle = StyleSheet.create({
    input: {
        borderColor: '#B0B0B0',
        borderWidth: 1,
        color: '#101010',
        minWidth: 110,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'right',
    },
    log: {
        backgroundColor: '#F5F5F5',
        maxHeight: 260,
    },
    logRow: {
        color: '#101010',
        fontSize: 12,
        paddingVertical: 2,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    screen: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    section: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        padding: 12,
    },
    text: {
        color: '#101010',
        fontSize: 14,
    },
    title: {
        color: '#101010',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
