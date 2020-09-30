export interface RequestStateInterface<T, A = void, P = void> {
    data: T;
    isLoading?: boolean;
    args?: A;
    error?: string;
    pagination?: P;
}

// tslint:disable:no-any
export type StateInterface = Record<string, RequestStateInterface<any, any> | any>;

export const requestInitialState: RequestStateInterface<any, any> = {
    data: {},
};

export const requestInitialArrayState: RequestStateInterface<any, any> = {
    data: [],
};
