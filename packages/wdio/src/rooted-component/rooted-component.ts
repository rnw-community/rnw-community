import { isDefined, isNotEmptyString, isString } from '@rnw-community/shared';

import { Component } from '../component/component';
import { wdioElementChainByRef } from '../util';

import type { ComponentConfigInterface, ComponentInputArg } from '../type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

// TODO: All Root should have all methods from wdio element, can we do this through the proxy?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RootedComponent<T = any> extends Component<T> {
    protected readonly parentElInput: ComponentInputArg;

    constructor(config: ComponentConfigInterface, public override selectors: Enum<T>, selectorOrElement: ComponentInputArg) {
        if (!isDefined(selectorOrElement)) {
            throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
        }

        if (!isString(selectorOrElement) && 'els' in selectorOrElement) {
            throw new Error('Cannot create RootedComponent from SelectorElement, use .el()');
        }

        super(config, selectors);

        this.parentElInput = selectorOrElement;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                return client.proxyGet(field, receiver, () => {
                    if (!['then', 'catch', 'finally'].includes(field)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(client.getRootEl(), field, receiver);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                });
            },
        });
    }

    get RootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        return this.getRootEl();
    }

    override getChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.getRootEl().then(rootEl =>
            this.elSelectorFn(selector, rootEl)
        ) as ChainablePromiseElement<WebdriverIO.Element>;
    }

    override getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.getRootEl().then(rootEl =>
            this.elsSelectorFn(selector, rootEl)
        ) as ChainablePromiseArray<WebdriverIO.ElementArray>;
    }

    override getChildElByIdx(selector: string, idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.getRootEl().then(rootEl =>
            this.elsIndexSelectorFn(selector, idx, rootEl)
        ) as ChainablePromiseElement<WebdriverIO.Element>;
    }

    private getRootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.elSelectorFn(this.parentElInput);
        } else if ('then' in this.parentElInput) {
            return this.parentElInput;
        }

        return wdioElementChainByRef(this.parentElInput);
    }
}
