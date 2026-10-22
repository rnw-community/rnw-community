import { StyleSheet } from 'react-native';

export const CHROME_DEMO_STYLES = StyleSheet.create({
    composer: {
        alignItems: 'center',
        backgroundColor: '#1B4D3E',
        borderRadius: 24,
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    composerInput: {
        color: '#FFFFFF',
        flex: 1,
        fontSize: 16,
        minHeight: 44,
    },
    demoScreen: {
        flex: 1,
    },
    footerContent: {
        alignItems: 'center',
        backgroundColor: '#1B4D3E',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginVertical: 8,
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
        gap: 12,
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
    itemDetailDark: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemTitleDark: {
        color: '#FFFFFF',
    },
    keyboardFooter: {
        position: 'relative',
    },
    keyboardFooterAnchor: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 3,
    },
    list: {
        flex: 1,
    },
    listContent: {
        gap: 2,
    },
    screenDark: {
        backgroundColor: '#101412',
    },
    screenLight: {
        backgroundColor: '#FFFFFF',
    },
    slotText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    tab: {
        alignItems: 'center',
        borderRadius: 22,
        flex: 1,
        justifyContent: 'center',
        minHeight: 44,
    },
    tabBar: {
        backgroundColor: '#1B4D3E',
        borderRadius: 28,
        flexDirection: 'row',
        padding: 6,
    },
    tabBarAnchor: {
        marginHorizontal: 32,
        marginVertical: 8,
    },
    tabSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});
