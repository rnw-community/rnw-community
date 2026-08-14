import { StyleSheet } from 'react-native';

export const HeaderDemoStyles = StyleSheet.create({
    actionButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    actionLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    actionsRow: {
        alignItems: 'flex-start',
        columnGap: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
    },
    collapsedAmount: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    collapsedLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    collapsedRow: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 64,
    },
    detailsBackButton: {
        backgroundColor: '#3F51B5',
        borderRadius: 12,
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    detailsBackLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    detailsSafeArea: {
        backgroundColor: '#F5F6FA',
        flex: 1,
    },
    detailsScreen: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    detailsTitle: {
        color: '#1A1A2E',
        fontSize: 28,
        fontWeight: '700',
    },
    expandedAmount: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '700',
    },
    expandedBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 28,
        height: 56,
        marginBottom: 12,
        width: 56,
    },
    expandedSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginTop: 4,
    },
    expandedSummary: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        backgroundColor: '#3F51B5',
    },
    headerBackground: {
        backgroundColor: '#303F9F',
    },
    item: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
    },
    itemLabel: {
        color: '#1A1A2E',
        fontSize: 15,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 32,
    },
    safeArea: {
        backgroundColor: '#3F51B5',
        flex: 1,
    },
    screen: {
        backgroundColor: '#F5F6FA',
        flex: 1,
    },
});
