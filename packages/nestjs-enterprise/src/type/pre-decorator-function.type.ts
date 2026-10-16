/**
 * A spread-form callback computing a value, such as lock resource keys, from the decorated method's own arguments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/readme.md#types
 */
export type PreDecoratorFunction<TArgs extends unknown[], TResult = string> = (...args: TArgs) => TResult;
