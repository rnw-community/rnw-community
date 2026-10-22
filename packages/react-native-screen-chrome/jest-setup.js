require('react-native-reanimated').setUpTests();

jest.mock('expo', () => ({ requireNativeView: () => 'ScreenChromeProgressiveBlurView' }));
