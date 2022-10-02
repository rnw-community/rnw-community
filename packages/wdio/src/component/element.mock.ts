import type { ComponentConfigInterface } from './type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
} as unknown as WebdriverIO.Element;

const elImplementation = (): ChainablePromiseElement<WebdriverIO.Element> =>
    Promise.resolve(mockElement) as unknown as ChainablePromiseElement<WebdriverIO.Element>;
const elsImplementation = (): ChainablePromiseArray<WebdriverIO.ElementArray> =>
    Promise.resolve([mockElement]) as unknown as ChainablePromiseArray<WebdriverIO.ElementArray>;

export const mockDefaultConfig: ComponentConfigInterface = {
    elSelectorFn: jest.fn(elImplementation),
    elsSelectorFn: jest.fn(elsImplementation),
    elsIndexSelectorFn: jest.fn(elImplementation),
};
export const mockDefault$Config: ComponentConfigInterface = {
    elSelectorFn: jest.fn(elImplementation),
    elsSelectorFn: jest.fn(elsImplementation),
    elsIndexSelectorFn: jest.fn(elImplementation),
};

jest.mock('./default$-component.config', () => ({ default$ComponentConfig: () => mockDefault$Config }));
jest.mock('./default-component.config', () => ({ defaultComponentConfig: () => mockDefaultConfig }));
jest.mock('../command/el.command', () => ({ el$: jest.fn(elImplementation) }));
jest.mock('../command/els.command', () => ({ els$: jest.fn(elsImplementation) }));
jest.mock('../util/wdio-element-chain-by-ref/wdio-element-chain-by-ref.util', () => ({
    wdioElementChainByRef: jest.fn(elImplementation),
}));
