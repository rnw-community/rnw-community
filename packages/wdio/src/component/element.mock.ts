const elementMethods = {
    testID$: jest.fn(() => Promise.resolve({})),
    testID$$: jest.fn(() => Promise.resolve([{}])),
    testID$$Index: jest.fn(() => Promise.resolve({})),
    click: jest.fn(() => Promise.resolve(void 0)),
    getText: jest.fn(() => Promise.resolve('')),
    isDisplayed: jest.fn(() => Promise.resolve(true)),
    isExisting: jest.fn(() => Promise.resolve(true)),
    waitForExist: jest.fn(() => Promise.resolve(void 0)),
    waitForDisplayed: jest.fn(() => Promise.resolve(void 0)),
    waitForEnabled: jest.fn(() => Promise.resolve(void 0)),
    setValue: jest.fn(() => Promise.resolve(void 0)),
};

export const mockElement = {
    ...elementMethods,
    click: jest.fn(() => Promise.resolve(void 0)),
    testID$: jest.fn(() => Promise.resolve(elementMethods)),
    testID$$: jest.fn(() => Promise.resolve([elementMethods])),
    testID$$Index: jest.fn(() => Promise.resolve(elementMethods)),
};
