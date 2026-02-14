export const getMethodName = (target: object, propertyKey: string | symbol): string =>
    `${target.constructor.name}::${String(propertyKey)}`;
