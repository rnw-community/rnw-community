import { StyleSheet } from 'react-native';

export const SettingsDemoStyles = StyleSheet.create({
    header: {
        backgroundColor: '#F5F6FA',
    },
    headerBackground: {
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E2E4EE',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconButton: {
        alignItems: 'center',
        backgroundColor: '#E8EAF6',
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    iconLabel: {
        color: '#3F51B5',
        fontSize: 16,
        fontWeight: '600',
    },
    iconRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    item: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
    },
    itemLabel: {
        color: '#1A1A2E',
        fontSize: 15,
    },
    itemValue: {
        color: '#8A8FA3',
        fontSize: 15,
    },
    largeTitle: {
        color: '#1A1A2E',
        fontSize: 34,
        fontWeight: '700',
    },
    largeTitleSlot: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 8,
        paddingHorizontal: 20,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 32,
    },
    safeArea: {
        backgroundColor: '#F5F6FA',
        flex: 1,
    },
    screen: {
        backgroundColor: '#F5F6FA',
        flex: 1,
    },
    smallTitle: {
        color: '#1A1A2E',
        fontSize: 17,
        fontWeight: '600',
    },
    smallTitleRow: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
