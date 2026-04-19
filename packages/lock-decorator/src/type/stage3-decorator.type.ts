export type Stage3DecoratorType<TArgs extends readonly unknown[], TResult> = (
    originalMethod: (this: unknown, ...args: TArgs) => Promise<TResult>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => Promise<TResult>>
) => (this: unknown, ...args: TArgs) => Promise<TResult>;
