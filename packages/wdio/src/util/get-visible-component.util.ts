import { VisibleComponent } from '../component';

// TODO: Improve typings with Enum, improve ts errors?

// @ts-expect-error We ignore prefix, how we can avoid TS error?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SelectorMethods<T extends string, S extends string> = T extends `${infer Prefix}.${infer Selector}`
    ? Selector extends `Root`
        ? never
        : `${Selector}${S}`
    : never;

type VisibleComponentWithSelectors<T extends string> = VisibleComponent & {
    [TKey in SelectorMethods<T, 'El'>]: Promise<WebdriverIO.Element>;
} & { [TKey in SelectorMethods<T, 'Els'>]: Promise<WebdriverIO.ElementArray> };

type VisibleComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement: WebdriverIO.Element | string
) => VisibleComponentWithSelectors<T>;

export const getVisibleComponent = <T extends string, E = unknown>(selectors: E): VisibleComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends VisibleComponent {
        private readonly selectorKeys = Object.keys(selectors) as Array<keyof T>;

        constructor(selectorOrElement: WebdriverIO.Element | string) {
            super(selectorOrElement);

            // eslint-disable-next-line no-constructor-return
            return new Proxy(this, {
                // @ts-expect-error field is required to be string or a symbol, we need it to be keyof TController for proper typings inside
                get(proxyClient, field: keyof T, receiver) {
                    if (field in proxyClient) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(proxyClient, field, receiver);
                    }

                    if (field in proxyClient.selectorKeys) {
                        if ((field as string).includes('Els')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.getChildEls(selectors[field]);
                        } else if ((field as string).includes('El')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.getChildEl(selectors[field]);
                        }
                    }

                    return undefined;
                },
            });
        }
    };
