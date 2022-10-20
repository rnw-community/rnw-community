import { isDefined, isNotEmptyString, isString } from '@rnw-community/shared';

import { Component } from '../component/component';

import type { ComponentConfigInterface, ComponentInputArg } from '../type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RootedComponent<T = any> extends Component<T> {
    protected readonly parentElInput: ComponentInputArg;

    constructor(config: ComponentConfigInterface, selectors: Enum<T>, parentElInput: ComponentInputArg | undefined) {
        if (!isDefined(parentElInput)) {
            throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
        }

        if (!isString(parentElInput) && 'els' in parentElInput) {
            throw new Error('Cannot create RootedComponent from SelectorElement, use .el()');
        }

        if (!isString(parentElInput) && 'then' in parentElInput) {
            throw new Error(
                'Cannot create RootedComponent from ChainablePromiseElement, use string selector or WebdriverIO.Element'
            );
        }

        super(config, selectors);

        this.parentElInput = parentElInput;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                return client.proxyGet(field, receiver, () => {
                    if (!['then', 'catch', 'finally'].includes(field)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(client.RootEl, field, receiver);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                });
            },
        });
    }

    get RootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.config.elSelectorFn(this.parentElInput);
        }

        return $(this.parentElInput);
    }

    override getChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.config.elSelectorFn(selector, this.RootEl);
    }

    override getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.config.elsSelectorFn(selector, this.RootEl);
    }
}
