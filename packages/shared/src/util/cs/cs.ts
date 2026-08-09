type StyleType = Record<string, unknown>[] | object | false | null | undefined;

export const cs = (condition: boolean, trueStyle: StyleType, falseStyle?: StyleType): StyleType =>
    condition ? trueStyle : (falseStyle ?? {});
