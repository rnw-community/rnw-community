/* eslint-disable */
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import { jest } from '@jest/globals';

 
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
    $: jest.fn().mockImplementation(() => Promise.resolve(mockWdioElement) as unknown as ChainablePromiseElement),
    $$: jest.fn().mockImplementation(() => Promise.resolve([mockWdioElement]) as unknown as ChainablePromiseArray),
    browser: {
        $: jest.fn(() => Promise.resolve(mockWdioElement) as unknown as ChainablePromiseElement),
        $$: jest.fn(() => Promise.resolve([mockWdioElement]) as unknown as ChainablePromiseArray),
        capabilities: {
            browserName: 'test-browser-name',
        },
    },
}));
