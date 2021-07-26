export interface LoadingStateInterface {
    isPristine: boolean;
    isLoading: boolean;
    error: string;
}

export const initialLoadingState: LoadingStateInterface = {
    isPristine: true,
    isLoading: false,
    error: '',
};
