import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { wdioElementChainByRef } from '../../util';
import { Component } from '../component/component';
import { findEnumRootSelector } from '../util';

import type { ComponentConfigInterface, ComponentInputArg } from '../type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

// TODO: All Root should have all methods from wdio element, can we do this through the proxy?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RootedComponent<T = any> extends Component<T> {
    protected readonly parentElInput: ComponentInputArg;

    constructor(
        config: ComponentConfigInterface,
        public override selectors: Enum<T>,
        selectorOrElement: ComponentInputArg | undefined = findEnumRootSelector(selectors)
    ) {
        if (!isDefined(selectorOrElement)) {
            throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
        }

        super(config, selectors);

        this.parentElInput = selectorOrElement;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                const returnValue = client.proxyGet(field, receiver);

                if (returnValue !== undefined) {
                    return returnValue;
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Reflect.get(client.RootEl, field, receiver);
            },
        });
    }

    get RootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.elSelectorFn(this.parentElInput);
        } else if ('then' in this.parentElInput) {
            return this.parentElInput;
        }

        return wdioElementChainByRef(this.parentElInput);
    }

    override getChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.elSelectorFn(selector, this.RootEl);
    }

    override getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.elsSelectorFn(selector, this.RootEl);
    }

    override getChildElByIdx(selector: string, idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.elsIndexSelectorFn(selector, idx, this.RootEl);
    }
}
