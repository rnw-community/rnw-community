export interface ExecutionContextInterface<TArgs extends readonly unknown[] = readonly unknown[]> {
    readonly className: string;
    readonly methodName: string;
    readonly args: TArgs;
    readonly logContext: string;
}
