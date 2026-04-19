 
export type Stage3DecoratorType<TArgs extends readonly unknown[]> = (
    originalMethod: (this: unknown, ...args: TArgs) => unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => unknown>
) => (this: unknown, ...args: TArgs) => Promise<unknown>;
