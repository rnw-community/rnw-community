import { isDefined, isString } from '@rnw-community/shared';

import { Component } from '../component/component';

import type { ComponentConfigInterface, ComponentInputArg } from '../type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

/**
 * The page-object base class whose selectors resolve inside a root element, created through `createRootedComponent`, `getRootedComponent`, or `getExtendedRootedComponent`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RootedComponent<T = any> extends Component<T> {
    protected readonly parentElInput: ComponentInputArg;

    constructor(config: ComponentConfigInterface, selectors: T, parentElInput: ComponentInputArg | undefined) {
        if (!isDefined(parentElInput)) {
            throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
        }

        if (!isString(parentElInput) && 'els' in parentElInput) {
            throw new Error('Cannot create RootedComponent from SelectorElement, use .el()');
        }

        if (!isString(parentElInput) && 'then' in parentElInput) {
            throw new Error('Cannot create RootedComponent from ChainablePromiseElement, use string selector or Element');
        }

        super(config, selectors);

        this.parentElInput = parentElInput;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
             
            get(client, field: string, receiver) {
                return client.proxyGet(field, receiver, () => {
                    if (!['then', 'catch', 'finally'].includes(field)) {
                         
                        return Reflect.get(client.RootEl, field, receiver);
                    }

                     
                    return Reflect.get(client, field, receiver);
                });
            },
        });
    }

    /**
     * The root element every child lookup of this component is scoped to.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
     */
    get RootEl(): ChainablePromiseElement {
        return this.config.elSelectorFn(this.parentElInput);
    }

    /**
     * Finds the first element matching the selector inside the root element.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
     */
    override getChildEl(selector: string): ChainablePromiseElement {
        return this.config.elSelectorFn(selector, this.RootEl);
    }

    /**
     * Finds all elements matching the selector inside the root element.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
     */
    override getChildEls(selector: string): ChainablePromiseArray {
        return this.config.elsSelectorFn(selector, this.RootEl);
    }

    /**
     * Finds the element at `idx` among all elements matching the selector inside the root element.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
     */
    override getChildElByIdx(selector: string, idx: number): ChainablePromiseElement {
        return this.config.elsIndexSelectorFn(selector, idx, this.RootEl);
    }
}
