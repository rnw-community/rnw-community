import { jest } from '@jest/globals';

import type { ComponentConfigInterface } from './type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import './wdio.mock';

export class MockElementPromise<T> extends Promise<T> {}

const mockElementMethods = {
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
    scrollIntoView: jest.fn(() => Promise.resolve(void 0)),
    getAttribute: jest.fn(() => Promise.resolve('')),
    getElement: jest.fn((): Promise<unknown> => Promise.resolve(mockElementMethods)),
    parentElement: jest.fn((): Promise<unknown> => Promise.resolve(mockElementMethods)),
    testID$: jest.fn((): unknown => MockElementPromise.resolve(mockElementMethods)),
    testID$$: jest.fn((): unknown => MockElementPromise.resolve([mockElementMethods])),
    // eslint-disable-next-line id-length
    $: jest.fn((): unknown => MockElementPromise.resolve(mockElementMethods)),
    $$: jest.fn((): unknown => MockElementPromise.resolve([mockElementMethods])),
};

export const mockElement = mockElementMethods as unknown as WebdriverIO.Element;

void Object.assign(MockElementPromise.prototype, mockElementMethods);

const elImplementation = (): ChainablePromiseElement =>
    MockElementPromise.resolve(mockElement) as unknown as ChainablePromiseElement;
const elsImplementation = (): ChainablePromiseArray => Promise.resolve([mockElement]) as unknown as ChainablePromiseArray;

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

jest.mock('./config/default$-component.config', () => ({ default$ComponentConfig: () => mockDefault$Config }));
jest.mock('./config/default-component.config', () => ({ defaultComponentConfig: () => mockDefaultConfig }));
jest.mock('./command/el.command', () => ({ el$: jest.fn(elImplementation) }));
jest.mock('./command/els.command', () => ({ els$: jest.fn(elsImplementation) }));
