/* eslint-disable @typescript-eslint/explicit-function-return-type,class-methods-use-this,@typescript-eslint/explicit-module-boundary-types,@typescript-eslint/class-methods-use-this */
import { jest } from '@jest/globals';

import type { ComponentConfigInterface } from './type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import './wdio.mock';

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
    getElement: jest.fn(() => Promise.resolve(mockElement)),
} as unknown as WebdriverIO.Element;

export class MockElement<T> extends Promise<T> {
    click() {
        return Promise.resolve(void 0);
    }

    getText() {
        return Promise.resolve('');
    }

    isDisplayed() {
        return Promise.resolve(true);
    }

    isExisting() {
        return Promise.resolve(true);
    }

    waitForExist() {
        return Promise.resolve(void 0);
    }

    waitForDisplayed() {
        return Promise.resolve(void 0);
    }

    waitForEnabled() {
        return Promise.resolve(void 0);
    }

    setValue() {
        return Promise.resolve(void 0);
    }

    getLocation() {
        return Promise.resolve({ x: 0, y: 0 });
    }

    getSize() {
        return Promise.resolve({ width: 0, height: 0 });
    }

    scrollIntoView() {
        return Promise.resolve(void 0);
    }

    parentElement() {
        return Promise.resolve(mockElement);
    }

    getAttribute() {
        return Promise.resolve('');
    }

    testID$() {
        return MockElement.resolve(mockElement);
    }

    testID$$() {
        return MockElement.resolve([mockElement]);
    }

    // eslint-disable-next-line id-length
    $() {
        return MockElement.resolve(mockElement);
    }

    // eslint-disable-next-line id-length
    $$() {
        return MockElement.resolve([mockElement]);
    }
}

const elImplementation = (): ChainablePromiseElement =>
    MockElement.resolve(mockElement) as unknown as ChainablePromiseElement;
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
