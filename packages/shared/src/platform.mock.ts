jest.mock('react-native', () => ({
    Platform: {
        OS: 'no',
    },
}));
