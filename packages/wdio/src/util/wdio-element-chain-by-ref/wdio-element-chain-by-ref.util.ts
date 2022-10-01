import type { ChainablePromiseElement } from 'webdriverio';

export const wdioElementChainByRef = (element: WebdriverIO.Element): ChainablePromiseElement<WebdriverIO.Element> =>
    $({ 'element-6066-11e4-a52e-4f735466cecf': element.elementId });
