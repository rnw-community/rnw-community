import { StyleSheet } from 'react-native';

export const CHROME_DEMO_STYLES = StyleSheet.create({
    demoScreen: {
        flex: 1,
    },
    footerBand: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 3,
    },
    footerContent: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    footerLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerBackdrop: {
        backgroundColor: '#1B4D3E',
        flex: 1,
    },
    homeButton: {
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#1B4D3E',
        borderRadius: 12,
        justifyContent: 'center',
        marginHorizontal: 16,
        minHeight: 52,
        paddingHorizontal: 16,
    },
    homeButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    homeContainer: {
        flex: 1,
        gap: 16,
        justifyContent: 'center',
    },
    homeTitle: {
        fontSize: 28,
        fontWeight: '700',
        paddingBottom: 8,
        textAlign: 'center',
    },
    itemContainer: {
        borderBottomColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    itemDetail: {
        color: 'rgba(0, 0, 0, 0.55)',
        fontSize: 13,
        marginTop: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    list: {
        flex: 1,
    },
    listContent: {
        gap: 2,
        paddingBottom: 120,
        paddingTop: 8,
    },
    slotText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
