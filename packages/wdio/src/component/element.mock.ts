import type { SelectorObject } from './type';

const elementMethods: SelectorObject = {
    click: jest.fn(() => Promise.resolve(void 0)),
    getText: jest.fn(() => Promise.resolve('')),
    isDisplayed: jest.fn(() => Promise.resolve(true)),
    isExisting: jest.fn(() => Promise.resolve(true)),
    waitForExist: jest.fn(() => Promise.resolve(void 0)),
    waitForDisplayed: jest.fn(() => Promise.resolve(void 0)),
    waitForEnabled: jest.fn(() => Promise.resolve(void 0)),
    setValue: jest.fn(() => Promise.resolve(void 0)),
    byIdx: jest.fn(() => Promise.resolve({} as unknown as WebdriverIO.Element)),
    clickByIdx: jest.fn(() => Promise.resolve(void 0)),
    el: jest.fn(() => Promise.resolve({} as unknown as WebdriverIO.Element)),
    els: jest.fn(() => Promise.resolve([{}] as unknown as WebdriverIO.ElementArray)),
    getLocation: jest.fn(() => Promise.resolve({ x: 0, y: 0 })),
    getSize: jest.fn(() => Promise.resolve({ width: 0, height: 0 })),
};

export const mockElement = {
    ...elementMethods,
    click: jest.fn(() => Promise.resolve(void 0)),
    testID$: jest.fn(() => Promise.resolve(elementMethods)),
    testID$$: jest.fn(() => Promise.resolve([elementMethods])),
    testID$$Index: jest.fn(() => Promise.resolve(elementMethods)),
};
