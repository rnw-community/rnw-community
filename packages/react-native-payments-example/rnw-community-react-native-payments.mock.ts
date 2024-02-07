jest.mock('react-native', () => ({
    ...jest.requireActual('react-native'),
    TurboModuleRegistry: {
        getEnforcing: jest.fn(),
    },
}));

const mockReactNativePayments = jest.mock('@rnw-community/react-native-payments', () => ({
    ...jest.requireActual('@rnw-community/react-native-payments'),
    PaymentRequest: {
        canMakePayments: jest.fn(),
        abort: jest.fn(),
        show: jest.fn(),
        requestPayment: jest.fn(),
    },
    PaymentResponse: {
        complete: jest.fn(),
        retry: jest.fn(),
    },
}));
