/* eslint-disable */
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import { jest } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const mockWdioElement = {
    elementId: 'test-element-id',
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

jest.mock('@wdio/globals', () => ({
    $: jest
        .fn()
        .mockImplementation(
            () => Promise.resolve(mockWdioElement) as unknown as ChainablePromiseElement<WebdriverIO.Element>
        ),
    $$: jest
        .fn()
        .mockImplementation(
            () => Promise.resolve([mockWdioElement]) as unknown as ChainablePromiseArray<WebdriverIO.ElementArray>
        ),
    browser: {
        $: jest.fn(() => Promise.resolve(mockWdioElement) as unknown as ChainablePromiseElement<WebdriverIO.Element>),
        $$: jest.fn(() => Promise.resolve([mockWdioElement]) as unknown as ChainablePromiseArray<WebdriverIO.ElementArray>),
        capabilities: {
            browserName: 'test-browser-name',
        },
    },
}));
