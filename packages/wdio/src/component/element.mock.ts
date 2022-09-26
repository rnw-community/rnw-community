export const mockDefaultConfig = {
    elSelectorFn: jest.fn(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element)),
    elsSelectorFn: jest.fn(() => Promise.resolve([mockElement] as unknown as WebdriverIO.ElementArray)),
    elsIndexSelectorFn: jest.fn(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element)),
};

export const mockElement = {
    click: jest.fn(() => Promise.resolve(void 0)),
    getText: jest.fn(() => Promise.resolve('')),
    isDisplayed: jest.fn(() => Promise.resolve(true)),
    isExisting: jest.fn(() => Promise.resolve(true)),
    waitForExist: jest.fn(() => Promise.resolve(void 0)),
    waitForDisplayed: jest.fn(() => Promise.resolve(void 0)),
    waitForEnabled: jest.fn(() => Promise.resolve(void 0)),
    setValue: jest.fn(() => Promise.resolve(void 0)),
    getLocation: jest.fn(() => Promise.resolve({ x: 0, y: 0 })),
    getSize: jest.fn(() => Promise.resolve({ width: 0, height: 0 })),
};

jest.mock('./default$-component.config', () => ({ default$ComponentConfig: mockDefaultConfig }));
jest.mock('./default-component.config', () => ({ defaultComponentConfig: mockDefaultConfig }));
