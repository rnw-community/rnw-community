export interface LoadingStateInterface {
    error: string;
    isLoading: boolean;
    isPristine: boolean;
}

export const initialLoadingState: LoadingStateInterface = {
    isPristine: true,
    isLoading: false,
    error: '',
};
